import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchClaim } from './matchClaim.js';
import { normalizeClaim, splitAlternativeClaims } from './normalizeClaim.js';
import { parseClaimsResponse } from './parseClaims.js';
import { validateClaimInput } from './validateClaimInput.js';

const sampleClaims = [
  {
    id: '1',
    claim: 'Vaccines cause autism',
    alternativeClaims: ['Do vaccines cause autism?', 'Vaccines make children autistic'],
    category: 'Immunization',
    verdict: 'MYTH',
    explanation: 'Studies have not found that vaccines cause autism.',
    sourceName: 'WHO',
    sourceUrl: 'https://www.who.int/example',
  },
  {
    id: '2',
    claim: 'Washing hands with soap helps prevent infections',
    alternativeClaims: ['Handwashing with soap prevents germs'],
    category: 'Hygiene',
    verdict: 'FACT',
    explanation: 'Soap and water help remove germs.',
    sourceName: 'CDC',
    sourceUrl: 'https://www.cdc.gov/example',
  },
  {
    id: '3',
    claim: 'Washing hands with soap helps prevent infections',
    alternativeClaims: [],
    category: 'Hygiene',
    verdict: 'MYTH',
    explanation: 'A disagreeing row used only for the ambiguous test.',
    sourceName: 'Test',
    sourceUrl: 'https://www.who.int/example-2',
  },
];

describe('normalizeClaim', () => {
  it('ignores capital letters, extra spaces, and punctuation', () => {
    assert.equal(
      normalizeClaim('  Vaccines   cause autism!!! '),
      'vaccines cause autism',
    );
  });

  it('splits alternative phrases', () => {
    assert.deepEqual(splitAlternativeClaims('One | Two; Three'), [
      'One',
      'Two',
      'Three',
    ]);
  });
});

describe('validateClaimInput', () => {
  it('rejects empty and tiny claims', () => {
    assert.match(validateClaimInput(''), /type a health claim/i);
    assert.match(validateClaimInput('water'), /full sentence/i);
  });

  it('accepts a full sentence', () => {
    assert.equal(validateClaimInput('Vaccines cause autism'), '');
  });
});

describe('matchClaim', () => {
  it('matches an exact claim after cleaning', () => {
    const result = matchClaim('VACCINES cause autism.', sampleClaims.slice(0, 2));
    assert.equal(result.status, 'matched');
    assert.equal(result.record.verdict, 'MYTH');
  });

  it('matches an approved alternative phrasing', () => {
    const result = matchClaim('Do vaccines cause autism?', sampleClaims.slice(0, 2));
    assert.equal(result.status, 'matched');
    assert.equal(result.record.id, '1');
  });

  it('does not treat shared keywords as proof', () => {
    const result = matchClaim(
      'Soap operas are fun to watch at night',
      sampleClaims.slice(0, 2),
    );
    assert.equal(result.status, 'not_sure');
    assert.equal(result.reason, 'unmatched');
  });

  it('returns NOT SURE for unmatched claims', () => {
    const result = matchClaim(
      'Eating moonlight makes you grow taller overnight',
      sampleClaims.slice(0, 2),
    );
    assert.equal(result.status, 'not_sure');
  });

  it('returns NOT SURE when two verified rows disagree', () => {
    const result = matchClaim(
      'Washing hands with soap helps prevent infections',
      sampleClaims,
    );
    assert.equal(result.status, 'not_sure');
    assert.equal(result.reason, 'ambiguous');
  });
});

describe('parseClaimsResponse', () => {
  it('keeps only complete FACT or MYTH rows with https sources', () => {
    const claims = parseClaimsResponse({
      ok: true,
      claims: [
        {
          id: 'ok',
          claim: 'Wearing a helmet while riding a bicycle helps protect your head',
          verdict: 'FACT',
          explanation: 'Helmets reduce head injuries.',
          sourceName: 'WHO',
          sourceUrl: 'https://www.who.int/helmets',
          alternativeClaims: ['Bike helmets protect your head'],
        },
        {
          id: 'bad-verdict',
          claim: 'Secret unfinished row',
          verdict: 'MAYBE',
          explanation: 'Should be dropped.',
          sourceUrl: 'https://www.who.int/x',
        },
        {
          id: 'http-only',
          claim: 'A claim with an unsafe link',
          verdict: 'FACT',
          explanation: 'Should be dropped.',
          sourceUrl: 'http://example.com',
        },
        {
          id: 'missing-source',
          claim: 'A claim without a source URL',
          verdict: 'FACT',
          explanation: 'Should remain available with no link.',
        },
      ],
    });

    assert.equal(claims.length, 3);
    assert.equal(claims[0].id, 'ok');
    assert.equal(claims[1].sourceUrl, '');
  });

  it('reads the Apps Script myth/fact schema', () => {
    const claims = parseClaimsResponse({
      ok: true,
      sheetName: 'Sheet1',
      headerRow: 2,
      total: 70,
      claims: [{
        id: 'H001',
        category: 'Hygiene',
        myth: 'Washing hands with soap helps prevent illness.',
        fact: 'true',
        explanation: 'Soap helps remove germs.',
        keywords: ['handwashing'],
        source: 'CDC',
        sourceUrl: 'https://www.cdc.gov/handwashing/',
      }],
    });

    assert.equal(claims.length, 1);
    assert.equal(claims[0].claim, 'Washing hands with soap helps prevent illness.');
    assert.equal(claims[0].verdict, 'FACT');
  });

  it('throws on API failures and missing lists', () => {
    assert.throws(
      () => parseClaimsResponse({ ok: false, error: 'Nope' }),
      /Nope/,
    );
    assert.throws(() => parseClaimsResponse({ ok: true }), /missing claims/i);
    assert.deepEqual(parseClaimsResponse({ ok: true, claims: [] }), []);
  });
});
