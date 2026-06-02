import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Plus, X, ChevronRight } from 'lucide-react'
import useStore from '../stores/useStore'
import { DAY_NAMES, DAY_ROLES, CATEGORY_LABELS, STATUS_LABELS, STATUS_ICONS } from '../utils/constants'
import { getWeekStart, getDayIndex, isThisWeek, getWeekLabel } from '../utils/helpers'
import { format } from 'date-fns'
import EmptyState from '../components/EmptyState'

function CampaignSection() {
  const campaigns = useStore((s) => s.campaigns)
  const tasks = useStore((s) => s.tasks)
  const addCampaign = useStore((s) => s.addCampaign)
  const deleteCampaign = useStore((s) => s.deleteCampaign)
  const addCampaignProgress = useStore((s) => s.addCampaignProgress)
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [pushPlan, setPushPlan] = useState('')
  const [progressText, setProgressText] = useState({})

  const weekCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (isThisWeek(c.createdAt)) return true
      // Also show campaigns that still have in-progress tasks
      return tasks.some((t) => t.campaignId === c.id && t.status === 'in-progress')
    })
  }, [campaigns, tasks])

  const handleAdd = () => {
    if (!title.trim()) return
    addCampaign({ title: title.trim(), pushPlan: pushPlan.trim() })
    setTitle('')
    setPushPlan('')
    setShowAdd(false)
  }

  const handleAddProgress = (campaignId) => {
    const text = progressText[campaignId]?.trim()
    if (!text) return
    addCampaignProgress(campaignId, text)
    setProgressText((prev) => ({ ...prev, [campaignId]: '' }))
  }

  const getCampaignTasks = (campaignId) => tasks.filter((t) => t.campaignId === campaignId)

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={18} color="var(--accent)" />
          主战役
        </span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '10px' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="本周要打穿什么？"
            autoFocus
            style={{ marginBottom: '8px', fontSize: '15px' }}
          />
          <input
            value={pushPlan}
            onChange={(e) => setPushPlan(e.target.value)}
            placeholder="48 小时推进计划（可选）"
            style={{ marginBottom: '10px', fontSize: '14px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
              }}
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '10px',
                background: title.trim() ? 'var(--accent)' : 'var(--bg-input)',
                color: title.trim() ? '#fff' : 'var(--text-tertiary)',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              设定
            </button>
          </div>
        </div>
      )}

      {weekCampaigns.length === 0 && !showAdd ? (
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>本周还没有主战役</div>
        </div>
      ) : (
        weekCampaigns.map((c) => {
          const cTasks = getCampaignTasks(c.id)
          return (
            <div key={c.id} className="card" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{c.title}</div>
                  {c.pushPlan && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>推进计划: {c.pushPlan}</div>}
                </div>
                <button onClick={() => deleteCampaign(c.id)} style={{ background: 'none', color: 'var(--text-tertiary)', padding: '4px' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Progress */}
              {c.progress && c.progress.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  {c.progress.map((p, i) => (
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
                      {p.content}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Progress */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <input
                  value={progressText[c.id] || ''}
                  onChange={(e) => setProgressText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProgress(c.id)}
                  placeholder="记录推进..."
                  style={{ flex: 1, fontSize: '16px', padding: '8px 12px', borderRadius: '8px' }}
                />
                <button
                  onClick={() => handleAddProgress(c.id)}
                  style={{
                    padding: '0 12px',
                    borderRadius: '8px',
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  记录
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function WeekSchedule() {
  const tasks = useStore((s) => s.tasks)
  const todayIdx = getDayIndex()

  const weekDays = DAY_NAMES.map((name, i) => {
    const role = DAY_ROLES[i]
    const dayTasks = tasks.filter((t) => t.day === i)
    return { name, role, dayTasks, index: i }
  })

  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>本周节奏</div>
      {weekDays.map((day) => (
        <div
          key={day.index}
          className="card"
          style={{
            marginBottom: '8px',
            borderLeft: day.index === todayIdx ? '3px solid var(--accent)' : '3px solid transparent',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{day.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>{day.role.name}</span>
            </div>
            {day.dayTasks.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{day.dayTasks.length} 项</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{day.role.desc}</div>
          {day.dayTasks.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {day.dayTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    fontSize: '13px',
                    color: t.status === 'done' ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                    padding: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '10px' }}>{STATUS_ICONS[t.status]}</span>
                  {t.title}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Week() {
  const navigate = useNavigate()

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>本周</div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{getWeekLabel()}</div>
        </div>
        <button
          onClick={() => navigate('/weekly-review')}
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          周复盘
        </button>
      </div>

      <CampaignSection />
      <WeekSchedule />
    </div>
  )
}
