import { requestJson } from './client'
import type {
  TaskCreateRequest,
  TaskCreateResult,
  TaskDependencyResult,
  TaskStatus,
  TaskStatusResult,
  TaskSummary,
  TaskUpdateRequest,
  TaskUpdateResult,
} from './types'

export const taskApi = {
  create(projectId: number, input: TaskCreateRequest) {
    return requestJson<TaskCreateResult>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  list(projectId: number) {
    return requestJson<TaskSummary[]>(`/api/projects/${projectId}/tasks`, {}, false)
  },
  update(taskId: number, input: TaskUpdateRequest) {
    return requestJson<TaskUpdateResult>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },
  remove(taskId: number) {
    return requestJson<null>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },
  updateStatus(taskId: number, status: TaskStatus) {
    return requestJson<TaskStatusResult>(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
  addDependency(taskId: number, precedingTaskId: number) {
    return requestJson<TaskDependencyResult>(
      `/api/tasks/${taskId}/dependencies`,
      {
        method: 'POST',
        body: JSON.stringify({ precedingTaskId }),
      },
    )
  },
  removeDependency(taskId: number, dependencyId: number) {
    return requestJson<null>(
      `/api/tasks/${taskId}/dependencies/${dependencyId}`,
      {
        method: 'DELETE',
      },
    )
  },
}
