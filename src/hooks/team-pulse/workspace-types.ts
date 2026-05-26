import type { Dispatch, SetStateAction } from 'react'
import type { InvitationInfo, ProjectSummary } from '../../apis'
import type { TeamPulseViewKey, ToastType } from '../../types/navigation'
import type { WorkspaceState } from '../../types/workspace'

export type ShowToast = (message: string, type?: ToastType) => void

export type WorkspaceActionRunner = (
  apiAction: () => Promise<WorkspaceState>,
  successMsg?: string
) => void

export type WorkspaceSetters = {
  setInvitation: Dispatch<SetStateAction<InvitationInfo | null>>
  setPendingInviteCode: Dispatch<SetStateAction<string | null>>
  setProjects: Dispatch<SetStateAction<ProjectSummary[] | null>>
  setTransport: Dispatch<SetStateAction<'api' | 'offline'>>
  setView: Dispatch<SetStateAction<TeamPulseViewKey>>
  setWorkspace: Dispatch<SetStateAction<WorkspaceState>>
}
