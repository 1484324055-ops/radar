import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Target, CheckCircle2, Clock, Pause, ChevronRight, Settings, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react'
import useStore from '../stores/useStore'
import { STATUS, DAY_ROLES, STATUS_ICONS, CATEGORY_LABELS } from '../utils/constants'
import { getDayIndex, getTodayLabel, getWeekLabel, isThisWeek, getThisWeekTasks } from '../utils/helpers'
import { hapticLight } from '../utils/haptics'

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

function PipelineHint({ unprocessed, unassigned }) {
  if (unprocessed === 0 && unassigned === 0) return null

  return (
    <div
      className="card"
      style={{
        marginBottom: '16px',
        background: 'var(--warning-bg)',
        borderColor: 'var(--warning)',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <AlertCircle size={16} color="var(--warning)" />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>工作流卡住了</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {unprocessed > 0 && (
          <button
            onClick={() => {
              hapticLight()
              window.location.hash = '#/inbox'
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              padding: '6px 0',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            <Zap size={14} color="var(--accent)" />
            <span>{unprocessed} 条倾倒待翻译</span>
            <ArrowRight size={14} color="var(--accent)" style={{ marginLeft: 'auto' }} />
          </button>
        )}
        {unassigned > 0 && (
          <button
            onClick={() => {
              hapticLight()
              window.location.hash = '#/tasks'
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              padding: '6px 0',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            <Target size={14} color="var(--accent)" />
            <span>{unassigned} 个任务未分配到天</span>
            <ArrowRight size={14} color="var(--accent)" style={{ marginLeft: 'auto' }} />
          </button>
        )}
      </div>
    </div>
  )
}

function CampaignCountdown({ campaign }) {
  if (!campaign) return null

  const createdAt = new Date(campaign.createdAt)
  const deadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000)
  const now = new Date()
  const remaining = deadline - now
  const isExpired = remaining <= 0
  const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)))
  const minutes = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)))

  return (
    <div className="card" style={{ marginBottom: '16px', background: isExpired ? 'var(--danger-bg)' : 'var(--accent-bg)', borderColor: isExpired ? 'var(--danger)' : 'var(--accent-border)', borderWidth: '1px', borderStyle: 'solid' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={16} color={isExpired ? 'var(--danger)' : 'var(--accent)'} />
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.title}</span>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '8px',
          background: isExpired ? 'var(--danger)' : 'var(--accent)',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {isExpired ? '已超时' : `${hours}h ${minutes}m`}
        </div>
      </div>
      {campaign.pushPlan && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '24px' }}>{campaign.pushPlan}</div>
      )}
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

  // 48h countdown: show the campaign with the nearest deadline
  const activeCampaign = useMemo(() => {
    return weekCampaigns.find((c) => {
      const deadline = new Date(new Date(c.createdAt).getTime() + 48 * 60 * 60 * 1000)
      return deadline > new Date() || weekCampaigns.length === 1
    }) || weekCampaigns[0]
  }, [weekCampaigns])

  // Today's tasks
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.day === todayIdx && t.status !== 'not-doing' && t.status !== 'done'),
    [tasks, todayIdx]
  )

  // Pipeline hints
  const unassignedTasks = useMemo(
    () => tasks.filter((t) => (t.day === null || t.day === undefined) && t.status !== 'not-doing' && t.status !== 'done').length,
    [tasks]
  )

  const statusColors = {
    'not-started': 'var(--text-tertiary)',
    'in-progress': 'var(--accent)',
    done: 'var(--success)',
    paused: 'var(--warning)',
  }

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
        <button
          onClick={() => navigate('/daily-review')}
          style={{
            marginTop: '10px',
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.3)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          每日复盘
        </button>
      </div>

      {/* Campaign 48h Countdown */}
      <CampaignCountdown campaign={activeCampaign} />

      {/* Pipeline Hints */}
      <PipelineHint unprocessed={stats.unprocessed} unassigned={unassignedTasks} />

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>今日任务 ({todayTasks.length})</span>
            <button
              onClick={() => navigate('/tasks')}
              style={{ background: 'none', color: 'var(--accent)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              全部 <ChevronRight size={14} />
            </button>
          </div>
          {todayTasks.map((t) => (
            <div key={t.id} className="card" style={{ marginBottom: '6px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: statusColors[t.status] || 'var(--text-tertiary)' }}>
                  {STATUS_ICONS[t.status]}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>{t.title}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: `var(--${t.category}-bg)`,
                    color: `var(--${t.category})`,
                  }}
                >
                  {CATEGORY_LABELS[t.category]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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
      {weekCampaigns.length > 0 && (
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
          {weekCampaigns.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: '6px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={14} color="var(--accent)" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{c.title}</span>
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
