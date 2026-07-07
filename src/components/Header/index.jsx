export default function Header({ iconClass, isSpinning, onToggleTheme, stats }) {
  const avg = stats.times.length
    ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length)
    : 0;

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="brand-icon" aria-hidden="true">
          <i className="fa-solid fa-shield-halved" />
        </div>
        <span className="brand-name">SpamLens</span>
      </div>
      
      <div className="top-bar-right">
        <div className="mini-stats">
          <span><strong>{stats.total}</strong> Scanned</span>
          <span><strong>{stats.spam}</strong> Blocked</span>
          <span><strong>{avg}ms</strong> Avg</span>
        </div>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          <i className={`${iconClass} ${isSpinning ? 'spin-once' : ''}`} />
        </button>
      </div>
    </header>
  );
}