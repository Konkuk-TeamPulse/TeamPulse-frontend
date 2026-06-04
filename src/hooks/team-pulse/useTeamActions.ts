import {
  deleteTeamPulseMember,
  leaveTeamPulseProject,
  regenerateTeamPulseInviteCode,
  updateTeamPulseTeam,
} from '../../apis/team-pulse'
import { createEmptyWorkspace } from '../../lib/workspace-store'
import type { Member, WorkspaceState } from '../../types/workspace'
import type { ShowToast, WorkspaceActionRunner, WorkspaceSetters } from './workspace-types'

export function useTeamActions(
  workspace: WorkspaceState,
  runWorkspaceAction: WorkspaceActionRunner,
  showToast: ShowToast,
  setters: WorkspaceSetters,
) {
  const saveTeam = (team: { name: string; courseName: string; semester: string; dueDate: string }) => {
    runWorkspaceAction(
      () => updateTeamPulseTeam(team),
    )
  }

  const removeMember = (member: Member) => {
    const currentMember = workspace.members.find((item) => item.email === workspace.user.email)

    if (currentMember?.role !== 'LEADER') return showToast('팀장만 팀원을 내보낼 수 있습니다.', 'error')
    if (member.email === workspace.user.email) return showToast('본인은 내보낼 수 없습니다.', 'error')
    if (workspace.members.length === 1) return showToast('최소 한 명의 팀원은 있어야 합니다.', 'error')
    if (workspace.tasks.some((task) => task.owner === member.name && task.status !== 'DONE')) {
      return showToast('완료되지 않은 업무가 있는 팀원은 내보낼 수 없습니다.', 'error')
    }

    runWorkspaceAction(
      () => deleteTeamPulseMember(member.id),
      '팀원을 내보냈습니다.'
    )
  }

  const regenerateInvite = () => {
    runWorkspaceAction(
      () => regenerateTeamPulseInviteCode(),
      '초대 링크가 생성되었습니다.'
    )
  }

  const leaveProject = async () => {
    const currentMember = workspace.members.find((item) => item.email === workspace.user.email)
    const isLeader = currentMember?.role === 'LEADER'
    const isLastMember = workspace.members.length === 1

    if (isLeader && !isLastMember) {
      showToast('팀원이 남아 있으면 팀장은 탈퇴할 수 없습니다.', 'error')
      return
    }
    const confirmMessage = isLeader && isLastMember
      ? '혼자 남은 팀장이 탈퇴하면 프로젝트가 삭제됩니다. 계속하시겠습니까?'
      : '팀에서 탈퇴하시겠습니까?'

    if (!window.confirm(confirmMessage)) return

    try {
      const nextProjects = await leaveTeamPulseProject()
      setters.setProjects(nextProjects)
      setters.setWorkspace(createEmptyWorkspace())
      setters.setTransport('api')
      setters.setView('home')
      showToast(isLeader && isLastMember ? '팀에서 탈퇴했습니다. 프로젝트가 삭제되었습니다.' : '팀에서 탈퇴했습니다.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : '팀 탈퇴에 실패했습니다.'
      showToast(message, 'error')
    }
  }

  return {
    leaveProject,
    regenerateInvite,
    removeMember,
    saveTeam,
  }
}
