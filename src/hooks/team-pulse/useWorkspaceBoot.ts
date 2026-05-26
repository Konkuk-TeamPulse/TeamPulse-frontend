import { useEffect } from 'react'
import { ApiRequestError, clearAuthTokens } from '../../apis'
import { createEmptyWorkspace } from '../../lib/workspace-store'
import { listTeamPulseProjects, loadInvitationInfo } from '../../apis/team-pulse'
import type { ShowToast, WorkspaceSetters } from './workspace-types'

export function useWorkspaceBoot(setters: WorkspaceSetters, showToast: ShowToast) {
  useEffect(() => {
    let active = true

    listTeamPulseProjects()
      .then((nextProjects) => {
        if (!active) return
        setters.setTransport('api')
        setters.setProjects(nextProjects)
        setters.setWorkspace(createEmptyWorkspace())
      })
      .catch((error) => {
        if (!active) return
        if (error instanceof ApiRequestError && error.status === 401) {
          clearAuthTokens()
          setters.setProjects(null)
        }
        setters.setTransport('offline')
      })

    return () => { active = false }
  }, [setters])

  useEffect(() => {
    const inviteCode = window.location.pathname.match(/^\/invite\/([^/]+)/)?.[1]
    if (!inviteCode) return

    let active = true

    loadInvitationInfo(inviteCode)
      .then((info) => {
        if (active) setters.setInvitation(info)
      })
      .catch((error) => {
        if (!active) return
        const message = error instanceof Error ? error.message : '초대 수락에 실패했습니다.'
        showToast(message, 'error')
      })

    return () => { active = false }
  }, [setters, showToast])
}
