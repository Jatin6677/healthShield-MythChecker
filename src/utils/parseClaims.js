
import { splitAlternativeClaims } from './normalizeClaim.js';

/**
 * Converts Google Apps Script records into the format
 * expected by the HealthShield AI frontend.
 */
function cleanRecord(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // Support both the current Google Sheet fields and older API fields.
  const claim = String(raw.claim || raw.myth || '').trim();
  const explanation = String(raw.explanation || '').trim();

  const rawFact = String(
    raw.fact ?? raw.verdict ?? ''
  ).trim().toUpperCase();

  // Convert Google Sheet true/false into FACT/MYTH.
  let verdict;

  if (rawFact === 'TRUE' || rawFact === 'FACT') {
    verdict = 'FACT';
  } else if (rawFact === 'FALSE' || rawFact === 'MYTH') {
    verdict = 'MYTH';
  } else {
    // Never guess when the spreadsheet value is invalid.
    return null;
  }

  if (!claim || !explanation) {
    return null;
  }

  const source = String(
    raw.sourceName || raw.source || ''
  ).trim();

  const sourceUrl = String(
    raw.sourceUrl || (
      /^https:\/\//i.test(String(raw.source || '').trim())
        ? raw.source
        : ''
    )
  ).trim();

  // Reject invalid non-empty URLs.
  if (sourceUrl && !/^https:\/\//i.test(sourceUrl)) {
    return null;
  }

  const keywords = Array.isArray(raw.keywords)
    ? raw.keywords
    : splitAlternativeClaims(raw.keywords);

  const alternativeClaims = Array.isArray(raw.alternativeClaims)
    ? raw.alternativeClaims
        .map((item) => String(item).trim())
        .filter(Boolean)
    : splitAlternativeClaims(raw.alternativeClaims);

  return {
    id: String(raw.id || raw.Myth_ID || claim),
    claim,
    alternativeClaims,
    keywords: keywords
      .map((item) => String(item).trim())
      .filter(Boolean),
    category: String(raw.category || 'General').trim() || 'General',
    verdict,
    explanation,
    sourceName: source || 'Source not provided',
    sourceUrl,
    lastReviewed: String(raw.lastReviewed || '').trim(),
  };
}

export function parseClaimsResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('The health list did not look like JSON.');
  }

  if (payload.ok === false) {
    throw new Error(
      payload.error || 'The health list could not be read.'
    );
  }

  if (!Array.isArray(payload.claims)) {
    throw new Error('The health list was missing claims.');
  }

  const claims = payload.claims.map(cleanRecord).filter(Boolean);

  if (claims.length === 0 && payload.claims.length > 0) {
    throw new Error(
      'No valid health claims were found. Check the Fact and Explanation fields.'
    );
  }

  return claims;
}
