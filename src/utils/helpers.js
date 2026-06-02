import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// Cache week boundaries to avoid repeated Date creation
let cachedWeekKey = ''
let cachedWeekStart = null
let cachedWeekEnd = null

function ensureWeekBoundaries() {
  const now = new Date()
  const key = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  if (key !== cachedWeekKey) {
    cachedWeekKey = key
    cachedWeekStart = startOfWeek(now, { weekStartsOn: 1 })
    cachedWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
  }
  return { start: cachedWeekStart, end: cachedWeekEnd }
}

export function getWeekStart(date) {
  if (!date) {
    return ensureWeekBoundaries().start
  }
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekEnd(date) {
  if (!date) {
    return ensureWeekBoundaries().end
  }
  return endOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekLabel(date) {
  const start = date ? startOfWeek(date, { weekStartsOn: 1 }) : getWeekStart()
  const end = date ? endOfWeek(date, { weekStartsOn: 1 }) : getWeekEnd()
  return `${format(start, 'M月d日')} — ${format(end, 'M月d日')}`
}

export function isThisWeek(dateStr) {
  const date = new Date(dateStr)
  const { start, end } = ensureWeekBoundaries()
  return isWithinInterval(date, { start, end })
}

// Unified: a task is "this week" if assigned to any day OR created this week
export function isThisWeekTask(task) {
  if (task.day !== null && task.day !== undefined) return true
  return isThisWeek(task.createdAt)
}

export function getThisWeekTasks(tasks) {
  return tasks.filter(isThisWeekTask)
}

export function getPastWeeks(n = 8) {
  const weeks = []
  for (let i = 0; i < n; i++) {
    const d = subWeeks(new Date(), i)
    weeks.push({
      key: format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      label: getWeekLabel(d),
      start: startOfWeek(d, { weekStartsOn: 1 }),
      end: endOfWeek(d, { weekStartsOn: 1 }),
    })
  }
  return weeks
}

export function getTodayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getTodayLabel() {
  return format(new Date(), 'M月d日 EEEE', { locale: zhCN })
}

export function getDayIndex(date = new Date()) {
  const d = date.getDay()
  return d === 0 ? 6 : d - 1
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 18)
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15)
}

export function clampText(text, max = 50) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}
