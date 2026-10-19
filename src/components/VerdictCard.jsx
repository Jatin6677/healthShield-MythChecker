/**
 * Shows FACT, MYTH, or NOT SURE in a clear card.
 */
function VerdictCard({ result }) {
  if (!result) {
    return null;
  }

  if (result.kind === 'not_sure') {
    return (
      <article className="verdict-card unsure" aria-live="polite">
        <p className="verdict-kicker">Result</p>
        <h3>NOT SURE</h3>
        <p>{result.message}</p>
        <p className="hint">
          Ask a trusted adult, a teacher, or a doctor before you believe or
          share the claim.
        </p>
      </article>
    );
  }

  const record = result.record;
  const isFact = record.verdict === 'FACT';

  return (
    <article
      className={`verdict-card ${isFact ? 'fact' : 'myth'}`}
      aria-live="polite"
    >
      <p className="verdict-kicker">Result</p>
      <h3>{record.verdict}</h3>
      <p className="checked-claim">“{record.claim}”</p>
      <p>{record.explanation}</p>
      <dl className="meta-list">
        <div>
          <dt>Category</dt>
          <dd>{record.category}</dd>
        </div>
        {record.lastReviewed ? (
          <div>
            <dt>Last reviewed</dt>
            <dd>{record.lastReviewed}</dd>
          </div>
        ) : null}
      </dl>
      <a
        className="source-link"
        href={record.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
      >
        Evidence: {record.sourceName}
      </a>
    </article>
  );
}

export default VerdictCard;
