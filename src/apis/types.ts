import type { HealthSummary, ShellData, TaskStatus } from '../types/shell'

export type { HealthSummary, ShellData, TaskStatus }

export type SpecResponse<T> = {
  isSuccess: boolean
  responseCode: number
  responseMessage: string
  result: T
}

export type LegacyApiResponse<T> = {
  success: boolean
  data: T
  error?: {
    code?: string
    message: string
    details?: unknown
  } | null
}

export type ValidationError = {
  fieldName: string
  rejectValue: unknown
  message: string
}

export type ErrorResult = {
  errors?: ValidationError[]
}

export type JwtInfo = {
  grantType?: string
  accessToken: string
  refreshToken: string
}

export type AuthUser = {
  userId: number
  email: string
  name?: string
  university?: string
  phone?: string
  jwtInfo: JwtInfo
}

export type LoginResult = {
  userId: number
  email: string
  jwtInfo: JwtInfo
}

export type ProjectRole = 'LEADER' | 'MEMBER'

export type ProjectCreateRequest = {
  projectName: string
  subject: string
  description?: string
  startDate: string
  endDate: string
}

export type ProjectCreateResult = {
  projectId: number
  projectName: string
  role: ProjectRole
}

export type ProjectSummary = {
  projectId: number
  projectName: string
  subject: string
  role: ProjectRole
  endDate: string
}

export type ProjectDetail = {
  projectId: number
  projectName: string
  subject: string
  description: string
  startDate: string
  endDate: string
  memberCount: number
}

export type ProjectUpdateResult = ProjectDetail & {
  updatedAt: string
}

export type MemberSummary = {
  memberId: number
  name: string
  email: string
  role: ProjectRole
}

export type TaskCreateRequest = {
  title: string
  description?: string
  assigneeId: number
  dueDate: string
}

export type TaskCreateResult = {
  taskId: number
  title: string
  status: TaskStatus
  assigneeId: number
  dueDate: string
}

export type TaskSummary = {
  taskId: number
  title: string
  status: TaskStatus
  assigneeName: string
  dueDate: string
}

export type TaskUpdateRequest = Partial<TaskCreateRequest>

export type TaskUpdateResult = {
  taskId: number
  title: string
  description: string
  dueDate: string
}

export type TaskStatusResult = {
  taskId: number
  status: TaskStatus
}

export type TaskDependencyResult = {
  taskId: number
  precedingTaskId: number
}

export type MeetingCreateRequest = {
  title: string
  meetingDate: string
  agenda: string
  content: string
  decisions: string[]
  actions: string[]
  attendeeIds: number[]
  actionItems: Array<{
    content: string
    assigneeId: number
    dueDate: string
  }>
}

export type MeetingSummary = {
  meetingId: number
  title: string
  meetingDate: string
  writerName: string
  agenda?: string
  content?: string
  decisions?: string[]
  actions?: string[]
  attendeeIds?: number[]
  actionItems?: Array<{
    content: string
    assigneeId: number
    dueDate: string
  }>
}

export type MeetingDetail = {
  meetingId: number
  projectId: number
  title: string
  meetingDate: string
  agenda: string
  content: string
  decisions: string | string[]
  attendees: Array<{
    memberId: number
    name: string
  }>
  actionItems: Array<{
    actionItemId: number
    content: string
    assigneeMemberId: number
    assigneeName: string
    dueDate: string
    isCompleted: boolean
  }>
  createdAt: string
  updatedAt: string
}

export type ActivityLog = {
  logId: number
  action: string
  content: string
  userName: string
  createdAt: string
}

export type RiskLevel = 'CAUTION' | 'WARNING' | 'DANGER'

export type RiskSummary = {
  totalRiskCount: number
  cautionCount: number
  warningCount: number
  dangerCount: number
  hasDanger: boolean
}

export type RiskSignalResponse = {
  type: string
  level: RiskLevel
  message: string
  relatedTaskId?: number | null
  relatedTaskTitle?: string | null
  relatedMemberId?: number | null
  relatedMemberName?: string | null
  affectedTaskIds?: number[]
  remainingDays?: number
  incompleteTaskCount?: number
  suggestedActions: string[]
}

export type RisksResult = {
  projectId: number
  riskSummary: RiskSummary
  risks: RiskSignalResponse[]
}

export type DashboardResult = RisksResult & {
  projectName: string
  taskSummary: {
    totalTaskCount: number
    todoCount: number
    inProgressCount: number
    doneCount: number
    progressRate: number
  }
  scheduleSummary: {
    projectStartDate: string
    projectEndDate: string
    remainingDays: number
    overdueTaskCount: number
    dueSoonTaskCount: number
  }
  memberWorkload: Array<{
    memberId: number
    name: string
    assignedTaskCount: number
    doneTaskCount: number
  }>
}

export type UserMe = {
  userId: number
  email: string
  studentId: string
  name: string
  university: string
  phone: string
}

export type InvitationCreateResult = {
  invitationId: number
  projectId: number
  inviteCode: string
  inviteUrl: string
  expiredAt: string
}

export type InvitationInfo = {
  inviteCode: string
  projectId: number
  projectName: string
  subject: string
  teamLeaderName: string
  expiredAt: string
  isExpired: boolean
  isAlreadyJoined: boolean
}

export type InvitationAcceptResult = {
  projectId: number
  projectName: string
  memberId: number
  userId: number
  role: ProjectRole
  joinedAt: string
}

export type ReportCreateResult = {
  reportId: number
  downloadUrl: string
}
