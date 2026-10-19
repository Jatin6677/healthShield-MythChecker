
import { normalizeClaim } from './normalizeClaim.js';

function getPhrases(record) {
  const alternatives = Array.isArray(record.alternativeClaims)
    ? record.alternativeClaims
    : [];

  return [record.claim, ...alternatives]
    .filter((phrase) => typeof phrase === 'string')
    .map(normalizeClaim)
    .filter(Boolean);
}

function getVerdict(record) {
  const verdict = String(record?.verdict || '')
    .trim()
    .toUpperCase();

  return verdict === 'FACT' || verdict === 'MYTH'
    ? verdict
    : null;
}

/**
 * Exact matching only.
 * Similarity is not proof that two health claims mean the same thing.
 */
export function matchClaim(userInput, claims) {
  const normalizedUser = normalizeClaim(userInput);

  if (!normalizedUser) {
    return { status: 'invalid' };
  }

  if (!Array.isArray(claims) || claims.length === 0) {
    return { status: 'not_sure', reason: 'unmatched' };
  }

  const matches = claims.filter((record) => {
    if (!record || typeof record !== 'object') {
      return false;
    }

    return getPhrases(record).includes(normalizedUser);
  });

  if (matches.length === 0) {
    return { status: 'not_sure', reason: 'unmatched' };
  }

  // Do not issue a verdict if any matched record has an invalid verdict.
  const verdicts = matches.map(getVerdict);

  if (verdicts.some((verdict) => verdict === null)) {
    return {
      status: 'not_sure',
      reason: 'invalid_verdict',
      matches,
    };
  }

  const uniqueVerdicts = new Set(verdicts);

  if (uniqueVerdicts.size > 1) {
    return {
      status: 'not_sure',
      reason: 'ambiguous',
      matches,
    };
  }

  // Prefer an exact match against the main claim.
  const best =
    matches.find(
      (record) => normalizeClaim(record.claim) === normalizedUser,
    ) || matches[0];

  return {
    status: 'matched',
    record: best,
  };
}
