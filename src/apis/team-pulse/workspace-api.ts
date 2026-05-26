import {
  ApiRequestError,
  hasAccessToken,
  meetingApi,
  memberApi,
  projectApi,
  taskApi,
  userApi,
  type ProjectCreateRequest,
  type ProjectSummary,
  type UserMe,
} from '..'
import { createEmptyWorkspace } from '../../lib/workspace-store'
import type { WorkspaceState } from '../../types/workspace'
import { getActiveProjectId, resetActiveProjectId, saveActiveProjectId } from './active-project'
import { settledValue } from './helpers'
import { mapActivity, mapMeeting, mapMember, mapRisks, mapTasks, projectFromSummary } from './mappers'

export async function loadTeamPulseWorkspace() {
  if (!hasAccessToken()) {
    throw new ApiRequestError('로그인이 필요합니다.', 401, 3001)
  }

  const [user, projects] = await Promise.all([
    userApi.me(),
    projectApi.list(),
  ])

  if (!projects.length) {
    return {
      ...createEmptyWorkspace(),
      initialized: false,
      user: {
        name: user.name,
        email: user.email,
      },
    }
  }

  const selected = projects.find((project) => project.projectId === getActiveProjectId()) ?? projects[0]
  saveActiveProjectId(selected.projectId)

  return loadWorkspaceByProject(selected.projectId, user, selected)
}

export async function listTeamPulseProjects() {
  if (!hasAccessToken()) {
    throw new ApiRequestError('로그인이 필요합니다.', 401, 3001)
  }

  return projectApi.list()
}

export async function loadTeamPulseProject(projectId: number) {
  saveActiveProjectId(projectId)
  const [user, projects] = await Promise.all([
    userApi.me(),
    projectApi.list(),
  ])
  const selected = projects.find((project) => project.projectId === projectId)

  return loadWorkspaceByProject(projectId, user, selected)
}

export async function bootstrapTeamPulseWorkspace(input: {
  teamName: string
  courseName: string
  semester: string
  dueDate: string
}) {
  const today = new Date().toISOString().slice(0, 10)
  const payload: ProjectCreateRequest = {
    projectName: input.teamName,
    subject: input.courseName,
    description: input.semester,
    startDate: today,
    endDate: input.dueDate,
  }
  const project = await projectApi.create(payload)
  saveActiveProjectId(project.projectId)
  const user = await userApi.me()

  return loadWorkspaceByProject(project.projectId, user)
}

export async function resetTeamPulseWorkspace() {
  resetActiveProjectId()
  return createEmptyWorkspace()
}

export async function refreshTeamPulseRisks(workspace: WorkspaceState) {
  const activeProjectId = getActiveProjectId()
  const [risksResult, dashboardResult] = await Promise.allSettled([
    projectApi.risks(activeProjectId),
    projectApi.dashboard(activeProjectId),
  ])

  return {
    ...workspace,
    risks: mapRisks(settledValue(risksResult), settledValue(dashboardResult)),
  }
}

export async function loadWorkspaceByProject(projectId: number, knownUser?: UserMe, summary?: ProjectSummary): Promise<WorkspaceState> {
  const [
    userResult,
    projectResult,
    tasksResult,
    membersResult,
    meetingsResult,
    activitiesResult,
    risksResult,
    dashboardResult,
  ] = await Promise.allSettled([
    knownUser ? Promise.resolve(knownUser) : userApi.me(),
    projectApi.get(projectId),
    taskApi.list(projectId),
    memberApi.list(projectId),
    meetingApi.list(projectId),
    projectApi.activityLogs(projectId),
    projectApi.risks(projectId),
    projectApi.dashboard(projectId),
  ])

  const user = settledValue(userResult) ?? {
    userId: 0,
    email: '',
    studentId: '',
    name: '사용자',
    university: '',
    phone: '',
  }

  if (projectResult.status === 'rejected' && !summary) {
    throw projectResult.reason
  }

  const project = settledValue(projectResult) ?? projectFromSummary(projectId, summary)
  const members = settledValue(membersResult) ?? []

  return {
    initialized: Boolean(project.projectName),
    user: {
      name: user.name || user.email || '사용자',
      email: user.email,
    },
    team: {
      name: project.projectName,
      courseName: project.subject,
      semester: project.description || '2026-1',
      dueDate: project.endDate,
      inviteCode: '',
      inviteUrl: '',
    },
    members: members.map(mapMember),
    tasks: mapTasks(settledValue(tasksResult) ?? []),
    meetings: (settledValue(meetingsResult) ?? []).map((meeting) => mapMeeting(meeting, members)),
    activities: (settledValue(activitiesResult) ?? []).map(mapActivity),
    reports: [],
    risks: mapRisks(settledValue(risksResult), settledValue(dashboardResult)),
  }
}
