import { normalizeClaim } from './normalizeClaim.js';

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
const MIN_SIMILARITY = 0.58;
const MIN_MARGIN = 0.035;

let extractorPromise;
let cachedIndexKey = '';
let cachedIndexPromise;

function getExtractor(onStatus) {
  if (!extractorPromise) {
    onStatus?.('Downloading the language model for the first check…');
    extractorPromise = import('@huggingface/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', MODEL_ID, {
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            const percent = Math.round(progress.progress || 0);
            onStatus?.(`Downloading the language model… ${percent}%`);
          }
        },
      }),
    );
  }

  return extractorPromise;
}

async function embed(extractor, text) {
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true,
  });
  return output.data;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function makeIndexKey(records) {
  return records
    .map((record) => `${record.id}:${record.claim}:${(record.alternativeClaims || []).join('|')}`)
    .join('\n');
}

async function buildIndex(records, extractor) {
  const entries = [];
  for (const record of records) {
    const phrases = [record.claim, ...(record.alternativeClaims || [])]
      .map((phrase) => String(phrase || '').trim())
      .filter(Boolean);
    const vectors = await Promise.all(phrases.map((phrase) => embed(extractor, phrase)));
    entries.push({ record, vectors });
  }
  return entries;
}

/** Find semantically similar reviewed claims. Embeddings never create verdicts. */
export async function matchClaimSemantically(input, records, onStatus) {
  if (!Array.isArray(records) || records.length === 0) {
    return { status: 'not_sure', reason: 'unmatched' };
  }

  try {
    const extractor = await getExtractor(onStatus);
    onStatus?.('Comparing your claim with reviewed records…');
    const queryVector = await embed(extractor, normalizeClaim(input));
    const indexKey = makeIndexKey(records);
    if (indexKey !== cachedIndexKey) {
      cachedIndexKey = indexKey;
      cachedIndexPromise = buildIndex(records, extractor);
    }
    const index = await cachedIndexPromise;
    const ranked = index
      .map(({ record, vectors }) => ({
        record,
        score: Math.max(...vectors.map((vector) => cosineSimilarity(queryVector, vector))),
      }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const second = ranked[1];
    if (!best || best.score < MIN_SIMILARITY) {
      return { status: 'not_sure', reason: 'unmatched', similarity: best?.score ?? 0 };
    }

    const closeMatches = ranked.filter((item) =>
      item.score >= MIN_SIMILARITY && best.score - item.score < MIN_MARGIN,
    );
    const verdicts = new Set(closeMatches.map((item) => item.record.verdict));
    if (verdicts.size > 1 || (second && second.record.verdict !== best.record.verdict && best.score - second.score < MIN_MARGIN)) {
      return { status: 'not_sure', reason: 'ambiguous' };
    }

    return {
      status: 'matched',
      record: best.record,
      matchType: 'semantic',
      similarity: best.score,
    };
  } catch (error) {
    extractorPromise = undefined;
    cachedIndexKey = '';
    cachedIndexPromise = undefined;
    throw new Error(`Semantic matching could not load its browser model: ${error.message}`);
  }
}
