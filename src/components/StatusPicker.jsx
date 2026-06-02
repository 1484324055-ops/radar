import { STATUS_LABELS, STATUS_ICONS } from '../utils/constants'
import { hapticLight } from '../utils/haptics'

const STATUSES = ['not-started', 'in-progress', 'done', 'paused', 'not-doing']

const statusColors = {
  'not-started': 'var(--text-tertiary)',
  'in-progress': 'var(--accent)',
  done: 'var(--success)',
  paused: 'var(--warning)',
  'not-doing': 'var(--danger)',
}

export default function StatusPicker({ current, onSelect, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: 'var(--bg-secondary)',
          borderRadius: '20px 20px 0 0',
          padding: '20px',
          paddingBottom: 'calc(20px + var(--sab))',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>切换状态</div>
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => {
              hapticLight()
              onSelect(status)
              onClose()
            }}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              background: current === status ? 'var(--accent-bg)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '18px', color: statusColors[status] }}>{STATUS_ICONS[status]}</span>
            <span style={{ fontSize: '15px', fontWeight: current === status ? 600 : 400, color: 'var(--text-primary)' }}>
              {STATUS_LABELS[status]}
            </span>
            {current === status && (
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--accent)' }}>当前</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
