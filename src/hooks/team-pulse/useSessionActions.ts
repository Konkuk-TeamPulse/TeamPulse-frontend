import { ApiRequestError, clearAuthTokens, hasAccessToken, login, logout, signup } from '../../apis'
import {
  acceptTeamPulseInvitation,
  bootstrapTeamPulseWorkspace,
  listTeamPulseProjects,
  loadTeamPulseProject,
  resetTeamPulseWorkspace,
} from '../../apis/team-pulse'
import { createEmptyWorkspace } from '../../lib/workspace-store'
import type { InvitationInfo } from '../../apis'
import type { WorkspaceActionRunner, WorkspaceSetters, ShowToast } from './workspace-types'

export function useSessionActions({
  invitation,
  pendingInviteCode,
  runWorkspaceAction,
  setters,
  showToast,
  transport,
}: {
  invitation: InvitationInfo | null
  pendingInviteCode: string | null
  runWorkspaceAction: WorkspaceActionRunner
  setters: WorkspaceSetters
  showToast: ShowToast
  transport: 'api' | 'offline'
}) {
  const startWorkspace = (setup: Parameters<typeof bootstrapTeamPulseWorkspace>[0]) => {
    runWorkspaceAction(
      () => bootstrapTeamPulseWorkspace(setup),
      '워크스페이스가 생성되었습니다.'
    )
  }

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    if (!hasAccessToken()) {
      setters.setPendingInviteCode(invitation.inviteCode)
      showToast('초대 수락을 위해 먼저 로그인하거나 회원가입해주세요.', 'info')
      return
    }

    try {
      const nextWorkspace = await acceptTeamPulseInvitation(invitation.inviteCode)
      setters.setWorkspace(nextWorkspace)
      setters.setTransport('api')
      setters.setProjects(null)
      setters.setInvitation(null)
      setters.setPendingInviteCode(null)
      setters.setView('home')
      window.history.replaceState(null, '', '/')
      showToast('초대를 수락했습니다.', 'success')
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        clearAuthTokens()
        setters.setProjects(null)
        setters.setPendingInviteCode(invitation.inviteCode)
        showToast('로그인이 필요합니다. 로그인 후 초대 수락을 다시 진행합니다.', 'info')
        return
      }

      const message = error instanceof Error ? error.message : '초대 수락에 실패했습니다.'
      showToast(message, 'error')
    }
  }

  const handleLogin = (input: Parameters<typeof login>[0]) => {
    runWorkspaceAction(
      async () => {
        await login(input)
        setters.setTransport('api')
        const inviteCode = pendingInviteCode ?? invitation?.inviteCode

        if (inviteCode) {
          const nextWorkspace = await acceptTeamPulseInvitation(inviteCode)
          setters.setProjects(null)
          setters.setPendingInviteCode(null)
          setters.setInvitation(null)
          window.history.replaceState(null, '', '/')
          return nextWorkspace
        }

        const nextProjects = await listTeamPulseProjects()
        setters.setProjects(nextProjects)
        return {
          ...createEmptyWorkspace(),
          initialized: false,
          user: {
            name: input.email,
            email: input.email,
          },
        }
      },
      pendingInviteCode ?? invitation?.inviteCode ? '로그인 후 초대를 수락했습니다.' : '로그인되었습니다.'
    )
  }

  const handleSignup = (input: Parameters<typeof signup>[0]) => {
    runWorkspaceAction(
      async () => {
        const user = await signup(input)
        setters.setTransport('api')
        const inviteCode = pendingInviteCode ?? invitation?.inviteCode

        if (inviteCode) {
          const nextWorkspace = await acceptTeamPulseInvitation(inviteCode)
          setters.setProjects(null)
          setters.setPendingInviteCode(null)
          setters.setInvitation(null)
          window.history.replaceState(null, '', '/')
          return nextWorkspace
        }

        const nextProjects = await listTeamPulseProjects()
        setters.setProjects(nextProjects)
        return {
          ...createEmptyWorkspace(),
          initialized: false,
          user: {
            name: user.name ?? input.name,
            email: user.email,
          },
        }
      },
      pendingInviteCode ?? invitation?.inviteCode ? '회원가입 후 초대를 수락했습니다.' : '회원가입되었습니다.'
    )
  }

  const openProject = (projectId: number) => {
    runWorkspaceAction(
      () => loadTeamPulseProject(projectId),
      '프로젝트를 불러왔습니다.'
    )
  }

  const exitProject = async () => {
    try {
      const nextProjects = await listTeamPulseProjects()
      setters.setProjects(nextProjects)
      setters.setWorkspace(createEmptyWorkspace())
      setters.setTransport('api')
      setters.setView('home')
      showToast('프로젝트 목록으로 돌아왔습니다.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : '프로젝트 목록을 불러오지 못했습니다.'
      showToast(message, 'error')
    }
  }

  const resetWorkspace = () => {
    if (!window.confirm('워크스페이스를 초기화하시겠습니까?')) return
    runWorkspaceAction(
      () => resetTeamPulseWorkspace(),
      '워크스페이스가 초기화되었습니다.'
    )
    setters.setView('home')
  }

  const handleLogout = async () => {
    if (!window.confirm('로그아웃하시겠습니까?')) return

    if (transport === 'api') {
      try {
        await logout()
      } catch {
        // 토큰 만료 등으로 서버 로그아웃이 실패해도 로컬 세션은 정리한다.
      }
    }

    setters.setTransport('offline')
    setters.setProjects(null)
    setters.setWorkspace(createEmptyWorkspace())
    setters.setView('home')
    showToast('로그아웃되었습니다.', 'success')
  }

  return {
    exitProject,
    handleAcceptInvitation,
    handleLogin,
    handleLogout,
    handleSignup,
    openProject,
    resetWorkspace,
    startWorkspace,
  }
}
