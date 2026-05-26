import { meetingApi, memberApi, taskApi } from '..'
import type { Meeting } from '../../types/shell'
import { getActiveProjectId } from './active-project'
import { addDays, findMemberByName, mapAttendeeIds } from './helpers'
import { loadWorkspaceByProject } from './workspace-api'

export async function createTeamPulseMeeting(input: {
  title: string
  time: string
  agenda: string
  attendees: string[]
  decisions: string[]
  actions: string[]
  actionOwner: string
  createTasks: boolean
}) {
  const activeProjectId = getActiveProjectId()
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

export async function loadTeamPulseMeetingDetail(meetingId: number): Promise<Meeting> {
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
