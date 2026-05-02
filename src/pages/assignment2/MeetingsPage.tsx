import { MeetingForm, type MeetingFormValue } from '../../components/assignment2/meetings/MeetingForm'
import { MeetingList } from '../../components/assignment2/meetings/MeetingList'
import type { Meeting } from '../../types/shell'

interface MeetingsPageProps {
  meetings: Meeting[]
  memberNames: string[]
  defaultOwner: string
  onAddMeeting: (meeting: MeetingFormValue) => void
  onLoadMeetingDetail: (meetingId: number) => void
  formatDate: (value: string) => string
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function MeetingsPage({
  meetings,
  memberNames,
  defaultOwner,
  onAddMeeting,
  onLoadMeetingDetail,
  formatDate,
  showToast
}: MeetingsPageProps) {
  return (
    <div className="grid gap-6 pb-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:pb-0">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">회의록</h2>
        <MeetingForm memberNames={memberNames} defaultOwner={defaultOwner} onSubmit={onAddMeeting} showToast={showToast} />
      </div>

      <div className="flex flex-col gap-6">
         <h3 className="text-lg font-extrabold tracking-tight text-slate-950">회의 내역 ({meetings.length})</h3>
         <MeetingList meetings={meetings} onLoadMeetingDetail={onLoadMeetingDetail} formatDate={formatDate} />
      </div>
    </div>
  )
}
