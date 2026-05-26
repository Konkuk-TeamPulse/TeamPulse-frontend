import { createTeamPulseMeeting, loadTeamPulseMeetingDetail } from '../../apis/team-pulse'
import { parseLines } from '../../lib/utils'
import type { ShowToast, WorkspaceActionRunner, WorkspaceSetters } from './workspace-types'

export function useMeetingActions(
  runWorkspaceAction: WorkspaceActionRunner,
  setWorkspace: WorkspaceSetters['setWorkspace'],
  showToast: ShowToast,
) {
  const addMeeting = (form: {
    title: string
    time: string
    agenda: string
    attendees: string[]
    decisions: string
    actions: string
    actionOwner: string
    createTasks: boolean
  }) => {
    runWorkspaceAction(
      () => createTeamPulseMeeting({
        ...form,
        decisions: parseLines(form.decisions),
        actions: parseLines(form.actions),
      }),
    )
  }

  const loadMeetingDetail = async (meetingId: number) => {
    try {
      const detail = await loadTeamPulseMeetingDetail(meetingId)
      setWorkspace((current) => ({
        ...current,
        meetings: current.meetings.map((meeting) => meeting.id === meetingId ? detail : meeting),
      }))
      showToast('회의록 상세를 불러왔습니다.', 'success')
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : '회의록 상세 조회에 실패했습니다.'
      showToast(message, 'error')
      return false
    }
  }

  return { addMeeting, loadMeetingDetail }
}
