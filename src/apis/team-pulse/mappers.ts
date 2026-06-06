import type {
  ActivityLog,
  BackendRisk,
  DashboardResult,
  MemberSummary,
  MeetingSummary,
  ProjectDetail,
  ProjectSummary,
  RiskLevel,
  RisksResult,
  TaskSummary,
} from '..'
import type { Activity, Meeting, RiskSeverity, RiskSignal, Task } from '../../types/shell'
import type { Member } from '../../types/workspace'

export function projectFromSummary(projectId: number, summary?: ProjectSummary): ProjectDetail {
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

export function mapMember(member: MemberSummary): Member {
  return {
    id: member.memberId,
    name: member.name,
    email: member.email,
    role: member.role,
  }
}

export function mapTasks(tasks: TaskSummary[]): Task[] {
  const titleById = new Map(tasks.map((task) => [task.taskId, task.title]))

  return tasks.map((task) => ({
    id: task.taskId,
    title: task.title,
    ownerId: task.assigneeId ?? null,
    owner: task.assigneeName,
    ownerEmail: task.assigneeEmail ?? null,
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

export function mapMeeting(meeting: MeetingSummary, members: MemberSummary[]): Meeting {
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

export function mapActivity(log: ActivityLog): Activity {
  return {
    id: log.logId,
    actor: log.userName,
    at: log.createdAt,
    summary: log.content || log.action,
  }
}

export function mapRisks(risks?: RisksResult | BackendRisk[], dashboard?: DashboardResult): RiskSignal[] {
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
