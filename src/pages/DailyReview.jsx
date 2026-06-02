import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, Clock, Plus } from 'lucide-react'
import useStore from '../stores/useStore'
import { STATUS, CATEGORY_LABELS } from '../utils/constants'
import { getTodayKey, getTodayLabel, getDayIndex } from '../utils/helpers'

export default function DailyReview() {
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const dailyLogs = useStore((s) => s.dailyLogs)
  const addDailyReflection = useStore((s) => s.addDailyReflection)
  const [reflectionText, setReflectionText] = useState('')

  const todayKey = getTodayKey()
  const todayIdx = getDayIndex()
  const todayLog = dailyLogs[todayKey] || { reflections: [] }

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.day === todayIdx || (t.status === STATUS.DONE && new Date(t.createdAt).toDateString() === new Date().toDateString())),
    [tasks, todayIdx]
  )

  const doneToday = todayTasks.filter((t) => t.status === STATUS.DONE)
  const inProgress = todayTasks.filter((t) => t.status === STATUS.IN_PROGRESS)

  const handleAddReflection = () => {
    if (!reflectionText.trim()) return
    addDailyReflection(todayKey, reflectionText.trim())
    setReflectionText('')
  }

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
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
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>每日复盘</div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{getTodayLabel()}</div>
        </div>
      </div>

      {/* Today Summary */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>今日概览</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{doneToday.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>已完成</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>{inProgress.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>进行中</div>
          </div>
        </div>
      </div>

      {/* Completed Tasks */}
      {doneToday.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>今天完成的事</div>
          {doneToday.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{t.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>还在推进</div>
          {inProgress.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <Clock size={16} color="var(--accent)" />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{t.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reflections */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>今日反思</div>

        {todayLog.reflections && todayLog.reflections.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            {todayLog.reflections.map((r, i) => (
              <div
                key={i}
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  padding: '10px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  marginBottom: '6px',
                  lineHeight: 1.6,
                }}
              >
                {r.content}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="今天打穿了什么？有什么收获？"
            rows={3}
            style={{
              flex: 1,
              fontSize: '16px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              resize: 'none',
            }}
          />
        </div>
        <button
          onClick={handleAddReflection}
          disabled={!reflectionText.trim()}
          style={{
            marginTop: '8px',
            width: '100%',
            height: '40px',
            borderRadius: '10px',
            background: reflectionText.trim() ? 'var(--accent)' : 'var(--bg-input)',
            color: reflectionText.trim() ? '#fff' : 'var(--text-tertiary)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Plus size={16} />
          记录反思
        </button>
      </div>
    </div>
  )
}
