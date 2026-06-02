import { create } from 'zustand'
import { generateId, getWeekStart, getTodayKey } from '../utils/helpers'
import { format } from 'date-fns'

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
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

const defaultState = {
  theme: 'light',
  captures: [],
  tasks: [],
  campaigns: [],
  dailyLogs: {},
  showQuickCapture: false,
}

const useStore = create((set, get) => ({
  ...defaultState,
  ...(loadFromStorage() || {}),

  // ── Theme ──
  setTheme: (theme) => {
    set({ theme })
    saveToStorage({ ...get(), theme })
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
    set((s) => {
      const captures = [capture, ...s.captures]
      saveToStorage({ ...s, captures })
      return { captures }
    })
  },

  deleteCapture: (id) => {
    set((s) => {
      const captures = s.captures.filter((c) => c.id !== id)
      saveToStorage({ ...s, captures })
      return { captures }
    })
  },

  markCaptureProcessed: (id) => {
    set((s) => {
      const captures = s.captures.map((c) => (c.id === id ? { ...c, processed: true } : c))
      saveToStorage({ ...s, captures })
      return { captures }
    })
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
    set((s) => {
      const tasks = [newTask, ...s.tasks]
      saveToStorage({ ...s, tasks })
      return { tasks }
    })
    return newTask.id
  },

  updateTask: (id, updates) => {
    set((s) => {
      const tasks = s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      saveToStorage({ ...s, tasks })
      return { tasks }
    })
  },

  deleteTask: (id) => {
    set((s) => {
      const tasks = s.tasks.filter((t) => t.id !== id)
      saveToStorage({ ...s, tasks })
      return { tasks }
    })
  },

  cycleTaskStatus: (id) => {
    const cycle = ['not-started', 'in-progress', 'done', 'paused']
    set((s) => {
      const task = s.tasks.find((t) => t.id === id)
      if (!task) return s
      const idx = cycle.indexOf(task.status)
      const next = cycle[(idx + 1) % cycle.length]
      const tasks = s.tasks.map((t) => (t.id === id ? { ...t, status: next } : t))
      saveToStorage({ ...s, tasks })
      return { tasks }
    })
  },

  addTaskNote: (taskId, content) => {
    set((s) => {
      const tasks = s.tasks.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          notes: [...(t.notes || []), { content, createdAt: new Date().toISOString() }],
        }
      })
      saveToStorage({ ...s, tasks })
      return { tasks }
    })
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
    set((s) => {
      const campaigns = [newCampaign, ...s.campaigns]
      saveToStorage({ ...s, campaigns })
      return { campaigns }
    })
    return newCampaign.id
  },

  updateCampaign: (id, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c))
      saveToStorage({ ...s, campaigns })
      return { campaigns }
    })
  },

  deleteCampaign: (id) => {
    set((s) => {
      const campaigns = s.campaigns.filter((c) => c.id !== id)
      // Also unlink tasks
      const tasks = s.tasks.map((t) => (t.campaignId === id ? { ...t, campaignId: null } : t))
      saveToStorage({ ...s, campaigns, tasks })
      return { campaigns, tasks }
    })
  },

  addCampaignProgress: (campaignId, content) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        return {
          ...c,
          progress: [...(c.progress || []), { content, createdAt: new Date().toISOString() }],
        }
      })
      saveToStorage({ ...s, campaigns })
      return { campaigns }
    })
  },

  // ── Daily Logs ──
  setDailyLog: (date, log) => {
    set((s) => {
      const dailyLogs = { ...s.dailyLogs, [date]: { ...s.dailyLogs[date], ...log } }
      saveToStorage({ ...s, dailyLogs })
      return { dailyLogs }
    })
  },

  addDailyReflection: (date, content) => {
    set((s) => {
      const existing = s.dailyLogs[date] || { reflections: [] }
      const dailyLogs = {
        ...s.dailyLogs,
        [date]: {
          ...existing,
          reflections: [...(existing.reflections || []), { content, createdAt: new Date().toISOString() }],
        },
      }
      saveToStorage({ ...s, dailyLogs })
      return { dailyLogs }
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
      set({
        theme: data.theme || 'light',
        captures: data.captures || [],
        tasks: data.tasks || [],
        campaigns: data.campaigns || [],
        dailyLogs: data.dailyLogs || {},
      })
      saveToStorage(data)
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
}))

export default useStore
