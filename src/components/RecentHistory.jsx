/**
 * Claims checked during this browser visit only.
 * We do not save them on a server.
 */
function RecentHistory({ items, onReuse }) {
  if (!items.length) {
    return (
      <section className="section history-section" id="recent">
        <div className="container">
          <h2>Recent searches</h2>
          <p className="empty-note">
            Your checks from this visit will appear here. Refreshing the page
            starts a new list.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section history-section" id="recent">
      <div className="container">
        <h2>Recent searches</h2>
        <ul className="history-list">
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onReuse(item.text)}>
                <span>{item.text}</span>
                <strong data-verdict={item.verdict}>{item.verdict}</strong>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default RecentHistory;
