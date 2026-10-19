/**
 * Safety note and footer credits.
 */
function Footer() {
  return (
    <footer className="site-footer" id="disclaimer">
      <div className="container">
        <h2>Medical disclaimer</h2>
        <p>
          HealthShield AI is a school project. It is not medical advice, a
          diagnosis, or an emergency service. It only shows answers that a
          teacher stored as verified in Google Sheets. If you feel unwell, tell
          a trusted adult and get help from a qualified health worker.
        </p>
        <p className="footer-meta">
          HealthShield AI — Stop Myths, Save Lives! Built with React, Vite, and
          Google Sheets for the HCLTech Jigsaw competition.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
