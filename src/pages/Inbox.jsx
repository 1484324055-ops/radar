import { useState } from 'react'
import { Inbox as InboxIcon, ArrowRight, Trash2, Check, Brain } from 'lucide-react'
import useStore from '../stores/useStore'
import { PRIORITY_LABELS, CATEGORY_LABELS } from '../utils/constants'
import EmptyState from '../components/EmptyState'

function ConvertModal({ capture, onConvert, onDismiss, onDelete }) {
  const [title, setTitle] = useState(capture.content.slice(0, 50))
  const [priority, setPriority] = useState('normal')
  const [category, setCategory] = useState('breakthrough')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onDismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
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
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>翻译成任务</div>

        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
          "{capture.content.length > 100 ? capture.content.slice(0, 100) + '…' : capture.content}"
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>任务名称</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="这个任务是什么？"
            style={{ fontSize: '15px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>优先级</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPriority(key)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: priority === key ? 'var(--accent-bg)' : 'var(--bg-input)',
                  color: priority === key ? 'var(--accent)' : 'var(--text-secondary)',
                  border: priority === key ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>类别</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: category === key ? `var(--${key}-bg)` : 'var(--bg-input)',
                  color: category === key ? `var(--${key})` : 'var(--text-secondary)',
                  border: category === key ? `1px solid var(--${key})` : '1px solid var(--border)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onDelete}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => {
              if (!title.trim()) return
              onConvert({ title: title.trim(), priority, category, fromCaptureId: capture.id })
            }}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '12px',
              background: title.trim() ? 'var(--accent)' : 'var(--bg-input)',
              color: title.trim() ? '#fff' : 'var(--text-tertiary)',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            变成任务
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Inbox() {
  const captures = useStore((s) => s.captures)
  const addTask = useStore((s) => s.addTask)
  const markCaptureProcessed = useStore((s) => s.markCaptureProcessed)
  const deleteCapture = useStore((s) => s.deleteCapture)
  const [selectedCapture, setSelectedCapture] = useState(null)

  const unprocessed = captures.filter((c) => !c.processed)
  const processed = captures.filter((c) => c.processed).slice(0, 10)

  const handleConvert = (taskData) => {
    addTask(taskData)
    markCaptureProcessed(taskData.fromCaptureId)
    setSelectedCapture(null)
  }

  const handleDismiss = (id) => {
    markCaptureProcessed(id)
  }

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>待处理池</div>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          把倾倒的想法翻译成任务，或者标记为「不需要行动」
        </div>
      </div>

      {unprocessed.length === 0 ? (
        <EmptyState icon="📥" title="待处理池空了" description="去「倾倒」页面倒一些想法进来" />
      ) : (
        unprocessed.map((c) => (
          <div key={c.id} className="card" style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '12px' }}>
              {c.content}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedCapture(c)}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <ArrowRight size={14} />
                变成任务
              </button>
              <button
                onClick={() => handleDismiss(c.id)}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-tertiary)',
                  fontSize: '13px',
                }}
              >
                不需要
              </button>
              <button
                onClick={() => deleteCapture(c.id)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}

      {processed.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>已处理</div>
          {processed.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '10px',
                marginBottom: '6px',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
                textDecoration: 'line-through',
                opacity: 0.6,
              }}
            >
              {c.content.length > 60 ? c.content.slice(0, 60) + '…' : c.content}
            </div>
          ))}
        </div>
      )}

      {selectedCapture && (
        <ConvertModal
          capture={selectedCapture}
          onConvert={handleConvert}
          onDismiss={() => setSelectedCapture(null)}
          onDelete={() => {
            deleteCapture(selectedCapture.id)
            setSelectedCapture(null)
          }}
        />
      )}
    </div>
  )
}
