import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ClaimChecker from './components/ClaimChecker.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import RecentHistory from './components/RecentHistory.jsx';
import Footer from './components/Footer.jsx';
import { fetchVerifiedClaims } from './utils/fetchClaims.js';

/**
 * App is the parent. It loads the spreadsheet data once, then shares it.
 */
function App() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [claimText, setClaimText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadClaims() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchVerifiedClaims();
        if (!cancelled) {
          setClaims(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setClaims([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'We could not load the verified health list.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadClaims();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleRetry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const handleChecked = useCallback((entry) => {
    setHistory((current) => {
      const nextItem = {
        id: `${Date.now()}-${current.length}`,
        text: entry.text,
        verdict: entry.verdict,
      };
      // Keep only the newest 8 searches for this visit.
      return [nextItem, ...current].slice(0, 8);
    });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ClaimChecker
          claims={claims}
          loading={loading}
          error={error}
          text={claimText}
          onTextChange={setClaimText}
          onRetry={handleRetry}
          onChecked={handleChecked}
        />
        <HowItWorks />
        <RecentHistory
          items={history}
          onReuse={(text) => {
            setClaimText(text);
            document.getElementById('claim-input')?.focus();
          }}
        />
      </main>
      <Footer />
    </>
  );
}

export default App;
