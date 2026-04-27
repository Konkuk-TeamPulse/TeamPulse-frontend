import { apiBaseUrl } from './api'
import type { TaskStatus } from '../types/shell'
import type { MemberRole, WorkspaceState } from '../types/workspace'

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: {
    code?: string
    message: string
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? `Request failed: ${response.status}`)
  }

  return payload.data
}

export async function loadAssignmentWorkspace() {
  return request<WorkspaceState>('/api/mobile/workspace')
}

export async function bootstrapAssignmentWorkspace(input: {
  name: string
  email: string
  teamName: string
  courseName: string
  semester: string
  dueDate: string
}) {
  return request<WorkspaceState>('/api/mobile/workspace/bootstrap', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function resetAssignmentWorkspace() {
  return request<WorkspaceState>('/api/mobile/workspace/reset', {
    method: 'POST',
  })
}

export async function loadAssignmentSampleWorkspace() {
  return request<WorkspaceState>('/api/mobile/workspace/sample', {
    method: 'POST',
  })
}

export async function createAssignmentTask(input: {
  title: string
  owner: string
  dueDate: string
  blockers: string[]
}) {
  return request<WorkspaceState>('/api/mobile/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateAssignmentTaskStatus(taskId: number, status: TaskStatus) {
  return request<WorkspaceState>(`/api/mobile/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function deleteAssignmentTask(taskId: number) {
  return request<WorkspaceState>(`/api/mobile/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

export async function createAssignmentMeeting(input: {
  title: string
  time: string
  agenda: string
  decisions: string[]
  actions: string[]
  actionOwner: string
  createTasks: boolean
}) {
  return request<WorkspaceState>('/api/mobile/meetings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function generateAssignmentReport() {
  return request<WorkspaceState>('/api/mobile/reports', {
    method: 'POST',
  })
}

export async function updateAssignmentTeam(input: {
  name: string
  courseName: string
  semester: string
  dueDate: string
}) {
  return request<WorkspaceState>('/api/mobile/team', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function regenerateAssignmentInviteCode() {
  return request<WorkspaceState>('/api/mobile/team/regenerate-invite', {
    method: 'POST',
  })
}

export async function createAssignmentMember(input: {
  name: string
  role: MemberRole
}) {
  return request<WorkspaceState>('/api/mobile/members', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function deleteAssignmentMember(memberId: number) {
  return request<WorkspaceState>(`/api/mobile/members/${memberId}`, {
    method: 'DELETE',
  })
}
