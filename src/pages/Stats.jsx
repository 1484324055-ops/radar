import { useMemo, lazy, Suspense } from 'react'
import { TrendingUp, Target, CheckCircle2, Clock } from 'lucide-react'
import useStore from '../stores/useStore'
import { STATUS, CATEGORY_LABELS } from '../utils/constants'
import { getPastWeeks, isThisWeek } from '../utils/helpers'

// Dynamic import recharts to reduce initial bundle size
const RechartsLazy = lazy(() => import('recharts'))

const COLORS = ['#8B5CF6', '#F97316', '#06B6D4']

function ChartFallback() {
  return (
    <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
      加载图表中...
    </div>
  )
}

function StatBox({ icon, label, value, color }) {
  return (
    <div className="card" style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{label}</div>
    </div>
  )
}

function CategoryChart({ data, total }) {
  if (total === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>本周还没有任务</div>
  }

  return (
    <Suspense fallback={<ChartFallback />}>
      <RechartsLazy>
        {({ PieChart, Pie, Cell, ResponsiveContainer }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.filter((d) => d.value > 0).map((entry, i) => (
                      <Cell key={entry.key} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {data.map((d, i) => (
                <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </RechartsLazy>
    </Suspense>
  )
}

function TrendChart({ data }) {
  if (!data.some((d) => d.total > 0)) {
    return <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>暂无数据</div>
  }

  return (
    <Suspense fallback={<ChartFallback />}>
      <RechartsLazy>
        {({ BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer }) => (
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" fill="var(--accent-bg)" radius={[4, 4, 0, 0]} name="任务" />
                <Bar dataKey="done" fill="var(--accent)" radius={[4, 4, 0, 0]} name="完成" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </RechartsLazy>
    </Suspense>
  )
}

export default function Stats() {
  const tasks = useStore((s) => s.tasks)
  const campaigns = useStore((s) => s.campaigns)

  const weekStats = useMemo(() => {
    const weekTasks = tasks.filter((t) => isThisWeek(t.createdAt))
    const total = weekTasks.length
    const done = weekTasks.filter((t) => t.status === STATUS.DONE).length
    return { total, done, rate: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [tasks])

  const categoryData = useMemo(() => {
    const weekTasks = tasks.filter((t) => t.status !== 'not-doing' && isThisWeek(t.createdAt))
    const counts = { breakthrough: 0, debt: 0, relation: 0 }
    weekTasks.forEach((t) => {
      if (counts[t.category] !== undefined) counts[t.category]++
    })
    return Object.entries(counts).map(([key, value]) => ({
      name: CATEGORY_LABELS[key],
      value,
      key,
    }))
  }, [tasks])

  const weeklyTrend = useMemo(() => {
    const weeks = getPastWeeks(8)
    return weeks
      .map((week) => {
        const weekTasks = tasks.filter((t) => {
          const d = new Date(t.createdAt)
          return d >= week.start && d <= week.end
        })
        const done = weekTasks.filter((t) => t.status === STATUS.DONE).length
        return {
          name: week.label.split('—')[0].trim(),
          total: weekTasks.length,
          done,
        }
      })
      .reverse()
  }, [tasks])

  const campaignHistory = useMemo(() => {
    const weeks = getPastWeeks(4)
    return weeks.map((week) => {
      const weekCampaigns = campaigns.filter((c) => {
        const d = new Date(c.createdAt)
        return d >= week.start && d <= week.end
      })
      return { week: week.label.split('—')[0].trim(), campaigns: weekCampaigns }
    })
  }, [campaigns])

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>数据</div>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>本周概览</div>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <StatBox icon={<CheckCircle2 size={16} color="var(--success)" />} label="本周完成" value={weekStats.done} color="var(--success)" />
        <StatBox icon={<Clock size={16} color="var(--accent)" />} label="本周任务" value={weekStats.total} color="var(--accent)" />
        <StatBox icon={<TrendingUp size={16} color="var(--breakthrough)" />} label="完成率" value={`${weekStats.rate}%`} color="var(--breakthrough)" />
      </div>

      {/* Category Pie */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>时间分配</div>
        <CategoryChart data={categoryData} total={weekStats.total} />
      </div>

      {/* Weekly Trend */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>周趋势</div>
        <TrendChart data={weeklyTrend} />
      </div>

      {/* Campaign History */}
      <div className="card">
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={16} color="var(--accent)" />
          主战役历史
        </div>
        {campaignHistory.map((week) => (
          <div key={week.week} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{week.week}</div>
            {week.campaigns.length > 0 ? (
              week.campaigns.map((c) => (
                <div
                  key={c.id}
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    padding: '6px 10px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Target size={12} color="var(--accent)" />
                  {c.title}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', padding: '4px 0' }}>无主战役</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
