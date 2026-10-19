import { normalizeClaim } from './normalizeClaim.js';

const MIN_CHARS = 8;
const MAX_CHARS = 280;

/**
 * Check the student's typing before we search.
 * Short or empty text is not a real health claim.
 */
export function validateClaimInput(rawValue) {
  const trimmed = String(rawValue || '').trim();

  if (!trimmed) {
    return 'Please type a health claim first.';
  }

  if (trimmed.length > MAX_CHARS) {
    return `Please keep your claim under ${MAX_CHARS} characters.`;
  }

  const cleaned = normalizeClaim(trimmed);
  const words = cleaned.split(' ').filter(Boolean);

  if (cleaned.length < MIN_CHARS || words.length < 3) {
    return 'Please type a full sentence, not just one or two words.';
  }

  return '';
}
