import { ApiRequestError, invitationApi, memberApi, projectApi } from '..'
import { getActiveProjectId } from './active-project'
import { loadTeamPulseWorkspace, loadWorkspaceByProject } from './workspace-api'

export async function updateTeamPulseTeam(input: {
  name: string
  courseName: string
  semester: string
  dueDate: string
}) {
  const activeProjectId = getActiveProjectId()
  const current = await projectApi.get(activeProjectId)
  await projectApi.update(activeProjectId, {
    projectName: input.name,
    subject: input.courseName,
    description: input.semester || current.description,
    startDate: current.startDate,
    endDate: input.dueDate,
  })
  return loadWorkspaceByProject(activeProjectId)
}

export async function regenerateTeamPulseInviteCode() {
  const activeProjectId = getActiveProjectId()
  const invitation = await invitationApi.create(activeProjectId)
  const workspace = await loadWorkspaceByProject(activeProjectId)

  return {
    ...workspace,
    team: {
      ...workspace.team,
      inviteCode: invitation.inviteCode,
      inviteUrl: invitation.inviteUrl,
      inviteExpiredAt: invitation.expiredAt,
    },
  }
}

export async function deleteTeamPulseMember(memberId: number) {
  const activeProjectId = getActiveProjectId()
  const workspace = await loadWorkspaceByProject(activeProjectId)
  const currentMember = workspace.members.find((member) => member.name === workspace.user.name)
  const target = workspace.members.find((member) => member.id === memberId)

  if (currentMember?.role !== 'LEADER') {
    throw new ApiRequestError('팀장만 팀원을 내보낼 수 있습니다.', 403)
  }
  if (!target) {
    throw new ApiRequestError('내보낼 팀원을 찾을 수 없습니다.', 404)
  }
  if (target.name === workspace.user.name) {
    throw new ApiRequestError('자기 자신은 내보낼 수 없습니다.', 400)
  }

  await memberApi.remove(activeProjectId, memberId)
  return loadTeamPulseWorkspace()
}
