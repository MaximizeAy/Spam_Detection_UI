import { useState, useEffect } from 'react';

const CLASS_LABELS = { spam: 'Spam Detected', suspicious: 'Suspicious', safe: 'Looks Safe' };
const CLASS_DESCS = { spam: "We found strong signs of spam in this message.", suspicious: "Some parts of this message look suspicious.", safe: "This message looks safe to read." };
const CLASS_ICONS = { spam: 'fa-solid fa-triangle-exclamation', suspicious: 'fa-solid fa-circle-exclamation', safe: 'fa-solid fa-circle-check' };
const METER_FILL = { spam: 'spam-fill', suspicious: 'suspicious-fill', safe: 'safe-fill' };
const VALUE_COLOR = { spam: 'spam-color', suspicious: 'suspicious-color', safe: 'safe-color' };

/* Animates numbers counting up */
function animateCounter(el, target) {
  if (target === 0) { el.textContent = '0'; return; }
  let current = 0;
  const step = Math.max(1, target / 15);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = Math.round(current);
  }, 30);
}

function RuleMetrics({ features }) {
  const flagged = features.filter(f => f.type === 'flag' && f.severity !== 'none').length;
  const warnings = features.filter(f => f.type === 'warn' && f.severity !== 'none').length;
  const passed = features.filter(f => f.type === 'clear' || f.severity === 'none').length;
  const topRule = features.reduce((max, f) => (f.score > max.score ? f : max), features[0]);

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card danger">
          <i className="fa-solid fa-flag" style={{ fontSize: '14px', opacity: 0.8 }} />
          <div>
            <div className="metric-label">Red Flags</div>
            <div className="metric-val" data-metric-target={flagged}>0</div>
          </div>
        </div>
        <div className="metric-card warn">
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '14px', opacity: 0.8 }} />
          <div>
            <div className="metric-label">Warnings</div>
            <div className="metric-val" data-metric-target={warnings}>0</div>
          </div>
        </div>
        <div className="metric-card safe">
          <i className="fa-solid fa-circle-check" style={{ fontSize: '14px', opacity: 0.8 }} />
          <div>
            <div className="metric-label">Passed Metrics</div>
            <div className="metric-val" data-metric-target={passed}>0</div>
          </div>
        </div>
      </div>
      {topRule && topRule.score > 0 && (
        <div className="top-signal">
          <i className={topRule.icon} style={{ color: 'var(--danger)', marginRight: '6px' }} />
          Top Signal: <strong>{topRule.name}</strong>
          <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginLeft: '8px' }}>
            +{topRule.score}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Results({ data }) {
  const { final_verdict: classification, final_confidence: confidence, ml, rules, strategy, override_reason: overrideReason, meta } = data;
  
  const [animated, setAnimated] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // <-- ADDED STATE FOR DROPDOWN

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!animated) return;
    const start = performance.now();
    let raf;
    function tick(now) {
      const t = Math.min(1, (now - start) / 900);
      setDisplayValue(Math.round((1 - Math.pow(1 - t, 3)) * confidence));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, confidence]);

  useEffect(() => {
    if (!animated) return;
    setTimeout(() => {
      document.querySelectorAll('[data-metric-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.metricTarget, 10));
      });
    }, 350);
  }, [animated]);

  let strategyLabel = 'AI Verdict', strategyColor = 'var(--fg-muted)', strategyBg = 'rgba(255,255,255,0.04)';
  if (overrideReason) { strategyLabel = 'Rule Override'; strategyColor = 'var(--accent)'; strategyBg = 'var(--accent-dim)'; }
  else if (strategy === 'rules_primary_ml_uncertain') { strategyLabel = 'Rules-Primary'; strategyColor = 'var(--safe)'; strategyBg = 'var(--safe-dim)'; }

  return (
    <div className="results-stream">
      <div className="result-card">
        {/* Header */}
        <div className="result-header stagger-up" style={{ animationDelay: '0.05s' }}>
          <div className={`result-badge ${classification}`}>
            <i className={CLASS_ICONS[classification]} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="result-title">{CLASS_LABELS[classification]}</div>
            <div className="result-subtitle">{CLASS_DESCS[classification]}</div>
          </div>
          <div className="result-meta">
            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: strategyColor, background: strategyBg, padding: '3px 8px', borderRadius: '4px', display: 'inline-block', width: 'fit-content', marginBottom: '6px' }}>
              {strategyLabel}
            </span>
            {overrideReason && <div style={{ fontSize: '10px', color: 'var(--fg-secondary)', fontStyle: 'italic', maxWidth: '220px', marginBottom: '6px' }}>{overrideReason}</div>}
            <div className="response-time"><i className="fa-solid fa-stopwatch" /> {meta.response_time_ms}ms</div>
          </div>
        </div>
        
        {/* Confidence */}
        <div className="confidence-section stagger-up" style={{ animationDelay: '0.15s' }}>
          <div className="confidence-label">
            <span>Spam Risk</span>
            <span className={`confidence-value ${VALUE_COLOR[classification]}`}>{displayValue}%</span>
          </div>
          <div className="meter-track">
            <div className={`meter-fill ${METER_FILL[classification]}`} style={{ width: animated ? `${confidence}%` : '0%' }} />
          </div>
        </div>

        {/* Metrics */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }} className="stagger-up" style={{ animationDelay: '0.25s' }}>
          <RuleMetrics features={rules.features} />
        </div>

        {/* Model Strip */}
        <div className="model-strip stagger-up" style={{ animationDelay: '0.35s' }}>
          Powered by {ml.model} v{ml.version}
        </div>

        {/* FIX: Dropdown Toggle */}
        <button 
          className={`details-trigger stagger-up ${isOpen ? 'open' : ''}`} 
          style={{ animationDelay: '0.4s' }} 
          onClick={() => setIsOpen(!isOpen)} // <-- ADDED ONCLICK
        >
          <span><i className="fa-solid fa-list-check" style={{ marginRight: '8px', opacity: 0.7 }}></i>Why did it get this score?</span>
          <i className="fa-solid fa-chevron-down chevron"></i>
        </button>
        
        {/* FIX: Dropdown Content (Driven by state) */}
        <div className={`details-content ${isOpen ? 'open' : ''}`}>
          <div className="features-section">
            <div className="features-title">Detailed Rule Breakdown</div>
            {rules.features.map((f) => {
              const iconClass = f.type === 'flag' ? 'flagged' : f.type === 'clear' ? 'clear' : 'warn';
              const barPct = Math.min(100, (Math.abs(f.score) / 35) * 100);
              return (
                <div className="feature-item" key={f.id}>
                  <div className={`feature-icon ${iconClass}`}><i className={f.icon} /></div>
                  <div className="feature-info">
                    <div className="feature-name">{f.name} <span className={`tag ${f.severity}`}>{f.severity}</span></div>
                    <div className="feature-desc" title={f.desc}>{f.desc}</div>
                  </div>
                  <div className="feature-bar-wrap">
                    <div className="feature-bar-track">
                      {/* FIX: Bars animate based on isOpen state so they trigger visually when uncollapsed */}
                      <div 
                        className={`feature-bar-fill ${f.severity}`} 
                        style={{ width: isOpen ? `${barPct}%` : '0%' }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}