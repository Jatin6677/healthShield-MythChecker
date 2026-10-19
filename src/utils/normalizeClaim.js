
/**
 * Normalize a health claim for matching against the database.
 *
 * This function cleans text only. It does not determine
 * whether a health claim is true or false.
 */
export function normalizeClaim(text) {
  if (text === null || text === undefined) {
    return '';
  }

  return String(text)
    .toLowerCase()
    // Normalize Unicode and remove accent marks.
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Standardize common symbols and punctuation.
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    // Normalize whitespace.
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split alternative claims stored in Google Sheets.
 *
 * Supported separators:
 * | ; and new lines
 *
 * Each phrase is normalized for consistent comparison.
 */
export function splitAlternativeClaims(value) {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  const items = Array.isArray(value)
    ? value
    : String(value).split(/[|;\n]+/);

  return items
    .map((part) => String(part).trim())
    .filter(Boolean);
}

/**
 * Tokenize a normalized claim into words.
 */
export function tokenizeClaim(text) {
  const normalized = normalizeClaim(text);

  return normalized
    ? normalized.split(' ')
    : [];
}

/**
 * Check whether two normalized claims are exactly equivalent
 * after text normalization.
 *
 * This is NOT semantic verification.
 */
export function areClaimsEquivalent(first, second) {
  const normalizedFirst = normalizeClaim(first);
  const normalizedSecond = normalizeClaim(second);

  return (
    normalizedFirst.length > 0 &&
    normalizedSecond.length > 0 &&
    normalizedFirst === normalizedSecond
  );
}
