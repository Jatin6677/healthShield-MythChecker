import { splitAlternativeClaims } from './normalizeClaim.js';

/**
 * Keep only safe fields the website needs.
 * Extra spreadsheet columns stay private on Google's side.
 */
function cleanRecord(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const claim = String(raw.claim || '').trim();
  const verdict = String(raw.verdict || '').trim().toUpperCase();
  const explanation = String(raw.explanation || '').trim();
  const sourceName = String(raw.sourceName || '').trim();
  const sourceUrl = String(raw.sourceUrl || '').trim();

  if (!claim || !explanation) {
    return null;
  }

  if (verdict !== 'FACT' && verdict !== 'MYTH') {
    return null;
  }

  // Source links must be real https websites.
  if (!/^https:\/\//i.test(sourceUrl)) {
    return null;
  }

  const alternativeClaims = Array.isArray(raw.alternativeClaims)
    ? raw.alternativeClaims.map((item) => String(item).trim()).filter(Boolean)
    : splitAlternativeClaims(raw.alternativeClaims);

  return {
    id: String(raw.id || claim),
    claim,
    alternativeClaims,
    category: String(raw.category || 'General').trim() || 'General',
    verdict,
    explanation,
    sourceName: sourceName || 'Trusted health source',
    sourceUrl,
    lastReviewed: String(raw.lastReviewed || '').trim(),
  };
}

export function parseClaimsResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('The health list did not look like JSON.');
  }

  if (payload.ok === false) {
    throw new Error(payload.error || 'The health list could not be read.');
  }

  if (!Array.isArray(payload.claims)) {
    throw new Error('The health list was missing claims.');
  }

  return payload.claims.map(cleanRecord).filter(Boolean);
}
