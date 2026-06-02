export default function EmptyState({ icon, title, description }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</div>
      {description && (
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '260px' }}>{description}</div>
      )}
    </div>
  )
}
