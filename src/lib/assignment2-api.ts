import {
  ApiRequestError,
  hasAccessToken,
  invitationApi,
  meetingApi,
  memberApi,
  projectApi,
  reportApi,
  taskApi,
  userApi,
  type ActivityLog,
  type BackendRisk,
  type DashboardResult,
  type MemberSummary,
  type MeetingSummary,
  type ProjectCreateRequest,
  type ProjectDetail,
  type ProjectSummary,
  type RiskLevel,
  type RisksResult,
  type TaskSummary,
  type UserMe,
} from '../apis'
import { buildActivity, createEmptyWorkspace } from './workspace-store'
import type { Activity, Meeting, Report, RiskSeverity, RiskSignal, Task, TaskStatus } from '../types/shell'
import type { Member, WorkspaceState } from '../types/workspace'

const DEMO_PROJECT_ID = 1

let activeProjectId = readActiveProjectId()

function readActiveProjectId() {
  if (typeof window === 'undefined') return DEMO_PROJECT_ID
  const raw = window.localStorage.getItem('teampulse.activeProjectId')
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEMO_PROJECT_ID
}

function saveActiveProjectId(projectId: number) {
  activeProjectId = projectId
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('teampulse.activeProjectId', String(projectId))
  }
}

export async function loadAssignmentWorkspace() {
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

  const selected = projects.find((project) => project.projectId === activeProjectId) ?? projects[0]
  saveActiveProjectId(selected.projectId)

  return loadWorkspaceByProject(selected.projectId, user, selected)
}

export async function listAssignmentProjects() {
  if (!hasAccessToken()) {
    throw new ApiRequestError('로그인이 필요합니다.', 401, 3001)
  }

  return projectApi.list()
}

export async function loadAssignmentProject(projectId: number) {
  saveActiveProjectId(projectId)
  const [user, projects] = await Promise.all([
    userApi.me(),
    projectApi.list(),
  ])
  const selected = projects.find((project) => project.projectId === projectId)

  return loadWorkspaceByProject(projectId, user, selected)
}

export async function bootstrapAssignmentWorkspace(input: {
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

export async function resetAssignmentWorkspace() {
  saveActiveProjectId(DEMO_PROJECT_ID)
  return createEmptyWorkspace()
}

export async function refreshAssignmentRisks(workspace: WorkspaceState) {
  const [risksResult, dashboardResult] = await Promise.allSettled([
    projectApi.risks(activeProjectId),
    projectApi.dashboard(activeProjectId),
  ])

  return {
    ...workspace,
    risks: mapRisks(settledValue(risksResult), settledValue(dashboardResult)),
  }
}

export async function createAssignmentTask(input: {
  title: string
  owner: string
  dueDate: string
  blockers: string[]
  precedingTaskId?: number
}) {
  const members = await memberApi.list(activeProjectId)
  const assignee = findMemberByName(members, input.owner)

  const created = await taskApi.create(activeProjectId, {
    title: input.title,
    description: input.blockers.length ? `Blockers: ${input.blockers.join(', ')}` : undefined,
    assigneeId: assignee.memberId,
    dueDate: input.dueDate,
  })

  if (input.precedingTaskId && input.precedingTaskId !== created.taskId) {
    await taskApi.addDependency(created.taskId, input.precedingTaskId)
  }

  const workspace = await loadWorkspaceByProject(activeProjectId)
  const precedingTask = workspace.tasks.find((task) => task.id === input.precedingTaskId)

  if (!precedingTask) return workspace

  return {
    ...workspace,
    tasks: workspace.tasks.map((task) => task.id === created.taskId ? {
      ...task,
      blockers: [precedingTask.title],
    } : task),
  }
}

export async function updateAssignmentTaskStatus(taskId: number, status: TaskStatus) {
  await taskApi.updateStatus(taskId, status)
  return loadWorkspaceByProject(activeProjectId)
}

export async function updateAssignmentTask(input: {
  taskId: number
  title?: string
  owner?: string
  dueDate?: string
}) {
  const members = input.owner ? await memberApi.list(activeProjectId) : []
  const assignee = input.owner ? findMemberByName(members, input.owner) : undefined

  await taskApi.update(input.taskId, {
    title: input.title,
    assigneeId: assignee?.memberId,
    dueDate: input.dueDate,
  })

  return loadWorkspaceByProject(activeProjectId)
}

export async function addAssignmentTaskDependency(taskId: number, precedingTaskId: number) {
  await taskApi.addDependency(taskId, precedingTaskId)
  const workspace = await loadWorkspaceByProject(activeProjectId)
  const precedingTask = workspace.tasks.find((task) => task.id === precedingTaskId)

  if (!precedingTask) return workspace

  return {
    ...workspace,
    tasks: workspace.tasks.map((task) => task.id === taskId ? {
      ...task,
      blockers: Array.from(new Set([...task.blockers, precedingTask.title])),
    } : task),
  }
}

export async function removeAssignmentTaskDependency(taskId: number, dependencyId: number) {
  await taskApi.removeDependency(taskId, dependencyId)
  const workspace = await loadWorkspaceByProject(activeProjectId)
  const dependencyTask = workspace.tasks.find((task) => task.id === dependencyId)

  if (!dependencyTask) return workspace

  return {
    ...workspace,
    tasks: workspace.tasks.map((task) => task.id === taskId ? {
      ...task,
      blockers: task.blockers.filter((blocker) => blocker !== dependencyTask.title),
    } : task),
  }
}

export async function deleteAssignmentTask(taskId: number) {
  await taskApi.remove(taskId)
  return loadWorkspaceByProject(activeProjectId)
}

export async function createAssignmentMeeting(input: {
  title: string
  time: string
  agenda: string
  attendees: string[]
  decisions: string[]
  actions: string[]
  actionOwner: string
  createTasks: boolean
}) {
  const members = await memberApi.list(activeProjectId)
  const assignee = findMemberByName(members, input.actionOwner)
  const attendeeIds = mapAttendeeIds(members, input.attendees)
  const meetingDate = input.time.slice(0, 10)

  await meetingApi.create(activeProjectId, {
    title: input.title,
    meetingDate,
    agenda: input.agenda,
    content: input.agenda,
    decisions: input.decisions,
    actions: input.actions,
    attendeeIds,
    actionItems: input.actions.map((content) => ({
      content,
      assigneeId: assignee.memberId,
      dueDate: addDays(meetingDate, 7),
    })),
  })

  if (input.createTasks) {
    await Promise.all(input.actions.map((title) => taskApi.create(activeProjectId, {
      title,
      description: `회의 "${input.title}"에서 생성된 후속 조치입니다.`,
      assigneeId: assignee.memberId,
      dueDate: addDays(meetingDate, 7),
    }).catch(() => null)))
  }

  return loadWorkspaceByProject(activeProjectId)
}

export async function loadAssignmentMeetingDetail(meetingId: number): Promise<Meeting> {
  const detail = await meetingApi.get(meetingId)
  const decisions = Array.isArray(detail.decisions)
    ? detail.decisions
    : detail.decisions.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)

  return {
    id: detail.meetingId,
    title: detail.title,
    time: detail.meetingDate,
    agenda: detail.agenda,
    content: detail.content,
    attendees: detail.attendees.map((attendee) => attendee.name),
    decisions,
    actions: detail.actionItems.map((item) => item.content),
    actionItems: detail.actionItems.map((item) => ({
      id: item.actionItemId,
      content: item.content,
      assigneeName: item.assigneeName,
      dueDate: item.dueDate,
      isCompleted: item.isCompleted,
    })),
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  }
}

export async function generateAssignmentReport() {
  const report = await reportApi.create(activeProjectId)
  return withReport(await loadWorkspaceByProject(activeProjectId), {
    id: report.reportId,
    label: 'TeamPulse PDF 리포트',
    range: report.downloadUrl,
    status: 'READY',
  })
}

export async function downloadAssignmentReport(reportId: number) {
  return reportApi.download(reportId)
}

export async function updateAssignmentTeam(input: {
  name: string
  courseName: string
  semester: string
  dueDate: string
}) {
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

export async function regenerateAssignmentInviteCode() {
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

export async function loadInvitationInfo(inviteCode: string) {
  return invitationApi.get(inviteCode)
}

export async function acceptAssignmentInvitation(inviteCode: string) {
  const accepted = await invitationApi.accept(inviteCode)
  saveActiveProjectId(accepted.projectId)
  return loadWorkspaceByProject(accepted.projectId)
}

export async function deleteAssignmentMember(memberId: number) {
  const workspace = await loadWorkspaceByProject(activeProjectId)
  const target = workspace.members.find((member) => member.id === memberId)
  if (!target || target.name !== workspace.user.name) {
    throw new ApiRequestError('현재 명세에서는 본인 팀 탈퇴만 가능합니다.', 400)
  }

  await memberApi.leave(activeProjectId)
  return loadAssignmentWorkspace()
}

async function loadWorkspaceByProject(projectId: number, knownUser?: UserMe, summary?: ProjectSummary): Promise<WorkspaceState> {
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
  const project = settledValue(projectResult) ?? projectFromSummary(projectId, summary)
  const members = settledValue(membersResult) ?? []
  const tasks = settledValue(tasksResult) ?? []
  const meetings = settledValue(meetingsResult) ?? []
  const activities = settledValue(activitiesResult) ?? []
  const risks = settledValue(risksResult)
  const dashboard = settledValue(dashboardResult)

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
    tasks: mapTasks(tasks),
    meetings: meetings.map((meeting) => mapMeeting(meeting, members)),
    activities: activities.map(mapActivity),
    reports: [],
    risks: mapRisks(risks, dashboard),
  }
}

function settledValue<T>(result: PromiseSettledResult<T>) {
  return result.status === 'fulfilled' ? result.value : undefined
}

function projectFromSummary(projectId: number, summary?: ProjectSummary): ProjectDetail {
  return {
    projectId,
    projectName: summary?.projectName ?? '',
    subject: summary?.subject ?? '',
    description: '',
    startDate: '',
    endDate: summary?.endDate ?? '',
    memberCount: 0,
  }
}

function mapMember(member: MemberSummary): Member {
  return {
    id: member.memberId,
    name: member.name,
    role: member.role,
  }
}

function mapTasks(tasks: TaskSummary[]): Task[] {
  const titleById = new Map(tasks.map((task) => [task.taskId, task.title]))

  return tasks.map((task) => ({
    id: task.taskId,
    title: task.title,
    owner: task.assigneeName,
    status: task.status,
    dueDate: task.dueDate,
    priority: task.status === 'DONE' ? 'LOW' : 'MEDIUM',
    blockers: (task.precedingTaskIds ?? [])
      .map((taskId) => titleById.get(taskId))
      .filter((title): title is string => Boolean(title)),
    next: [],
    note: '',
  }))
}

function mapMeeting(meeting: MeetingSummary, members: MemberSummary[]): Meeting {
  const memberNameById = new Map(members.map((member) => [member.memberId, member.name]))
  const attendees = (meeting.attendeeIds ?? [])
    .map((memberId) => memberNameById.get(memberId))
    .filter((name): name is string => Boolean(name))

  return {
    id: meeting.meetingId,
    title: meeting.title,
    time: meeting.meetingDate,
    writerName: meeting.writerName,
    attendees: attendees.length ? attendees : meeting.writerName ? [meeting.writerName] : [],
    agenda: meeting.agenda ?? '',
    content: meeting.content,
    decisions: meeting.decisions ?? [],
    actions: meeting.actions ?? meeting.actionItems?.map((item) => item.content) ?? [],
    actionItems: meeting.actionItems?.map((item) => ({
      content: item.content,
      dueDate: item.dueDate,
    })),
  }
}

function mapActivity(log: ActivityLog): Activity {
  return {
    id: log.logId,
    actor: log.userName,
    at: log.createdAt,
    summary: log.content || log.action,
  }
}

function mapRisks(risks?: RisksResult | BackendRisk[], dashboard?: DashboardResult): RiskSignal[] {
  if (Array.isArray(risks)) {
    return risks.map((risk) => ({
      id: risk.id,
      severity: risk.severity,
      title: risk.title,
      body: risk.body,
      action: risk.action,
    }))
  }

  const source = risks?.risks ?? dashboard?.risks ?? []

  return source.map((risk, index) => ({
    id: index + 1,
    severity: mapRiskSeverity(risk.level),
    title: mapRiskTitle(risk.type),
    body: risk.message,
    action: risk.suggestedActions.join(' / '),
  }))
}

function mapRiskTitle(type: string) {
  const labels: Record<string, string> = {
    TASK_STAGNATION: '업무 진행 정체',
    WORKLOAD_IMBALANCE: '작업 편중',
    BOTTLENECK: '선행 업무 병목',
    SCHEDULE_DELAY: '일정 지연 위험',
    LOW_UPDATE_ACTIVITY: '업데이트 부족',
  }

  return labels[type] ?? type
}

function mapRiskSeverity(level: RiskLevel): RiskSeverity {
  if (level === 'DANGER') return 'CRITICAL'
  if (level === 'WARNING') return 'WARNING'
  return 'INFO'
}

function findMemberByName(members: MemberSummary[], name: string) {
  const member = members.find((item) => item.name === name) ?? members[0]
  if (!member) {
    throw new ApiRequestError('태스크를 배정할 팀원이 없습니다.', 400)
  }
  return member
}

function mapAttendeeIds(members: MemberSummary[], attendeeNames: string[]) {
  const trimmedNames = attendeeNames.map((name) => name.trim()).filter(Boolean)
  const attendeeIds = trimmedNames
    .map((name) => members.find((member) => member.name === name)?.memberId)
    .filter((memberId): memberId is number => typeof memberId === 'number')

  return Array.from(new Set(attendeeIds))
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function withReport(workspace: WorkspaceState, report: Report): WorkspaceState {
  return {
    ...workspace,
    reports: [report, ...workspace.reports],
    activities: [
      buildActivity(`${report.label}가 생성되었습니다.`, workspace.user.name),
      ...workspace.activities,
    ],
  }
}
