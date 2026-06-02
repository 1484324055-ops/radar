import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function getWeekStart(date = new Date()) {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekEnd(date = new Date()) {
  return endOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekLabel(date = new Date()) {
  const start = getWeekStart(date)
  const end = getWeekEnd(date)
  return `${format(start, 'M月d日')} — ${format(end, 'M月d日')}`
}

export function isThisWeek(dateStr) {
  const date = new Date(dateStr)
  return isWithinInterval(date, {
    start: getWeekStart(),
    end: getWeekEnd(),
  })
}

export function getPastWeeks(n = 8) {
  const weeks = []
  for (let i = 0; i < n; i++) {
    const d = subWeeks(new Date(), i)
    weeks.push({
      key: format(getWeekStart(d), 'yyyy-MM-dd'),
      label: getWeekLabel(d),
      start: getWeekStart(d),
      end: getWeekEnd(d),
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
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11)
}

export function clampText(text, max = 50) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}
