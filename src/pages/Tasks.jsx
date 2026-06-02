import { useState, useMemo } from 'react'
import { Plus, ChevronDown, ChevronUp, Circle, CircleDot, CheckCircle2, Pause, X, MessageSquare } from 'lucide-react'
import useStore from '../stores/useStore'
import { STATUS, STATUS_LABELS, STATUS_ICONS, PRIORITY_LABELS, CATEGORY_LABELS, CATEGORY } from '../utils/constants'
import EmptyState from '../components/EmptyState'

function TaskCard({ task, onCycleStatus, onAddNote, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [noteText, setNoteText] = useState('')

  const statusColors = {
    'not-started': 'var(--text-tertiary)',
    'in-progress': 'var(--accent)',
    done: 'var(--success)',
    paused: 'var(--warning)',
    'not-doing': 'var(--danger)',
  }

  const handleAddNote = () => {
    if (!noteText.trim()) return
    onAddNote(task.id, noteText.trim())
    setNoteText('')
  }

  return (
    <div className="card" style={{ marginBottom: '8px', padding: '12px 14px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCycleStatus(task.id)
          }}
          style={{ background: 'none', color: statusColors[task.status], flexShrink: 0, padding: '2px' }}
        >
          {task.status === 'done' ? (
            <CheckCircle2 size={20} />
          ) : task.status === 'in-progress' ? (
            <CircleDot size={20} />
          ) : task.status === 'paused' ? (
            <Pause size={20} />
          ) : (
            <Circle size={20} />
          )}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: task.status === 'done' ? 'var(--text-tertiary)' : 'var(--text-primary)',
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
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
            {task.priority === 'campaign' && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                }}
              >
                {PRIORITY_LABELS.campaign}
              </span>
            )}
          </div>
        </div>
        <div style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          {task.description && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{task.description}</div>
          )}

          {/* Notes */}
          {task.notes && task.notes.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageSquare size={12} /> 推进记录
              </div>
              {task.notes.map((n, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    padding: '6px 10px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '4px',
                  }}
                >
                  {n.content}
                </div>
              ))}
            </div>
          )}

          {/* Add Note */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              placeholder="写一条推进记录..."
              style={{ flex: 1, fontSize: '16px', padding: '8px 12px', borderRadius: '8px' }}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              style={{
                padding: '0 12px',
                borderRadius: '8px',
                background: noteText.trim() ? 'var(--accent)' : 'var(--bg-input)',
                color: noteText.trim() ? '#fff' : 'var(--text-tertiary)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              添加
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(task.id)}
            style={{
              marginTop: '10px',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              background: 'none',
              padding: '4px 0',
            }}
          >
            删除任务
          </button>
        </div>
      )}
    </div>
  )
}

function AddTaskModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('normal')
  const [category, setCategory] = useState('breakthrough')

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd({ title: title.trim(), priority, category })
    onClose()
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>新建任务</span>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-tertiary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="任务名称" autoFocus style={{ fontSize: '15px' }} />
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

        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '12px',
            background: title.trim() ? 'var(--accent)' : 'var(--bg-input)',
            color: title.trim() ? '#fff' : 'var(--text-tertiary)',
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          创建
        </button>
      </div>
    </div>
  )
}

export default function Tasks() {
  const tasks = useStore((s) => s.tasks)
  const cycleTaskStatus = useStore((s) => s.cycleTaskStatus)
  const addTask = useStore((s) => s.addTask)
  const addTaskNote = useStore((s) => s.addTaskNote)
  const deleteTask = useStore((s) => s.deleteTask)
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks.filter((t) => t.status !== 'not-doing')
    return tasks.filter((t) => t.status === filter)
  }, [tasks, filter])

  const counts = useMemo(
    () => ({
      all: tasks.filter((t) => t.status !== 'not-doing').length,
      'not-started': tasks.filter((t) => t.status === 'not-started').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      paused: tasks.filter((t) => t.status === 'paused').length,
    }),
    [tasks]
  )

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'not-started', label: '未开始' },
    { key: 'in-progress', label: '进行中' },
    { key: 'done', label: '已完成' },
    { key: 'paused', label: '暂停' },
  ]

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>任务池</div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '16px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: filter === f.key ? 600 : 400,
              background: filter === f.key ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: filter === f.key ? '#fff' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState icon="📋" title="没有任务" description="从待处理池翻译，或直接创建" />
      ) : (
        filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onCycleStatus={cycleTaskStatus}
            onAddNote={addTaskNote}
            onDelete={deleteTask}
          />
        ))
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} />}
    </div>
  )
}
