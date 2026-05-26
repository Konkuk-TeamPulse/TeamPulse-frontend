import { invitationApi } from '..'
import { saveActiveProjectId } from './active-project'
import { loadWorkspaceByProject } from './workspace-api'

export async function loadInvitationInfo(inviteCode: string) {
  return invitationApi.get(inviteCode)
}

export async function acceptTeamPulseInvitation(inviteCode: string) {
  const accepted = await invitationApi.accept(inviteCode)
  saveActiveProjectId(accepted.projectId)
  return loadWorkspaceByProject(accepted.projectId)
}
