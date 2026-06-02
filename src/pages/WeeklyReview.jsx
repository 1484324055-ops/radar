import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react'
import useStore from '../stores/useStore'
import { STATUS, CATEGORY_LABELS } from '../utils/constants'
import { getThisWeekTasks, getWeekLabel } from '../utils/helpers'

export default function WeeklyReview() {
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const campaigns = useStore((s) => s.campaigns)
  const dailyLogs = useStore((s) => s.dailyLogs)
  const addDailyReflection = useStore((s) => s.addDailyReflection)
  const [nextWeekText, setNextWeekText] = useState('')
  const [saved, setSaved] = useState(false)

  const weekTasks = useMemo(() => getThisWeekTasks(tasks), [tasks])
  const done = weekTasks.filter((t) => t.status === STATUS.DONE)
  const inProgress = weekTasks.filter((t) => t.status === STATUS.IN_PROGRESS)
  const notStarted = weekTasks.filter((t) => t.status === 'not-started')
  const weekCampaigns = campaigns.filter((c) => {
    const d = new Date(c.createdAt)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    return d >= weekStart
  })

  const completionRate = weekTasks.length > 0 ? Math.round((done.length / weekTasks.length) * 100) : 0

  const categoryBreakdown = useMemo(() => {
    const counts = { breakthrough: 0, debt: 0, relation: 0 }
    done.forEach((t) => {
      if (counts[t.category] !== undefined) counts[t.category]++
    })
    return counts
  }, [done])

  const handleSave = () => {
    if (!nextWeekText.trim()) return
    const todayKey = new Date().toISOString().slice(0, 10)
    addDailyReflection(todayKey, `[周复盘] 下周预备: ${nextWeekText.trim()}`)
    setSaved(true)
    setNextWeekText('')
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
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>周复盘</div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{getWeekLabel()}</div>
        </div>
      </div>

      {/* Completion Overview */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>完成情况</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeDasharray={`${completionRate}, 100`}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--accent)' }}>
              {completionRate}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <CheckCircle2 size={14} color="var(--success)" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>已完成 {done.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Clock size={14} color="var(--accent)" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>进行中 {inProgress.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color="var(--text-tertiary)" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>未开始 {notStarted.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>时间分配（已完成）</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {Object.entries(categoryBreakdown).map(([key, val]) => (
            <div key={key} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: `var(--${key})` }}>{val}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{CATEGORY_LABELS[key]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Review */}
      {weekCampaigns.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>主战役回顾</div>
          {weekCampaigns.map((c) => (
            <div key={c.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Target size={14} color="var(--accent)" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{c.title}</span>
              </div>
              {c.progress && c.progress.length > 0 ? (
                c.progress.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      marginBottom: '3px',
                      marginLeft: '22px',
                    }}
                  >
                    {p.content}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '22px' }}>没有推进记录</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Done tasks */}
      {done.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>本周完成</div>
          {done.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <CheckCircle2 size={14} color="var(--success)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Next Week Prep */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>下周预备</div>
        {saved ? (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--success)', fontSize: '14px' }}>
            ✓ 已保存
          </div>
        ) : (
          <>
            <textarea
              value={nextWeekText}
              onChange={(e) => setNextWeekText(e.target.value)}
              placeholder="下周要打穿什么？需要提前准备什么？"
              rows={3}
              style={{
                width: '100%',
                fontSize: '16px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                resize: 'none',
              }}
            />
            <button
              onClick={handleSave}
              disabled={!nextWeekText.trim()}
              style={{
                marginTop: '8px',
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                background: nextWeekText.trim() ? 'var(--accent)' : 'var(--bg-input)',
                color: nextWeekText.trim() ? '#fff' : 'var(--text-tertiary)',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Plus size={16} />
              保存
            </button>
          </>
        )}
      </div>
    </div>
  )
}
