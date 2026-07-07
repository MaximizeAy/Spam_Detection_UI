import { useRef, useEffect } from 'react';
import { SAMPLES } from '../../utils/featureMapper';

export default function InputSection({
  emailText,
  onTextChange,
  onAnalyze,
  onBatchUpload,
  onClear,
  onSampleClick,
  isAnalyzing,
  showSuggestions,
}) {
  const fileInputRef = useRef(null);
  const chipsRef = useRef([]);

  // Staggered chip entry animation
  useEffect(() => {
    const timers = [];
    chipsRef.current.forEach((chip, i) => {
      if (!chip) return;
      const timer = setTimeout(() => {
        chip.classList.add('chip-loaded');
      }, 300 + i * 75); // Base delay + stagger index
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [showSuggestions]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) onBatchUpload(files);
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (emailText.trim() && !isAnalyzing) {
        onAnalyze();
      }
    }
  };

  return (
    <>
      <div className="gemini-input-wrapper">
        <textarea
          value={emailText}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste an email here..."
          rows={1}
          style={{ height: '48px' }}
          aria-label="Email text"
        />
        
        <div className="input-bottom-row">
          <span className="char-count">
            {emailText.length > 0 ? `${emailText.length} chars` : '\u00A0'}
          </span>
          
          <div className="input-actions">
            <button className="action-btn ghost" onClick={onClear} title="Clear">
              <i className="fa-solid fa-eraser" />
            </button>
            <button className="action-btn ghost" onClick={() => fileInputRef.current?.click()} title="Upload">
              <i className="fa-solid fa-paperclip" />
            </button>
            <button
              className="action-btn primary"
              onClick={onAnalyze}
              disabled={isAnalyzing || !emailText.trim()}
            >
              <i className="fa-solid fa-magnifying-glass-chart" />
              Analyze
            </button>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.csv"
          multiple
          onChange={handleFileChange}
          id="fileInput"
        />
      </div>

      {showSuggestions && (
        <div className="suggestions">
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              ref={el => chipsRef.current[i] = el}
              className="chip"
              onClick={() => onSampleClick(s.text)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}