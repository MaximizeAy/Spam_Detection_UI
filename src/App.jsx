import { useState, useRef, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import {
  analyzeSingleEmail
} from './services/api';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ColdStartLoader from './components/ColdStartLoader';
import Loader from './components/Loader';
import Results from './components/Results';
import BatchResults from './components/BatchResults';
import Toast from './components/Toast';
import './App.css';

export default function App() {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isColdStarting, setIsColdStarting] = useState(false); // <-- ADD THIS
  const [stats, setStats] = useState({ total: 0, spam: 0, safe: 0, times: [] });
  const [toast, setToast] = useState({ message: '', icon: '', visible: false });

  const { iconClass, toggleTheme, isSpinning } = useTheme();
  const toastTimer = useRef(null);

  // Determines if we should center the UI or align to top
  const hasResults = !!(result || batchResult);

  const showToast = useCallback(
    (message, icon = 'fa-solid fa-circle-info') => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ message, icon, visible: true });
      toastTimer.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
    },
    []
  );

  // Inside App.jsx

  // ... [Keep your imports and state exactly the same] ...

  const handleAnalyze = useCallback(async () => {
    if (!emailText.trim()) {
      showToast('Please enter an email to analyze', 'fa-solid fa-keyboard');
      return;
    }
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setBatchResult(null);
    setResult(null);

    try {
      // 1. Try the API
      const { data } = await analyzeSingleEmail(emailText);
      processSingleResult(data); // Extracted to a helper below to avoid repeating code

    } catch (err) {
      // 2. If it fails because the server is sleeping...
      if (err.message.includes('Failed to fetch')) {
        setIsColdStarting(true); // IMMEDIATELY show the snowflake loader!

        try {
          // Wait 3 seconds to give the server time to spin up
          await new Promise(r => setTimeout(r, 3000));

          // Retry the request
          const { data } = await analyzeSingleEmail(emailText);
          processSingleResult(data);

        } catch (finalErr) {
          // If it fails AGAIN after waiting, it's a real issue
          showToast('Server took too long to wake up. Please try again.', 'fa-solid fa-snowflake');
        } finally {
          setIsColdStarting(false); // Hide the snowflake loader
        }
      } else {
        // It was a normal error (like 400 Bad Request)
        showToast(err.message, 'fa-solid fa-circle-xmark');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [emailText, isAnalyzing, showToast]);

  // Helper function to keep code clean
  const processSingleResult = (data) => {
    setResult(data);
    setStats((prev) => ({
      total: prev.total + 1,
      spam: prev.spam + (data.final_verdict === 'spam' ? 1 : 0),
      safe: prev.safe + (data.final_verdict !== 'spam' ? 1 : 0),
      times: [...prev.times, data.meta.response_time_ms],
    }));
  };

  // --- Do the exact same thing for Batch ---
  const handleBatchUpload = useCallback(async (files) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);
    setBatchResult(null);

    try {
      const texts = await parseFiles(files);
      if (!texts.length) {
        showToast('No valid text found in files', 'fa-solid fa-file-circle-xmark');
        return;
      }

      const data = await analyzeBatchEmails(texts);
      processBatchResult(data);

    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setIsColdStarting(true);
        try {
          await new Promise(r => setTimeout(r, 3000));
          const data = await analyzeBatchEmails(texts);
          processBatchResult(data);
        } catch (finalErr) {
          showToast('Server took too long to wake up.', 'fa-solid fa-snowflake');
        } finally {
          setIsColdStarting(false);
        }
      } else {
        showToast(err.message, 'fa-solid fa-circle-xmark');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, showToast]);

  const processBatchResult = (data) => {
    setBatchResult(data);
    setStats((prev) => ({
      total: prev.total + data.total,
      spam: prev.spam + data.spam,
      safe: prev.safe + data.safe + data.suspicious,
      times: [...prev.times, data.meta.response_time_ms],
    }));
    showToast(`Analyzed ${data.total} emails`, 'fa-solid fa-check-double');
  };

  const handleClear = useCallback(() => {
    setEmailText('');
    setResult(null);
    setBatchResult(null);
    showToast('Cleared', 'fa-solid fa-eraser');
  }, [showToast]);

  const handleSampleClick = useCallback((text) => {
    setEmailText(text);
  }, []);

  return (
    <div className="app">
      <Header
        iconClass={iconClass}
        isSpinning={isSpinning}
        onToggleTheme={toggleTheme}
        stats={stats}
      />

      <div className={`main-content ${hasResults ? 'has-results' : 'is-empty'}`}>

        {/* Welcome Screen (only shows when empty) */}
        {!hasResults && (
          <div className="welcome-screen">
            <h1 className="welcome-title">What do you want to scan?</h1>
            <p className="welcome-sub">
              Paste an email, upload a batch file, or try a sample to analyze for spam, phishing, and fraud.
            </p>
          </div>
        )}

        {/* Input Wrapper (always visible, moves based on state via CSS) */}
        <InputSection
          emailText={emailText}
          onTextChange={setEmailText}
          onAnalyze={handleAnalyze}
          onBatchUpload={handleBatchUpload}
          onClear={handleClear}
          onSampleClick={handleSampleClick}
          isAnalyzing={isAnalyzing}
          showSuggestions={!hasResults}
        />

        {/* Results Stream (appears below input when active) */}
        {(hasResults || isAnalyzing) && (
          <div className="results-stream">
            
            {/* Priority 1: Cold Start Snowflake */}
            {isColdStarting && <ColdStartLoader />}
            
            {/* Priority 2: Normal Scanning Loader */}
            {!isColdStarting && isAnalyzing && <Loader />}
            
            {/* Priority 3: Actual Results */}
            {!isAnalyzing && result && <Results data={result} />}
            {!isAnalyzing && batchResult && <BatchResults {...batchResult} />}
            
          </div>
        )}
      </div>

      <Toast {...toast} />
    </div>
  );
}

