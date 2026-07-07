// src/components/BatchResults/index.jsx
export default function BatchResults({
  total,
  spam,
  suspicious,
  safe,
  results,
  meta,
}) {
  const confColor = (verdict) => {
    if (verdict === 'spam') return 'var(--danger)';
    if (verdict === 'safe') return 'var(--safe)';
    return 'var(--accent)';
  };

  const strategyLabel = (s) => {
    if (s.includes('override')) return 'OVR';
    if (s.includes('rules')) return 'RUL';
    return 'ML';
  };

  return (
    <div className="results-area active">
      <div className="result-card">
        <div
          className="result-header"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="result-badge"
            style={{
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            <i className="fa-solid fa-layer-group" />
          </div>
          <div>
            <div className="result-title">Batch Results</div>
            <div className="result-subtitle">{total} emails analyzed</div>
          </div>
          <div className="result-meta">
            <div className="response-time">
              <i className="fa-solid fa-stopwatch" /> {meta.response_time_ms}ms
            </div>
          </div>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <div className="batch-summary">
            <div className="batch-stat">
              <div
                className="batch-stat-num"
                style={{ color: 'var(--danger)' }}
              >
                {spam}
              </div>
              <div className="batch-stat-label">Spam</div>
            </div>
            <div className="batch-stat">
              <div
                className="batch-stat-num"
                style={{ color: 'var(--accent)' }}
              >
                {suspicious}
              </div>
              <div className="batch-stat-label">Suspicious</div>
            </div>
            <div className="batch-stat">
              <div
                className="batch-stat-num"
                style={{ color: 'var(--safe)' }}
              >
                {safe}
              </div>
              <div className="batch-stat-label">Safe</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        {results.map((r, i) => (
          <div
            className="batch-item"
            key={i}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`batch-dot ${r.final_verdict}`} />
            <div
              className="batch-text"
              title={r.text.replace(/"/g, '&quot;')}
            >
              {r.text.substring(0, 100)}
              {r.text.length > 100 ? '...' : ''}
            </div>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--fg-muted)',
                background: 'rgba(255,255,255,0.04)',
                padding: '2px 6px',
                borderRadius: '4px',
                flexShrink: 0,
              }}
            >
              {strategyLabel(r.strategy)}
            </span>
            <div
              className="batch-conf"
              style={{ color: confColor(r.final_verdict) }}
            >
              {r.final_confidence}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}