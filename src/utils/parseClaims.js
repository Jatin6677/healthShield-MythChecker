
import { splitAlternativeClaims } from './normalizeClaim.js';

/**
 * Converts Google Apps Script records into the format
 * expected by the HealthShield AI frontend.
 *
 * Matches the existing Apps Script response:
 * id, category, myth, fact, explanation,
 * keywords, source, sourceUrl
 */
function cleanRecord(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // Apps Script returns "myth", not "claim".
  const claim = String(raw.myth || raw.claim || '').trim();
  const explanation = String(raw.explanation || '').trim();

  // Apps Script returns fact as "TRUE" or "FALSE".
  const rawFact = String(
    raw.fact ?? raw.verdict ?? ''
  ).trim().toUpperCase();

  let verdict;

  if (rawFact === 'TRUE' || rawFact === 'FACT') {
    verdict = 'FACT';
  } else if (rawFact === 'FALSE' || rawFact === 'MYTH') {
    verdict = 'MYTH';
  } else {
    return null;
  }

  if (!claim || !explanation) {
    return null;
  }

  // Apps Script returns "source" and "sourceUrl".
  const source = String(
    raw.source || raw.sourceName || ''
  ).trim();

  const rawSourceUrl = String(raw.sourceUrl || '').trim();

  // Keep the claim even if its URL is missing or invalid.
  let sourceUrl = '';

  if (rawSourceUrl) {
    try {
      const url = new URL(rawSourceUrl);

      if (url.protocol === 'https:') {
        sourceUrl = url.href;
      }
    } catch {
      sourceUrl = '';
    }
  }

  // Apps Script returns keywords as an array.
  const parsedKeywords = Array.isArray(raw.keywords)
    ? raw.keywords
    : splitAlternativeClaims(raw.keywords || '');

  const keywords = Array.isArray(parsedKeywords)
    ? parsedKeywords
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  // Alternative claims are optional and aren't returned
  // by the current Apps Script.
  const parsedAlternatives = Array.isArray(raw.alternativeClaims)
    ? raw.alternativeClaims
    : splitAlternativeClaims(raw.alternativeClaims || '');

  const alternativeClaims = Array.isArray(parsedAlternatives)
    ? parsedAlternatives
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  return {
    id: String(raw.id || raw.Myth_ID || claim),
    claim,
    alternativeClaims,
    keywords,
    category: String(raw.category || 'General').trim() || 'General',
    verdict,
    explanation,
    sourceName: source || 'Source not provided',
    sourceUrl,
    lastReviewed: String(raw.lastReviewed || '').trim(),
  };
}

/**
 * Validates and normalizes the Apps Script response.
 */
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

  const claims = payload.claims
    .map(cleanRecord)
    .filter(Boolean);

  if (claims.length === 0 && payload.claims.length > 0) {
    throw new Error(
      'No valid health claims were found. Check the Fact and Explanation fields.'
    );
  }

  return claims;
}
