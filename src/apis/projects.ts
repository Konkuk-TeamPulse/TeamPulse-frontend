import { requestJson } from './client'
import type {
  ActivityLog,
  DashboardResult,
  ProjectCreateRequest,
  ProjectCreateResult,
  ProjectDetail,
  ProjectSummary,
  ProjectUpdateResult,
  RisksResult,
} from './types'

export const projectApi = {
  create(input: ProjectCreateRequest) {
    return requestJson<ProjectCreateResult>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  list() {
    return requestJson<ProjectSummary[]>('/api/projects')
  },
  get(projectId: number) {
    return requestJson<ProjectDetail>(`/api/projects/${projectId}`, {}, false)
  },
  update(projectId: number, input: ProjectCreateRequest) {
    return requestJson<ProjectUpdateResult>(
      `/api/projects/${projectId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
      false,
    )
  },
  dashboard(projectId: number) {
    return requestJson<DashboardResult>(`/api/projects/${projectId}/dashboard`, {}, false)
  },
  risks(projectId: number) {
    return requestJson<RisksResult>(`/api/projects/${projectId}/risks`)
  },
  activityLogs(projectId: number) {
    return requestJson<ActivityLog[]>(`/api/projects/${projectId}/activity-logs`)
  },
}
