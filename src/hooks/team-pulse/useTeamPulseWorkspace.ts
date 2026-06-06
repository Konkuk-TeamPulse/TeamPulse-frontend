import { useMemo, useState } from 'react'
import type { InvitationInfo, ProjectSummary } from '../../apis'
import { createEmptyWorkspace } from '../../lib/workspace-store'
import { compareTasks } from '../../lib/utils'
import type { TeamPulseViewKey } from '../../types/navigation'
import type { WorkspaceState } from '../../types/workspace'
import { useMeetingActions } from './useMeetingActions'
import { useReportActions } from './useReportActions'
import { useSessionActions } from './useSessionActions'
import { useTaskActions } from './useTaskActions'
import { useTeamActions } from './useTeamActions'
import { useWorkspaceActionRunner } from './useWorkspaceActionRunner'
import { useWorkspaceBoot } from './useWorkspaceBoot'
import type { ShowToast, WorkspaceSetters } from './workspace-types'

export function useTeamPulseWorkspace(showToast: ShowToast) {
  const [workspace, setWorkspace] = useState<WorkspaceState>(createEmptyWorkspace())
  const [transport, setTransport] = useState<'api' | 'offline'>('offline')
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null)
  const [view, setView] = useState<TeamPulseViewKey>('home')

  const setters = useMemo<WorkspaceSetters>(() => ({
    setInvitation,
    setPendingInviteCode,
    setProjects,
    setTransport,
    setView,
    setWorkspace,
  }), [])

  const { isBusy, runWorkspaceAction } = useWorkspaceActionRunner({
    setTransport,
    setWorkspace,
    showToast,
  })

  useWorkspaceBoot(setters, showToast)

  const memberNames = useMemo(() => workspace.members.map((member) => member.name), [workspace.members])
  const defaultOwner = memberNames[0] ?? workspace.user.name
  const defaultOwnerId = workspace.members[0]?.id ?? 0
  const tasks = useMemo(() => [...workspace.tasks].sort(compareTasks), [workspace.tasks])
  const grouped = useMemo(() => ({
    TODO: tasks.filter((task) => task.status === 'TODO'),
    DOING: tasks.filter((task) => task.status === 'DOING'),
    DONE: tasks.filter((task) => task.status === 'DONE'),
  }), [tasks])
  const completion = workspace.tasks.length
    ? Math.round((workspace.tasks.filter((task) => task.status === 'DONE').length / workspace.tasks.length) * 100)
    : 0

  const sessionActions = useSessionActions({
    invitation,
    pendingInviteCode,
    runWorkspaceAction,
    setters,
    showToast,
    transport,
  })
  const taskActions = useTaskActions(runWorkspaceAction, showToast)
  const meetingActions = useMeetingActions(runWorkspaceAction, setWorkspace, showToast)
  const reportActions = useReportActions({ runWorkspaceAction, showToast, transport })
  const teamActions = useTeamActions(workspace, runWorkspaceAction, showToast, setters)

  return {
    state: {
      completion,
      defaultOwner,
      defaultOwnerId,
      grouped,
      invitation,
      isBusy,
      memberNames,
      projects,
      tasks,
      view,
      workspace,
    },
    actions: {
      ...sessionActions,
      ...taskActions,
      ...meetingActions,
      ...reportActions,
      ...teamActions,
      setView,
    },
  }
}
