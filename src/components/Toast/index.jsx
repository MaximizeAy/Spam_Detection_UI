export default function Toast({ message, icon, visible }) {
  return (
    <div className={`toast${visible ? ' show' : ''}`} role="alert">
      <i className={icon} style={{ color: 'var(--accent)' }} />
      {message}
    </div>
  );
}