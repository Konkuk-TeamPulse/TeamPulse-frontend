import { useState, type FormEvent } from 'react'
import { Section, Field, inputClassName, areaClassName, buttonPrimaryClassName } from '../Common'

export interface MeetingFormValue {
  title: string
  time: string
  agenda: string
  attendees: string[]
  decisions: string
  actions: string
  actionOwner: string
  createTasks: boolean
}

interface MeetingFormProps {
  memberNames: string[]
  defaultOwner: string
  onSubmit: (meeting: MeetingFormValue) => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function MeetingForm({ memberNames, defaultOwner, onSubmit, showToast }: MeetingFormProps) {
  const defaultAttendees = memberNames.includes(defaultOwner)
    ? [defaultOwner]
    : memberNames.slice(0, 1)

  const [form, setForm] = useState<MeetingFormValue>({
    title: '',
    time: '',
    agenda: '',
    attendees: defaultAttendees,
    decisions: '',
    actions: '',
    actionOwner: defaultOwner,
    createTasks: true,
  })

  const handleSubmit = () => {
    if (!form.title.trim()) return showToast('회의 제목을 입력해주세요.', 'error')
    if (!form.time) return showToast('회의 일시를 선택해주세요.', 'error')
    if (!form.agenda.trim()) return showToast('안건을 입력해주세요.', 'error')
    const selectedAttendees = form.attendees.filter((attendee) => memberNames.includes(attendee))
    if (!selectedAttendees.length) return showToast('출석자를 한 명 이상 선택해주세요.', 'error')

    onSubmit({ ...form, attendees: selectedAttendees })
    setForm({
      ...form,
      title: '',
      time: '',
      agenda: '',
      attendees: defaultAttendees,
      decisions: '',
      actions: '',
    })
    showToast('회의 기록이 저장되었습니다.', 'success')
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSubmit()
  }

  const toggleAttendee = (name: string) => {
    const attendees = form.attendees.includes(name)
      ? form.attendees.filter((attendee) => attendee !== name)
      : [...form.attendees, name]

    setForm({ ...form, attendees })
  }

  return (
    <Section title="새 회의 등록" eyebrow="입력">
      <form className="grid gap-5" onSubmit={handleFormSubmit}>
        <Field label="회의 제목">
          <input className={inputClassName} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 주간 싱크, 킥오프 등" />
        </Field>
        <Field label="일시">
          <input className={inputClassName} type="datetime-local" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </Field>
        <Field label="안건">
          <textarea className={areaClassName} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
        </Field>
        <div className="grid gap-2">
          <span className="text-sm font-medium text-slate-600">출석자</span>
          {memberNames.length ? (
            <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {memberNames.map((name) => (
                <label key={name} className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-forest focus:ring-forest"
                    checked={form.attendees.includes(name)}
                    onChange={() => toggleAttendee(name)}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
              선택할 수 있는 팀원이 없습니다.
            </p>
          )}
        </div>
        <Field label="결정 사항">
          <textarea className={areaClassName} value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} placeholder="한 줄에 하나씩 입력" />
        </Field>
        <Field label="후속 조치">
          <textarea className={areaClassName} value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} placeholder="한 줄에 하나씩 입력" />
        </Field>
        <Field label="조치 담당자">
          <select className={inputClassName} value={form.actionOwner} onChange={(e) => setForm({ ...form, actionOwner: e.target.value })}>
            {memberNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </Field>

        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-slate-200 text-forest focus:ring-forest"
            checked={form.createTasks}
            onChange={(e) => setForm({ ...form, createTasks: e.target.checked })}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">후속 조치를 할 일로 자동 생성</span>
        </label>

        <button type="submit" className={`${buttonPrimaryClassName} mt-2`}>회의 기록 저장</button>
      </form>
    </Section>
  )
}
