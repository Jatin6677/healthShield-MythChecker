import { normalizeClaim } from './normalizeClaim.js';

/**
 * Try to match a student's typed claim to a verified row from Google Sheets.
 *
 * Important safety rules:
 * 1. We only accept an EXACT cleaned match of the main claim or an approved extra phrase.
 * 2. We do NOT count shared keywords. "water" should not match a long water fact.
 * 3. If two different rows match and they disagree (FACT vs MYTH), we say NOT SURE.
 * 4. If nothing matches, we say NOT SURE. We never invent a medical answer.
 */
export function matchClaim(userInput, claims) {
  const normalizedUser = normalizeClaim(userInput);

  if (!normalizedUser) {
    return { status: 'invalid' };
  }

  if (!Array.isArray(claims) || claims.length === 0) {
    return { status: 'not_sure', reason: 'unmatched' };
  }

  const matches = [];

  for (const record of claims) {
    if (!record || typeof record !== 'object') {
      continue;
    }

    const phrases = [record.claim, ...(record.alternativeClaims || [])];
    const cleanedPhrases = phrases.map(normalizeClaim).filter(Boolean);

    if (cleanedPhrases.includes(normalizedUser)) {
      matches.push(record);
    }
  }

  if (matches.length === 0) {
    return { status: 'not_sure', reason: 'unmatched' };
  }

  const verdicts = new Set(
    matches.map((item) => String(item.verdict || '').trim().toUpperCase()),
  );

  // Two trusted rows disagree, so a computer should not pick a winner.
  if (verdicts.size > 1) {
    return { status: 'not_sure', reason: 'ambiguous', matches };
  }

  const verdict = [...verdicts][0];
  if (verdict !== 'FACT' && verdict !== 'MYTH') {
    return { status: 'not_sure', reason: 'unmatched' };
  }

  // Prefer the row whose main Claim column matches, if we have more than one.
  const best =
    matches.find((item) => normalizeClaim(item.claim) === normalizedUser) ||
    matches[0];

  return { status: 'matched', record: best };
}
