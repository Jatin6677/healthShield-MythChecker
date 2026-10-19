/**
 * Make a health claim easier to compare.
 *
 * Why we do this:
 * "Vaccines cause autism!" and "vaccines  cause  autism"
 * should be treated as the same sentence.
 *
 * We do NOT guess the meaning. We only clean the letters.
 */
export function normalizeClaim(text) {
  if (text === null || text === undefined) {
    return '';
  }

  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    // Turn punctuation into spaces so "covid-19" stays readable as words.
    .replace(/[^a-z0-9\s]/g, ' ')
    // Turn many spaces into one space.
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split the Alternative_Claims cell into a list of extra phrases.
 * In Google Sheets, students can separate phrases with | or ; or new lines.
 */
export function splitAlternativeClaims(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(/[|;/\n]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
