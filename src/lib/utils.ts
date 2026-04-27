import type { Task, TaskStatus } from '../types/shell'

export function formatDate(value: string) {
  if (!value) return '-'
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(date)
}

export function addDays(value: string, days: number) {
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return ''
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function normalizeDate(value: string) {
  if (!value) return '9999-99-99T99:99'
  return value.includes('T') ? value : `${value}T00:00`
}

export function createId() {
  return Date.now() + Math.floor(Math.random() * 10000)
}

export function parseLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

export function compareTasks(a: Task, b: Task) {
  const order: Record<TaskStatus, number> = { TODO: 0, DOING: 1, DONE: 2 }
  const statusGap = order[a.status] - order[b.status]
  if (statusGap !== 0) return statusGap
  return a.dueDate.localeCompare(b.dueDate)
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
