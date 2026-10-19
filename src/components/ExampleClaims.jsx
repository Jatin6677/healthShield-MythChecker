/**
 * Clickable example claims.
 * The sentences come from the live Google Sheet, not from secret fake data.
 */
function ExampleClaims({ claims, onPick, disabled }) {
  const examples = (claims || []).slice(0, 4);

  if (examples.length === 0) {
    return null;
  }

  return (
    <div className="example-block">
      <p className="example-label" id="example-claims-label">
        Try one of these verified examples:
      </p>
      <div className="example-list" role="group" aria-labelledby="example-claims-label">
        {examples.map((item) => (
          <button
            key={item.id}
            type="button"
            className="example-chip"
            disabled={disabled}
            onClick={() => onPick(item.claim)}
          >
            {item.claim}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExampleClaims;
