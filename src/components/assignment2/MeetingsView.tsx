import { useState } from 'react'
import { Section, Field, inputClassName, areaClassName, buttonPrimaryClassName, Empty, Pill, ListBlock } from './Common'
import type { Meeting } from '../../types/shell'

interface MeetingsViewProps {
  meetings: Meeting[]
  memberNames: string[]
  defaultOwner: string
  onAddMeeting: (meeting: {
    title: string
    time: string
    agenda: string
    decisions: string
    actions: string
    actionOwner: string
    createTasks: boolean
  }) => void
  formatDate: (value: string) => string
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function MeetingsView({
  meetings,
  memberNames,
  defaultOwner,
  onAddMeeting,
  formatDate,
  showToast
}: MeetingsViewProps) {
  const [form, setForm] = useState({
    title: '',
    time: '',
    agenda: '',
    decisions: '',
    actions: '',
    actionOwner: defaultOwner,
    createTasks: true,
  })

  const handleSubmit = () => {
    if (!form.title.trim()) return showToast('회의 제목을 입력해주세요.', 'error')
    if (!form.time) return showToast('회의 일시를 선택해주세요.', 'error')
    if (!form.agenda.trim()) return showToast('안건을 입력해주세요.', 'error')

    onAddMeeting(form)
    setForm({
      ...form,
      title: '',
      time: '',
      agenda: '',
      decisions: '',
      actions: '',
    })
    showToast('회의 기록이 저장되었습니다.', 'success')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)] pb-10 animate-[rise_0.4s_ease-out]">
      <div className="flex flex-col gap-6">
        <h2 className="font-display text-4xl font-bold tracking-tight">회의 기록</h2>
        
        <Section title="새 회의 등록" eyebrow="Input">
          <div className="grid gap-5">
            <Field label="회의 제목"><input className={inputClassName} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 주간 싱크, 킥오프 등" /></Field>
            <Field label="일시"><input className={inputClassName} type="datetime-local" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
            <Field label="안건"><textarea className={areaClassName} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} /></Field>
            <Field label="결정 사항"><textarea className={areaClassName} value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} placeholder="한 줄에 하나씩 입력" /></Field>
            <Field label="후속 조치 (Action Items)"><textarea className={areaClassName} value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} placeholder="한 줄에 하나씩 입력" /></Field>
            <Field label="조치 담당자"><select className={inputClassName} value={form.actionOwner} onChange={(e) => setForm({ ...form, actionOwner: e.target.value })}>{memberNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></Field>
            
            <label className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/50 p-4 transition hover:bg-white/80">
              <input 
                type="checkbox" 
                className="h-5 w-5 rounded border-black/10 text-forest focus:ring-forest"
                checked={form.createTasks} 
                onChange={(e) => setForm({ ...form, createTasks: e.target.checked })} 
              />
              <span className="text-xs font-bold uppercase tracking-wider text-black/60">후속 조치를 할 일로 자동 생성</span>
            </label>
            
            <button type="button" className={`${buttonPrimaryClassName} mt-2`} onClick={handleSubmit}>회의 기록 저장</button>
          </div>
        </Section>
      </div>

      <div className="flex flex-col gap-6">
         <h3 className="font-display text-2xl font-bold tracking-tight">지난 회의 ({meetings.length})</h3>
         
         {meetings.length ? (
           <div className="grid gap-5">
             {meetings.map((meeting) => (
               <article key={meeting.id} className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8">
                 <div className="flex flex-wrap items-start justify-between gap-4">
                   <div className="space-y-1">
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-rust">{formatDate(meeting.time)}</p>
                      <h4 className="font-display text-2xl font-bold tracking-tight">{meeting.title}</h4>
                   </div>
                   <Pill tone="muted">조치 사항 {meeting.actions.length}개</Pill>
                 </div>
                 
                 <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                       <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-black/30">안건</span>
                       <p className="text-sm leading-relaxed text-black/70">{meeting.agenda}</p>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                       {meeting.decisions.length > 0 && <ListBlock title="주요 결정 사항" items={meeting.decisions} />}
                       {meeting.actions.length > 0 && <ListBlock title="후속 조치 계획" items={meeting.actions} />}
                    </div>
                 </div>
               </article>
             ))}
           </div>
         ) : <Empty>저장된 회의 기록이 없습니다.</Empty>}
      </div>
    </div>
  )
}
