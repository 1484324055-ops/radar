import { useState } from 'react'
import { ArrowLeft, Moon, Sun, Palette, Download, Upload, Trash2, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../stores/useStore'
import { THEMES, THEME_LABELS } from '../utils/constants'

function ThemeButton({ themeKey, currentTheme, onSelect }) {
  const active = currentTheme === themeKey
  const colors = {
    light: { bg: '#F8F9FA', accent: '#6366F1', text: '#1A1B1E' },
    dark: { bg: '#1A1B1E', accent: '#818CF8', text: '#F3F4F6' },
    warm: { bg: '#FFF8F0', accent: '#D97706', text: '#3D2E1F' },
  }
  const c = colors[themeKey]
  const icons = { light: Sun, dark: Moon, warm: Palette }
  const Icon = icons[themeKey]

  return (
    <button
      onClick={() => onSelect(themeKey)}
      style={{
        flex: 1,
        padding: '14px 12px',
        borderRadius: '14px',
        background: c.bg,
        border: active ? `2px solid var(--accent)` : '2px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
        boxShadow: active ? 'var(--shadow-md)' : 'none',
      }}
    >
      <Icon size={20} color={c.accent} />
      <span style={{ fontSize: '12px', fontWeight: active ? 600 : 400, color: c.text }}>{THEME_LABELS[themeKey]}</span>
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const clearAllData = useStore((s) => s.clearAllData)
  const tasks = useStore((s) => s.tasks)
  const captures = useStore((s) => s.captures)
  const campaigns = useStore((s) => s.campaigns)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `radar-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const success = importData(ev.target.result)
        if (success) alert('导入成功！')
        else alert('导入失败，文件格式可能不正确')
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClear = () => {
    clearAllData()
    setShowClearConfirm(false)
  }

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/')}
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
        <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>设置</span>
      </div>

      {/* Theme */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>主题</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {THEMES.map((t) => (
            <ThemeButton key={t} themeKey={t} currentTheme={theme} onSelect={setTheme} />
          ))}
        </div>
      </div>

      {/* Data Stats */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>数据统计</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>任务总数</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{tasks.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>倾倒记录</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{captures.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>主战役</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{campaigns.length}</span>
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>数据管理</div>

        <button
          onClick={handleExport}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <Download size={16} />
          导出数据（JSON）
        </button>

        <button
          onClick={handleImport}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <Upload size={16} />
          导入数据
        </button>

        {showClearConfirm ? (
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--danger)', marginBottom: '8px', fontWeight: 500 }}>
              确定清除所有数据？此操作不可恢复。
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                }}
              >
                取消
              </button>
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                确认清除
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Trash2 size={16} />
            清除所有数据
          </button>
        )}
      </div>

      {/* About */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Info size={16} color="var(--text-tertiary)" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>关于</span>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          雷达 — 基于「梳理—合并—突破」方法论的个人工作台。
          <br />
          数据存储在本地浏览器中，建议定期导出备份。
          <br />
          v1.0.0
        </div>
      </div>
    </div>
  )
}
