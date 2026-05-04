import { useState } from 'react'
import { Empty, ListBlock, Pill } from '../Common'
import type { Meeting } from '../../../types/shell'

interface MeetingListProps {
  meetings: Meeting[]
  onLoadMeetingDetail: (meetingId: number) => Promise<boolean>
  formatDate: (value: string) => string
}

export function MeetingList({ meetings, onLoadMeetingDetail, formatDate }: MeetingListProps) {
  const [expandedMeetingId, setExpandedMeetingId] = useState<number | null>(null)
  const [loadingMeetingId, setLoadingMeetingId] = useState<number | null>(null)

  if (!meetings.length) return <Empty>저장된 회의 기록이 없습니다.</Empty>

  const handleToggleDetail = async (meetingId: number) => {
    if (expandedMeetingId === meetingId) {
      setExpandedMeetingId(null)
      return
    }

    setLoadingMeetingId(meetingId)
    const loaded = await onLoadMeetingDetail(meetingId)
    setLoadingMeetingId(null)
    if (loaded) setExpandedMeetingId(meetingId)
  }

  return (
    <div className="grid gap-5">
      {meetings.map((meeting) => {
        const isExpanded = expandedMeetingId === meeting.id
        const isLoading = loadingMeetingId === meeting.id

        return (
          <article key={meeting.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">{formatDate(meeting.time)}</p>
                <h4 className="text-lg font-bold tracking-tight text-slate-950">{meeting.title}</h4>
                <p className="text-sm font-semibold text-slate-500">
                  출석자 {meeting.attendees.length ? meeting.attendees.join(', ') : '없음'}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                disabled={isLoading}
                onClick={() => handleToggleDetail(meeting.id)}
              >
                {isLoading ? '불러오는 중' : isExpanded ? '닫기' : '상세 조회'}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-6 space-y-6 border-t border-slate-200 pt-5">
                <div className="flex flex-wrap gap-2">
                  {meeting.writerName && <Pill tone="muted">작성자 {meeting.writerName}</Pill>}
                  <Pill tone="muted">후속 조치 {meeting.actionItems?.length ?? meeting.actions.length}개</Pill>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <DetailBlock title="안건">{meeting.agenda || '등록된 안건이 없습니다.'}</DetailBlock>
                  <DetailBlock title="회의 내용">{meeting.content || '등록된 회의 내용이 없습니다.'}</DetailBlock>
                </div>

                {meeting.decisions.length > 0 && <ListBlock title="주요 결정 사항" items={meeting.decisions} />}

                {meeting.actionItems?.length ? (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <strong className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">후속 조치 계획</strong>
                    <ul className="mt-3 grid gap-3">
                      {meeting.actionItems.map((item, idx) => (
                        <li key={item.id ?? `${item.content}-${idx}`} className="rounded-lg bg-slate-50 px-4 py-3">
                          <p className="text-sm font-semibold leading-6 text-slate-700">{item.content}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {[item.assigneeName, item.dueDate ? `마감 ${formatDate(item.dueDate)}` : null]
                              .filter(Boolean)
                              .join(' · ') || '담당자/마감일 미지정'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : meeting.actions.length > 0 ? (
                  <ListBlock title="후속 조치 계획" items={meeting.actions} />
                ) : null}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

function DetailBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="space-y-2">
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400">{title}</span>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  )
}
