/**
 * HealthShield AI — read-only Google Apps Script API
 *
 * Spreadsheet columns allowed:
 * Myth_ID, Category, Myth, Fact, Explanation, Keywords, Source
 *
 * Extra columns in the sheet are ignored and never sent to the website.
 * This script does not add, edit, or delete rows.
 */

var ALLOWED_COLUMNS = [
  'ID',
  'Claim',
  'Alternative_Claims',
  'Category',
  'Verdict',
  'Explanation',
  'Source_Name',
  'Source_URL',
  'Verified',
  'Last_Reviewed'
];

function doGet() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (!sheet) {
      return jsonOutput({ ok: false, error: 'No sheet was found.' });
    }
    var values = sheet.getDataRange().getValues();

    if (!values || values.length < 2) {
      return jsonOutput({ ok: true, claims: [] });
    }

    var headers = values[0].map(function (cell) {
      return String(cell || '').trim();
    });

    var claims = [];

    for (var rowIndex = 1; rowIndex < values.length; rowIndex++) {
      var row = values[rowIndex];
      if (isEmptyRow(row)) {
        continue;
      }

      var record = buildRecord(headers, row);
      if (record) {
        claims.push(record);
      }
    }

    return jsonOutput({ ok: true, claims: claims });
  } catch (error) {
    return jsonOutput({
      ok: false,
      error: 'Could not read the verified health list.'
    });
  }
}

function buildRecord(headers, row) {
  var claim = String(getAllowedCell(headers, row, 'Claim') || getAllowedCell(headers, row, 'Myth') || '').trim();
  var verdict = String(getAllowedCell(headers, row, 'Verdict') || getAllowedCell(headers, row, 'Fact') || '').trim().toUpperCase();
  var explanation = String(getAllowedCell(headers, row, 'Explanation') || '').trim();
  var verified = String(getAllowedCell(headers, row, 'Verified') || '').trim().toUpperCase();

  if (!claim || !/^(FACT|MYTH|TRUE|FALSE)$/.test(verdict) || !explanation || !/^(YES|TRUE|1)$/.test(verified)) {
    return null;
  }

  return {
    id: String(getAllowedCell(headers, row, 'ID') || getAllowedCell(headers, row, 'Myth_ID') || claim),
    claim: claim,
    alternativeClaims: splitKeywords(getAllowedCell(headers, row, 'Alternative_Claims')),
    category: String(getAllowedCell(headers, row, 'Category') || 'General').trim() || 'General',
    verdict: verdict === 'TRUE' ? 'FACT' : verdict === 'FALSE' ? 'MYTH' : verdict,
    explanation: explanation,
    sourceName: String(getAllowedCell(headers, row, 'Source_Name') || getAllowedCell(headers, row, 'Source') || '').trim(),
    sourceUrl: String(getAllowedCell(headers, row, 'Source_URL') || '').trim(),
    lastReviewed: String(getAllowedCell(headers, row, 'Last_Reviewed') || '').trim()
  };
}

function getAllowedCell(headers, row, columnName) {
  var allowed = false;
  for (var a = 0; a < ALLOWED_COLUMNS.length; a++) {
    if (ALLOWED_COLUMNS[a].toLowerCase() === columnName.toLowerCase()) {
      allowed = true;
      break;
    }
  }

  if (!allowed) {
    return '';
  }

  var index = -1;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase() === columnName.toLowerCase()) {
      index = i;
      break;
    }
  }

  if (index < 0 || index >= row.length) {
    return '';
  }

  return row[index];
}

function splitKeywords(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(/[|;\n]+/)
    .map(function (part) {
      return part.trim();
    })
    .filter(function (part) {
      return part.length > 0;
    });
}

function isEmptyRow(row) {
  for (var i = 0; i < row.length; i++) {
    if (String(row[i] || '').trim() !== '') {
      return false;
    }
  }
  return true;
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
