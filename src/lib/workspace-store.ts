import { deriveRisks } from './risk-engine'
import type { Activity, Meeting, Report, Task } from '../types/shell'
import type { WorkspaceState } from '../types/workspace'

const STORAGE_KEY = 'teampulse.workspace.v2'

function createEntityId() {
  return Date.now() + Math.floor(Math.random() * 100000)
}

export function loadWorkspace(): WorkspaceState {
  if (typeof window === 'undefined') {
    return createEmptyWorkspace()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return createEmptyWorkspace()
    }

    return JSON.parse(raw) as WorkspaceState
  } catch {
    return createEmptyWorkspace()
  }
}

export function saveWorkspace(workspace: WorkspaceState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
}

export function createEmptyWorkspace(): WorkspaceState {
  return {
    initialized: false,
    user: {
      name: '',
      email: '',
    },
    team: {
      name: '',
      courseName: '',
      semester: '2026-1',
      dueDate: '',
      inviteCode: createInviteCode(),
      inviteUrl: '',
    },
    members: [],
    tasks: [],
    meetings: [],
    activities: [],
    reports: [],
    risks: [],
  }
}

export function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function buildActivity(summary: string, actor: string): Activity {
  return {
    id: createEntityId(),
    actor,
    at: formatTimestamp(new Date()),
    summary,
  }
}

export function buildTask(input: {
  title: string
  owner: string
  dueDate: string
  blockers?: string[]
}): Task {
  return {
    id: createEntityId(),
    title: input.title,
    owner: input.owner,
    status: 'TODO',
    dueDate: input.dueDate,
    priority: input.blockers?.length ? 'HIGH' : 'MEDIUM',
    blockers: input.blockers ?? [],
    next: [],
    note: '첫 입력으로 생성된 작업입니다.',
  }
}

export function buildMeeting(input: {
  title: string
  time: string
  agenda: string
  decisions?: string[]
  actions?: string[]
}): Meeting {
  return {
    id: createEntityId(),
    title: input.title,
    time: input.time,
    agenda: input.agenda,
    decisions: input.decisions ?? [],
    actions: input.actions ?? [],
  }
}

export function buildReport(tasks: Task[], meetings: Meeting[]): Report {
  const doneCount = tasks.filter((task) => task.status === 'DONE').length
  const periodStart = new Date()
  periodStart.setDate(1)

  return {
    id: createEntityId(),
    label: `팀 요약 리포트 ${new Date().toLocaleDateString('ko-KR')}`,
    range: `${periodStart.toLocaleDateString('ko-KR')} ~ ${new Date().toLocaleDateString('ko-KR')}`,
    status: meetings.length || doneCount ? 'READY' : 'GENERATING',
  }
}

export { deriveRisks }

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}
