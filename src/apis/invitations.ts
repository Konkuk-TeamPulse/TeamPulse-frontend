import { requestJson } from './client'
import type { InvitationAcceptResult, InvitationCreateResult, InvitationInfo } from './types'

export const invitationApi = {
  create(projectId: number) {
    return requestJson<InvitationCreateResult>(
      `/api/projects/${projectId}/invitations`,
      {
        method: 'POST',
      },
    )
  },
  get(inviteCode: string) {
    return requestJson<InvitationInfo>(`/api/invitations/${inviteCode}`, {}, false)
  },
  accept(inviteCode: string) {
    return requestJson<InvitationAcceptResult>(
      `/api/invitations/${inviteCode}/accept`,
      {
        method: 'POST',
      },
    )
  },
}
