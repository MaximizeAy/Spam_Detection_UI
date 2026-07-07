// src/components/Loader.jsx
import { useState, useEffect } from 'react';

const PHASES = [
  'parsing email headers',
  'extracting metadata',
  'tokenizing text',
  'scanning blacklisted URLs',
  'checking sender reputation',
  'analyzing linguistic patterns',
  'evaluating urgency triggers',
  'scanning for obfuscated text',
  'processing ML features',
  'cross-referencing threat databases',
  'computing spam probability',
  'generating final verdict',
  'almost there...',
];

export default function Loader() {
  const [phase, setPhase] = useState(PHASES[0]);

  useEffect(() => {
    let idx = 0;
    let timeoutId;

    const runSequence = () => {
      idx++;

      // 1. If we hit the end, STOP completely. It rests on "almost there..."
      if (idx >= PHASES.length) {
        return; 
      }

      setPhase(PHASES[idx]);

      // 2. Calculate how long to wait before the NEXT phrase
      let delay;
      const progress = idx / PHASES.length; // 0.0 to 0.9

      if (progress < 0.3) {
        // FAST PHASE (Beginning)
        delay = 300; 
      } else if (progress < 0.6) {
        // SLOWING DOWN PHASE (Middle)
        delay = 650;
      } else if (progress < 0.85) {
        // SLOW PHASE (Near the end)
        delay = 1200;
      } else {
        // CRAWL PHASE (Right before stopping)
        delay = 2000;
      }

      // 3. Schedule the next step with the new dynamic speed
      timeoutId = setTimeout(runSequence, delay);
    };

    // Start the sequence after a quick initial delay
    timeoutId = setTimeout(runSequence, 300);

    // Cleanup on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="loader" role="status" aria-label="Analyzing">
      <div className="scanner">
        <div className="scanner-ring" />
        <div className="scanner-ring" />
        <div className="scanner-dot" />
      </div>
      <div className="loader-text">
        Analyzing... <span>{phase}</span>
      </div>
    </div>
  );
}