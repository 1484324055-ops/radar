import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Zap, Inbox, ListTodo, Calendar, BarChart3 } from 'lucide-react'

const tabs = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/capture', icon: Zap, label: '倾倒' },
  { path: '/inbox', icon: Inbox, label: '待处理' },
  { path: '/tasks', icon: ListTodo, label: '任务' },
  { path: '/week', icon: Calendar, label: '本周' },
  { path: '/stats', icon: BarChart3, label: '数据' },
]

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="tab-bar"
      style={{
        display: 'flex',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        paddingTop: '8px',
        paddingBottom: '8px',
        position: 'relative',
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        const Icon = tab.icon
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '6px 0',
              background: 'none',
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
              transition: 'color 0.2s',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.5} />
            <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
