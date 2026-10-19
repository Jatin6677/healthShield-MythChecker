import { useMemo, useState } from 'react';
import ExampleClaims from './ExampleClaims.jsx';
import VerdictCard from './VerdictCard.jsx';
import { matchClaim } from '../utils/matchClaim.js';
import { validateClaimInput } from '../utils/validateClaimInput.js';

/**
 * The main tool: type a claim, press the button, see FACT / MYTH / NOT SURE.
 */
function ClaimChecker({
  claims,
  loading,
  error,
  text,
  onTextChange,
  onRetry,
  onChecked,
}) {
  const [inputError, setInputError] = useState('');
  const [result, setResult] = useState(null);

  const ready = !loading && !error && claims.length > 0;
  const emptyList = !loading && !error && claims.length === 0;

  const helperText = useMemo(() => {
    if (loading) {
      return 'Loading verified claims from Google Sheets…';
    }
    if (error) {
      return error;
    }
    if (emptyList) {
      return 'The spreadsheet loaded, but it has no verified claims yet.';
    }
    return `${claims.length} verified claims are ready to check.`;
  }, [claims.length, emptyList, error, loading]);

  function runCheck(rawText) {
    const message = validateClaimInput(rawText);
    if (message) {
      setInputError(message);
      setResult(null);
      return;
    }

    if (!ready) {
      setInputError('Please wait until the verified list has loaded.');
      return;
    }

    setInputError('');
    const match = matchClaim(rawText, claims);

    if (match.status === 'matched') {
      setResult({ kind: 'matched', record: match.record });
      onChecked({
        text: rawText.trim(),
        verdict: match.record.verdict,
      });
      return;
    }

    const notSureMessage =
      match.reason === 'ambiguous'
        ? 'This sentence matches more than one verified row, and those rows do not agree. We will not guess.'
        : 'This exact claim is not in our verified list, so we cannot call it a FACT or a MYTH.';

    setResult({ kind: 'not_sure', message: notSureMessage });
    onChecked({
      text: rawText.trim(),
      verdict: 'NOT SURE',
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    runCheck(text);
  }

  return (
    <section className="section checker-section" id="claim-checker">
      <div className="container">
        <h2>Check My Claim</h2>
        <p className="section-lead">
          Write a health sentence. We only answer when it matches a verified
          spreadsheet row.
        </p>

        <form className="checker-card" onSubmit={handleSubmit}>
          <label htmlFor="claim-input">Health claim</label>
          <textarea
            id="claim-input"
            name="claim"
            rows={4}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Example: Vaccines cause autism"
            disabled={loading}
          />
          {inputError ? (
            <p className="form-error" role="alert">
              {inputError}
            </p>
          ) : (
            <p className="form-help">{helperText}</p>
          )}

          <div className="checker-actions">
            <button type="submit" className="check-button" disabled={loading}>
              Check My Claim
            </button>
            {error ? (
              <button type="button" className="retry-button" onClick={onRetry}>
                Try loading again
              </button>
            ) : null}
          </div>

          <ExampleClaims
            claims={claims}
            disabled={!ready}
            onPick={(example) => {
              onTextChange(example);
              runCheck(example);
            }}
          />
        </form>

        {loading ? <p className="status-line">Please wait…</p> : null}
        {error ? (
          <p className="status-line error" role="alert">
            We could not load the verified health list. No backup facts are
            used. Check the Apps Script URL, then retry.
          </p>
        ) : null}

        <VerdictCard result={result} />
      </div>
    </section>
  );
}

export default ClaimChecker;
