/**
 * The top bar with the HealthShield AI name and page links.
 */
function Navbar() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#claim-checker">
        Skip to claim checker
      </a>
      <div className="container nav-bar">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            🛡️
          </span>
          <span>
            <strong>HealthShield AI</strong>
            <small>Stop Myths, Save Lives!</small>
          </span>
        </a>
        <nav aria-label="Main">
          <a href="#claim-checker">Check a claim</a>
          <a href="#how-it-works">How it works</a>
          <a href="#disclaimer">Safety note</a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
