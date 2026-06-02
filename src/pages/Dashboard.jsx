import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Target, CheckCircle2, Clock, Pause, TrendingUp, ChevronRight, Settings, HelpCircle } from 'lucide-react'
import useStore from '../stores/useStore'
import { STATUS, DAY_ROLES } from '../utils/constants'
import { getDayIndex, getTodayLabel, getWeekLabel, isThisWeek, getThisWeekTasks } from '../utils/helpers'

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        flex: 1,
        minWidth: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon}
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <span style={{ fontSize: '28px', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const campaigns = useStore((s) => s.campaigns)
  const captures = useStore((s) => s.captures)
  const toggleQuickCapture = useStore((s) => s.toggleQuickCapture)

  const todayIdx = getDayIndex()
  const todayRole = DAY_ROLES[todayIdx]

  const stats = useMemo(() => {
    const weekTasks = getThisWeekTasks(tasks)
    return {
      total: weekTasks.length,
      done: weekTasks.filter((t) => t.status === STATUS.DONE).length,
      inProgress: weekTasks.filter((t) => t.status === STATUS.IN_PROGRESS).length,
      paused: weekTasks.filter((t) => t.status === STATUS.PAUSED).length,
      unprocessed: captures.filter((c) => !c.processed).length,
    }
  }, [tasks, captures])

  const weekCampaigns = useMemo(
    () => campaigns.filter((c) => isThisWeek(c.createdAt)),
    [campaigns]
  )

  const inProgressTasks = useMemo(
    () => tasks.filter((t) => t.status === STATUS.IN_PROGRESS).slice(0, 3),
    [tasks]
  )

  return (
    <div className="page-content" style={{ padding: '16px', paddingBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{getTodayLabel()}</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>雷达</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('/help')}
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
            <HelpCircle size={18} />
          </button>
          <button
            onClick={() => navigate('/settings')}
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
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Day Role */}
      <div
        className="card"
        style={{
          marginBottom: '16px',
          background: `var(--${todayRole.type === 'breakthrough' ? 'breakthrough' : todayRole.type === 'debt' ? 'debt' : todayRole.type === 'relation' ? 'relation' : 'accent'}-bg)`,
          borderColor: `var(--${todayRole.type === 'breakthrough' ? 'breakthrough' : todayRole.type === 'debt' ? 'debt' : todayRole.type === 'relation' ? 'relation' : 'accent'}-border)`,
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>今日节奏</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{todayRole.name}</div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>{todayRole.desc}</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <StatCard
          icon={<CheckCircle2 size={16} color="var(--success)" />}
          label="已完成"
          value={stats.done}
          color="var(--success)"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          icon={<Clock size={16} color="var(--accent)" />}
          label="进行中"
          value={stats.inProgress}
          color="var(--accent)"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          icon={<Pause size={16} color="var(--warning)" />}
          label="暂停"
          value={stats.paused}
          color="var(--warning)"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          icon={<Zap size={16} color="var(--danger)" />}
          label="待处理"
          value={stats.unprocessed}
          color="var(--danger)"
          onClick={() => navigate('/inbox')}
        />
      </div>

      {/* Campaigns */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>本周主战役</span>
          <button
            onClick={() => navigate('/week')}
            style={{ background: 'none', color: 'var(--accent)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            查看 <ChevronRight size={14} />
          </button>
        </div>
        {weekCampaigns.length > 0 ? (
          weekCampaigns.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} color="var(--accent)" />
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</span>
              </div>
              {c.pushPlan && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '24px' }}>{c.pushPlan}</div>
              )}
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>还没有设定主战役</div>
            <button
              onClick={() => navigate('/week')}
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              去设定
            </button>
          </div>
        )}
      </div>

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>进行中的事</span>
            <button
              onClick={() => navigate('/tasks')}
              style={{ background: 'none', color: 'var(--accent)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              全部 <ChevronRight size={14} />
            </button>
          </div>
          {inProgressTasks.map((t) => (
            <div key={t.id} className="card" style={{ marginBottom: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{t.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Week Label */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
        {getWeekLabel()}
      </div>
    </div>
  )
}
