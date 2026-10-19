
import { useMemo, useState } from 'react';
import ExampleClaims from './ExampleClaims.jsx';
import VerdictCard from './VerdictCard.jsx';
import { matchClaim } from '../utils/matchClaim.js';
import { matchClaimSemantically } from '../utils/semanticMatch.js';
import { validateClaimInput } from '../utils/validateClaimInput.js';

/**
 * HealthShield AI claim checker.
 *
 * Uses the server-side AI endpoint to find equivalent wording
 * in the reviewed health database.
 *
 * The AI must not invent a medical verdict.
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
  const [checking, setChecking] = useState(false);
  const [modelStatus, setModelStatus] = useState('');

  const ready = !loading && !error && claims.length > 0;
  const emptyList = !loading && !error && claims.length === 0;

  const helperText = useMemo(() => {
    if (loading) {
      return 'Loading reviewed health claims from Google Sheets…';
    }

    if (error) {
      return error;
    }

    if (emptyList) {
      return 'The spreadsheet loaded, but it has no reviewed claims yet.';
    }

    return `${claims.length} reviewed claims are ready to check.`;
  }, [claims.length, emptyList, error, loading]);

  async function runCheck(rawText) {
    const message = validateClaimInput(rawText);

    if (message) {
      setInputError(message);
      setResult(null);
      return;
    }

    if (!ready) {
      setInputError(
        'Please wait until the reviewed health list has loaded.'
      );
      return;
    }

    if (checking) {
      return;
    }

    setInputError('');
    setResult(null);
    setChecking(true);

    try {
      const exactMatch = matchClaim(rawText, claims);
      const match = exactMatch.status === 'matched' || exactMatch.reason === 'ambiguous'
        ? exactMatch
        : await matchClaimSemantically(rawText, claims, setModelStatus);

      if (match.status === 'matched' && match.record) {
        setResult({
          kind: 'matched',
          record: match.record,
        });

        onChecked?.({
          text: rawText.trim(),
          verdict: match.record.verdict,
        });

        return;
      }

      const notSureMessage =
        match.reason === 'ambiguous'
          ? 'More than one reviewed record matches this sentence, and the records disagree. We will not guess.'
          : 'We could not confidently match this sentence to a reviewed health claim. Try another wording or consult the source material.';

      setResult({
        kind: 'not_sure',
        message: notSureMessage,
      });

      onChecked?.({
        text: rawText.trim(),
        verdict: 'NOT SURE',
      });
    } catch (err) {
      setResult({
        kind: 'not_sure',
        message:
          err instanceof Error
            ? err.message
            : 'The health claim could not be checked. Please try again.',
      });
    } finally {
      setChecking(false);
      setModelStatus('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await runCheck(text);
  }

  function handleExamplePick(example) {
    onTextChange(example);
    runCheck(example);
  }

  return (
    <section className="section checker-section" id="claim-checker">
      <div className="container">
        <h2>Check My Claim</h2>

        <p className="section-lead">
          Enter a health claim. HealthShield AI looks for the same
          meaning in its reviewed health database and shows a verdict
          only when a reliable match is available.
        </p>

        <form className="checker-card" onSubmit={handleSubmit}>
          <label htmlFor="claim-input">Health claim</label>

          <textarea
            id="claim-input"
            name="claim"
            rows={4}
            value={text}
            onChange={(event) => {
              onTextChange(event.target.value);
              setInputError('');
            }}
            placeholder="Example: Can vaccines cause autism?"
            disabled={loading || checking}
          />

          {inputError ? (
            <p className="form-error" role="alert">
              {inputError}
            </p>
          ) : (
            <p className="form-help">{helperText}</p>
          )}

          <div className="checker-actions">
            <button
              type="submit"
              className="check-button"
              disabled={!ready || checking}
            >
              {checking ? 'Checking claim…' : 'Check My Claim'}
            </button>

            {error ? (
              <button
                type="button"
                className="retry-button"
                onClick={onRetry}
                disabled={checking}
              >
                Try loading again
              </button>
            ) : null}
          </div>

          {checking ? (
            <p className="status-line" role="status" aria-live="polite">
              {modelStatus || 'Comparing your claim with reviewed records…'}
            </p>
          ) : null}

          <ExampleClaims
            claims={claims}
            disabled={!ready || checking}
            onPick={handleExamplePick}
          />
        </form>

        {loading ? (
          <p className="status-line" role="status">
            Please wait while the verified health list loads…
          </p>
        ) : null}

        {error ? (
          <p className="status-line error" role="alert">
            We could not load the reviewed health list. No backup
            facts are used. Check the database connection and retry.
          </p>
        ) : null}

        <VerdictCard result={result} />
      </div>
    </section>
  );
}

export default ClaimChecker;
