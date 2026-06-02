import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react'
import useStore from '../stores/useStore'
import { CATEGORY_LABELS } from '../utils/constants'
import EmptyState from '../components/EmptyState'

export default function NotDoing() {
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const updateTask = useStore((s) => s.updateTask)
  const deleteTask = useStore((s) => s.deleteTask)

  const notDoing = useMemo(() => tasks.filter((t) => t.status === 'not-doing'), [tasks])

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/tasks')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>不做池</div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>战略性放弃的事，不是失败，是选择</div>
        </div>
      </div>

      {notDoing.length === 0 ? (
        <EmptyState icon="🎯" title="不做池是空的" description="当你决定某些事不做时，它们会出现在这里" />
      ) : (
        notDoing.map((task) => (
          <div key={task.id} className="card" style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{task.title}</div>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: `var(--${task.category}-bg)`,
                    color: `var(--${task.category})`,
                  }}
                >
                  {CATEGORY_LABELS[task.category]}
                </span>
              </div>
              <button
                onClick={() => updateTask(task.id, { status: 'not-started' })}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="恢复"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
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
                title="彻底删除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
