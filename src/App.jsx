import { Routes, Route, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import useTheme from './hooks/useTheme'
import useStore from './stores/useStore'
import TabBar from './components/TabBar'
import QuickCapture from './components/QuickCapture'
import Dashboard from './pages/Dashboard'
import Capture from './pages/Capture'
import Inbox from './pages/Inbox'
import Tasks from './pages/Tasks'
import Week from './pages/Week'
import Stats from './pages/Stats'
import Settings from './pages/Settings'

function FloatingCaptureButton() {
  const toggleQuickCapture = useStore((s) => s.toggleQuickCapture)
  const location = useLocation()
  // Hide on capture page (redundant) and settings
  if (location.pathname === '/capture' || location.pathname === '/settings') return null

  return (
    <button
      onClick={toggleQuickCapture}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: 'calc(80px + var(--sab))',
        width: '52px',
        height: '52px',
        borderRadius: '16px',
        background: 'var(--accent)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
        zIndex: 90,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  )
}

export default function App() {
  useTheme()

  return (
    <>
      <div className="page-content" style={{ flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/week" element={<Week />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <TabBar />
      <FloatingCaptureButton />
      <QuickCapture />
    </>
  )
}
