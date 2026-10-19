// This file is the ONLY place we store the Google Apps Script web address.
// Put your real URL in a .env file as VITE_SHEETS_API_URL.
// We never hide health facts inside React components.

export const SHEETS_API_URL = import.meta.env?.VITE_SHEETS_API_URL || '';

// How long we wait for the spreadsheet API before we stop trying.
export const API_TIMEOUT_MS = 15000;
