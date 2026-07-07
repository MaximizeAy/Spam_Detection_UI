// src/components/ColdStartLoader/index.jsx
import { useState, useEffect } from 'react';

export default function ColdStartLoader() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="loader-wrapper" role="status" aria-label="Server waking up">
      <div className="loader cold-start">
        <div className="scanner">
          <div className="scanner-ring" />
          <div className="scanner-ring" />
          <div className="scanner-dot" />
        </div>
        <div className="loader-text">
          <i className="fa-solid fa-snowflake" style={{ marginRight: '8px', opacity: 0.6 }}></i>
          Server is waking up... <span>{seconds}s</span>
        </div>
      </div>
    </div>
  );
}