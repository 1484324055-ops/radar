import { create } from 'zustand'
import { generateId, getWeekStart, getTodayKey } from '../utils/helpers'
import { format } from 'date-fns'
import { saveToGist, loadFromGist, createGist, isConfigured } from '../utils/sync'

const STORAGE_KEY = 'radar-data'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return null
}

function saveToStorage(state) {
  try {
    const { theme, captures, tasks, campaigns, dailyLogs } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, captures, tasks, campaigns, dailyLogs }))
    return null
  } catch (e) {
    console.error('Failed to save data:', e)
    return e.name === 'QuotaExceededError' ? '存储空间已满，请导出数据后清理' : '数据保存失败'
  }
}

const defaultState = {
  theme: 'light',
  captures: [],
  tasks: [],
  campaigns: [],
  dailyLogs: {},
  showQuickCapture: false,
  saveError: null,
}

// Helper: save and return state update with error handling
function save(s, updates) {
  const merged = { ...s, ...updates }
  const err = saveToStorage(merged)
  return { ...updates, saveError: err }
}

const useStore = create((set, get) => ({
  ...defaultState,
  ...(loadFromStorage() || {}),
  saveError: null,

  clearSaveError: () => set({ saveError: null }),

  // ── Theme ──
  setTheme: (theme) => {
    set((s) => save(s, { theme }))
  },

  // ── Quick Capture toggle ──
  toggleQuickCapture: () => set((s) => ({ showQuickCapture: !s.showQuickCapture })),
  closeQuickCapture: () => set({ showQuickCapture: false }),

  // ── Captures (倾倒) ──
  addCapture: (content) => {
    const capture = {
      id: generateId(),
      content,
      createdAt: new Date().toISOString(),
      processed: false,
    }
    set((s) => save(s, { captures: [capture, ...s.captures] }))
  },

  deleteCapture: (id) => {
    set((s) => save(s, { captures: s.captures.filter((c) => c.id !== id) }))
  },

  markCaptureProcessed: (id) => {
    set((s) => save(s, { captures: s.captures.map((c) => (c.id === id ? { ...c, processed: true } : c)) }))
  },

  // ── Tasks ──
  addTask: (task) => {
    const newTask = {
      id: generateId(),
      title: task.title || '',
      description: task.description || '',
      status: 'not-started',
      priority: task.priority || 'normal',
      category: task.category || 'breakthrough',
      campaignId: task.campaignId || null,
      fromCaptureId: task.fromCaptureId || null,
      dueDate: task.dueDate || null,
      day: task.day || null,
      notes: [],
      createdAt: new Date().toISOString(),
    }
    set((s) => save(s, { tasks: [newTask, ...s.tasks] }))
    return newTask.id
  },

  updateTask: (id, updates) => {
    set((s) => save(s, { tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }))
  },

  deleteTask: (id) => {
    set((s) => save(s, { tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  cycleTaskStatus: (id) => {
    const cycle = ['not-started', 'in-progress', 'done', 'paused']
    set((s) => {
      const task = s.tasks.find((t) => t.id === id)
      if (!task) return s
      const idx = cycle.indexOf(task.status)
      const next = cycle[(idx + 1) % cycle.length]
      return save(s, { tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: next } : t)) })
    })
  },

  addTaskNote: (taskId, content) => {
    set((s) => save(s, {
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t
        return { ...t, notes: [...(t.notes || []), { content, createdAt: new Date().toISOString() }] }
      }),
    }))
  },

  // ── Campaigns (主战役) ──
  addCampaign: (campaign) => {
    const newCampaign = {
      id: generateId(),
      title: campaign.title || '',
      weekStart: format(getWeekStart(), 'yyyy-MM-dd'),
      pushPlan: campaign.pushPlan || '',
      progress: [],
      createdAt: new Date().toISOString(),
    }
    set((s) => save(s, { campaigns: [newCampaign, ...s.campaigns] }))
    return newCampaign.id
  },

  updateCampaign: (id, updates) => {
    set((s) => save(s, { campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)) }))
  },

  deleteCampaign: (id) => {
    set((s) => save(s, {
      campaigns: s.campaigns.filter((c) => c.id !== id),
      tasks: s.tasks.map((t) => (t.campaignId === id ? { ...t, campaignId: null } : t)),
    }))
  },

  addCampaignProgress: (campaignId, content) => {
    set((s) => save(s, {
      campaigns: s.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        return { ...c, progress: [...(c.progress || []), { content, createdAt: new Date().toISOString() }] }
      }),
    }))
  },

  // ── Daily Logs ──
  setDailyLog: (date, log) => {
    set((s) => save(s, { dailyLogs: { ...s.dailyLogs, [date]: { ...s.dailyLogs[date], ...log } } }))
  },

  addDailyReflection: (date, content) => {
    set((s) => {
      const existing = s.dailyLogs[date] || { reflections: [] }
      return save(s, {
        dailyLogs: {
          ...s.dailyLogs,
          [date]: { ...existing, reflections: [...(existing.reflections || []), { content, createdAt: new Date().toISOString() }] },
        },
      })
    })
  },

  // ── Data management ──
  exportData: () => {
    const { theme, captures, tasks, campaigns, dailyLogs } = get()
    return JSON.stringify({ theme, captures, tasks, campaigns, dailyLogs }, null, 2)
  },

  importData: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr)
      // Validate imported data structure
      const validated = {
        theme: ['light', 'dark', 'warm'].includes(data.theme) ? data.theme : 'light',
        captures: Array.isArray(data.captures) ? data.captures : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        campaigns: Array.isArray(data.campaigns) ? data.campaigns : [],
        dailyLogs: data.dailyLogs && typeof data.dailyLogs === 'object' ? data.dailyLogs : {},
      }
      set({ ...validated, saveError: null })
      saveToStorage(validated)
      return true
    } catch (e) {
      console.error('Import failed:', e)
      return false
    }
  },

  clearAllData: () => {
    set({ ...defaultState })
    localStorage.removeItem(STORAGE_KEY)
  },

  // ── Cloud Sync ──
  syncStatus: null, // null | 'syncing' | 'synced' | 'error'
  syncError: null,

  // Push local data to cloud
  pushToCloud: async () => {
    set({ syncStatus: 'syncing', syncError: null })
    try {
      const { theme, captures, tasks, campaigns, dailyLogs } = get()
      const data = { theme, captures, tasks, campaigns, dailyLogs }
      if (!isConfigured()) {
        await createGist(data)
      } else {
        await saveToGist(data)
      }
      set({ syncStatus: 'synced' })
      return true
    } catch (e) {
      set({ syncStatus: 'error', syncError: e.message })
      return false
    }
  },

  // Pull cloud data to local
  pullFromCloud: async () => {
    set({ syncStatus: 'syncing', syncError: null })
    try {
      const data = await loadFromGist()
      const validated = {
        theme: ['light', 'dark', 'warm'].includes(data.theme) ? data.theme : 'light',
        captures: Array.isArray(data.captures) ? data.captures : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        campaigns: Array.isArray(data.campaigns) ? data.campaigns : [],
        dailyLogs: data.dailyLogs && typeof data.dailyLogs === 'object' ? data.dailyLogs : {},
      }
      set({ ...validated, syncStatus: 'synced', saveError: null })
      saveToStorage(validated)
      return true
    } catch (e) {
      set({ syncStatus: 'error', syncError: e.message })
      return false
    }
  },

  // Auto-sync: push if local is newer, pull if cloud is newer
  autoSync: async () => {
    if (!isConfigured()) return
    set({ syncStatus: 'syncing', syncError: null })
    try {
      // Always push local first (simple strategy)
      const { theme, captures, tasks, campaigns, dailyLogs } = get()
      const data = { theme, captures, tasks, campaigns, dailyLogs }
      await saveToGist(data)
      set({ syncStatus: 'synced' })
    } catch (e) {
      set({ syncStatus: 'error', syncError: e.message })
    }
  },
}))

export default useStore
