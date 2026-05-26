import {
  deleteTeamPulseMember,
  regenerateTeamPulseInviteCode,
  updateTeamPulseTeam,
} from '../../apis/team-pulse'
import type { Member, WorkspaceState } from '../../types/workspace'
import type { ShowToast, WorkspaceActionRunner } from './workspace-types'

export function useTeamActions(
  workspace: WorkspaceState,
  runWorkspaceAction: WorkspaceActionRunner,
  showToast: ShowToast,
) {
  const saveTeam = (team: { name: string; courseName: string; semester: string; dueDate: string }) => {
    runWorkspaceAction(
      () => updateTeamPulseTeam(team),
    )
  }

  const removeMember = (member: Member) => {
    const currentMember = workspace.members.find((item) => item.name === workspace.user.name)

    if (currentMember?.role !== 'LEADER') return showToast('팀장만 팀원을 내보낼 수 있습니다.', 'error')
    if (member.name === workspace.user.name) return showToast('자기 자신은 내보낼 수 없습니다.', 'error')
    if (workspace.members.length === 1) return showToast('최소 한 명의 팀원은 있어야 합니다.', 'error')
    if (workspace.tasks.some((task) => task.owner === member.name && task.status !== 'DONE')) {
      return showToast('완료되지 않은 할 일이 있는 팀원은 제외할 수 없습니다.', 'error')
    }

    runWorkspaceAction(
      () => deleteTeamPulseMember(member.id),
      '팀원이 제외되었습니다.'
    )
  }

  const regenerateInvite = () => {
    runWorkspaceAction(
      () => regenerateTeamPulseInviteCode(),
      '초대 링크가 생성되었습니다.'
    )
  }

  return {
    regenerateInvite,
    removeMember,
    saveTeam,
  }
}
