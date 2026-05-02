import { requestJson } from './client'
import type { MemberSummary } from './types'

export const memberApi = {
  list(projectId: number) {
    return requestJson<MemberSummary[]>(`/api/projects/${projectId}/members`)
  },
  leave(projectId: number) {
    return requestJson<null>(`/api/projects/${projectId}/members/me`, {
      method: 'DELETE',
    })
  },
}
