/**
 * A friendly welcome at the top of the page.
 */
function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">Made for curious young researchers</p>
          <h1>HealthShield AI</h1>
          <p className="tagline">Stop Myths, Save Lives!</p>
          <p className="hero-copy">
            Type a health claim you heard at school, online, or at home. We
            compare it with a verified list from trusted sources. If we are not
            sure, we say so. We never make up medical facts.
          </p>
          <a className="primary-link" href="#claim-checker">
            Check a health claim
          </a>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="badge-row">
            <span className="mini-badge fact">FACT</span>
            <span className="mini-badge myth">MYTH</span>
            <span className="mini-badge unsure">NOT SURE</span>
          </div>
          <p>
            A computer helper that only repeats answers already checked by a
            teacher in Google Sheets.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
