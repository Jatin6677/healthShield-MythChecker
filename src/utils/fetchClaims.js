
import { SHEETS_API_URL, API_TIMEOUT_MS } from '../config/api.js';
import { parseClaimsResponse } from './parseClaims.js';

export async function fetchVerifiedClaims() {
  if (!SHEETS_API_URL) {
    const error = new Error(
      'The health database address is not configured.'
    );
    error.code = 'CONFIG';
    throw error;
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    API_TIMEOUT_MS
  );

  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `The health database request failed (HTTP ${response.status}).`
      );
    }

    let payload;

    try {
      const body = await response.text();
      if (!body.trim()) {
        throw new Error('The health database returned an empty response.');
      }
      payload = JSON.parse(body);
    } catch {
      throw new Error(
        'The health database returned an empty or invalid JSON response. Check the Apps Script deployment URL and deployment status, then retry.'
      );
    }

    return parseClaimsResponse(payload);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(
        'The health database took too long to load. Please try again.'
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Could not connect to the health database. Check your connection and API configuration.'
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'We could not load the verified health list.'
    );
  } finally {
    clearTimeout(timer);
  }
}
