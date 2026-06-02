import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, Circle, CircleDot, CheckCircle2, Pause, X, MessageSquare, Calendar, Ban, Search, Filter } from 'lucide-react'
import useStore from '../stores/useStore'
import { STATUS_LABELS, STATUS_ICONS, PRIORITY_LABELS, CATEGORY_LABELS, DAY_NAMES } from '../utils/constants'
import { getDayIndex } from '../utils/helpers'
import { hapticLight, hapticSuccess } from '../utils/haptics'
import EmptyState from '../components/EmptyState'
import StatusPicker from '../components/StatusPicker'
import SwipeableCard from '../components/SwipeableCard'

function TaskCard({ task, onStatusChange, onAddNote, onDelete, onUpdateDay, onNotDoing }) {
  const [expanded, setExpanded] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const longPressRef = useRef(null)

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

  // Long press to show status picker
  const handlePointerDown = () => {
    longPressRef.current = setTimeout(() => {
      hapticLight()
      setShowStatusPicker(true)
    }, 500)
  }

  const handlePointerUp = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  const cardContent = (
    <div
      className="card"
      style={{ marginBottom: 0, padding: '12px 14px' }}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            hapticLight()
            onStatusChange(task.id)
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
            {task.day !== null && task.day !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {DAY_NAMES[task.day]}
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

          {/* Day Assignment */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> 分配到
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onUpdateDay(task.id, null)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: task.day === null || task.day === undefined ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                  color: task.day === null || task.day === undefined ? 'var(--accent)' : 'var(--text-tertiary)',
                  fontWeight: 500,
                }}
              >
                不限
              </button>
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  onClick={() => onUpdateDay(task.id, i)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: task.day === i ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                    color: task.day === i ? 'var(--accent)' : 'var(--text-tertiary)',
                    fontWeight: task.day === i ? 600 : 400,
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

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

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => onNotDoing(task.id)}
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                background: 'var(--bg-tertiary)',
                padding: '4px 12px',
                borderRadius: '8px',
              }}
            >
              不做
            </button>
            <button
              onClick={() => onDelete(task.id)}
              style={{
                fontSize: '12px',
                color: 'var(--danger)',
                background: 'var(--danger-bg)',
                padding: '4px 12px',
                borderRadius: '8px',
              }}
            >
              删除
            </button>
          </div>
        </div>
      )}

      {showStatusPicker && (
        <StatusPicker
          current={task.status}
          onSelect={(status) => onStatusChange(task.id, status)}
          onClose={() => setShowStatusPicker(false)}
        />
      )}
    </div>
  )

  // Wrap with swipe gestures for non-done tasks
  if (task.status === 'done') {
    return cardContent
  }

  return (
    <SwipeableCard
      onSwipeLeft={() => onDelete(task.id)}
      onSwipeRight={() => {
        hapticSuccess()
        onStatusChange(task.id, 'done')
      }}
      leftLabel="删除"
      rightLabel="完成"
    >
      {cardContent}
    </SwipeableCard>
  )
}

function AddTaskModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('normal')
  const [category, setCategory] = useState('breakthrough')
  const [day, setDay] = useState(null)

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd({ title: title.trim(), priority, category, day })
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="任务名称" autoFocus style={{ fontSize: '16px' }} />
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

        <div style={{ marginBottom: '12px' }}>
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

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>分配到</label>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setDay(null)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                background: day === null ? 'var(--accent-bg)' : 'var(--bg-input)',
                color: day === null ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              不限
            </button>
            {DAY_NAMES.map((name, i) => (
              <button
                key={i}
                onClick={() => setDay(i)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: day === i ? 'var(--accent-bg)' : 'var(--bg-input)',
                  color: day === i ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: day === i ? 600 : 400,
                }}
              >
                {name}
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
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const cycleTaskStatus = useStore((s) => s.cycleTaskStatus)
  const updateTask = useStore((s) => s.updateTask)
  const addTask = useStore((s) => s.addTask)
  const addTaskNote = useStore((s) => s.addTaskNote)
  const deleteTask = useStore((s) => s.deleteTask)
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const todayIdx = getDayIndex()

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => t.status !== 'not-doing')

    // Apply status filter
    if (filter === 'today') {
      result = result.filter((t) => t.day === todayIdx)
    } else if (filter !== 'all') {
      result = result.filter((t) => t.status === filter)
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(q))
    }

    return result
  }, [tasks, filter, searchQuery, todayIdx])

  const counts = useMemo(
    () => ({
      all: tasks.filter((t) => t.status !== 'not-doing').length,
      'not-started': tasks.filter((t) => t.status === 'not-started').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      paused: tasks.filter((t) => t.status === 'paused').length,
      'not-doing': tasks.filter((t) => t.status === 'not-doing').length,
      today: tasks.filter((t) => t.day === todayIdx && t.status !== 'not-doing').length,
    }),
    [tasks, todayIdx]
  )

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'today', label: '今日' },
    { key: 'not-started', label: '未开始' },
    { key: 'in-progress', label: '进行中' },
    { key: 'done', label: '已完成' },
    { key: 'paused', label: '暂停' },
  ]

  const handleStatusChange = (id, status) => {
    if (status) {
      updateTask(id, { status })
    } else {
      cycleTaskStatus(id)
    }
  }

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>任务池</div>
          {counts['not-doing'] > 0 && (
            <button
              onClick={() => navigate('/not-doing')}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Ban size={12} />
              不做 ({counts['not-doing']})
            </button>
          )}
        </div>
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

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索任务..."
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            borderRadius: '12px',
            fontSize: '16px',
            background: 'var(--bg-tertiary)',
            border: '1px solid transparent',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-tertiary)', padding: '4px' }}
          >
            <X size={16} />
          </button>
        )}
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
        <EmptyState
          icon="📋"
          title={searchQuery ? '没有找到匹配的任务' : filter === 'today' ? '今天没有分配的任务' : '没有任务'}
          description={searchQuery ? '换个关键词试试' : filter === 'today' ? '去任务详情里分配到今天' : '从待处理池翻译，或直接创建'}
        />
      ) : (
        filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            onAddNote={addTaskNote}
            onDelete={deleteTask}
            onUpdateDay={(id, day) => updateTask(id, { day })}
            onNotDoing={(id) => updateTask(id, { status: 'not-doing' })}
          />
        ))
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} />}
    </div>
  )
}
