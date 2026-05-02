import { requestJson } from './client'
import type { MeetingCreateRequest, MeetingDetail, MeetingSummary } from './types'

export const meetingApi = {
  create(projectId: number, input: MeetingCreateRequest) {
    return requestJson<MeetingSummary[]>(
      `/api/projects/${projectId}/meetings`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
  },
  list(projectId: number) {
    return requestJson<MeetingSummary[]>(`/api/projects/${projectId}/meetings`)
  },
  get(meetingId: number) {
    return requestJson<MeetingDetail>(`/api/meetings/${meetingId}`)
  },
}
