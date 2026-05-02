import { Empty, ListBlock, Pill } from '../Common'
import type { Meeting } from '../../../types/shell'

interface MeetingListProps {
  meetings: Meeting[]
  onLoadMeetingDetail: (meetingId: number) => void
  formatDate: (value: string) => string
}

export function MeetingList({ meetings, onLoadMeetingDetail, formatDate }: MeetingListProps) {
  if (!meetings.length) return <Empty>저장된 회의 기록이 없습니다.</Empty>

  return (
    <div className="grid gap-5">
      {meetings.map((meeting) => (
        <article key={meeting.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">{formatDate(meeting.time)}</p>
              <h4 className="text-lg font-bold tracking-tight text-slate-950">{meeting.title}</h4>
            </div>
            <Pill tone="muted">조치 사항 {meeting.actions.length}개</Pill>
          </div>
          <button
            type="button"
            className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            onClick={() => onLoadMeetingDetail(meeting.id)}
          >
            상세 조회
          </button>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400">안건</span>
              <p className="text-sm leading-relaxed text-slate-600">{meeting.agenda}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {meeting.decisions.length > 0 && <ListBlock title="주요 결정 사항" items={meeting.decisions} />}
              {meeting.actions.length > 0 && <ListBlock title="후속 조치 계획" items={meeting.actions} />}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
