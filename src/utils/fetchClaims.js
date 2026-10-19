import { SHEETS_API_URL, API_TIMEOUT_MS } from '../config/api.js';
import { parseClaimsResponse } from './parseClaims.js';

/**
 * Download verified claims from Google Apps Script.
 * If this fails, the app shows an error. We never use fake backup facts.
 */
export async function fetchVerifiedClaims() {
  if (!SHEETS_API_URL) {
    const error = new Error(
      'The Google Sheets API address is missing. Ask a teacher to add VITE_SHEETS_API_URL.',
    );
    error.code = 'CONFIG';
    throw error;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('The health list website said something went wrong.');
    }

    const payload = await response.json();
    return parseClaimsResponse(payload);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The health list took too long to load. Please try again.');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('We could not load the verified health list.');
  } finally {
    clearTimeout(timer);
  }
}
