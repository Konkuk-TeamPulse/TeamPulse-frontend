import { useState } from 'react'
import { Section, Field, inputClassName, areaClassName, buttonPrimaryClassName } from '../Common'

export interface MeetingFormValue {
  title: string
  time: string
  agenda: string
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
  const [form, setForm] = useState<MeetingFormValue>({
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

    onSubmit(form)
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
    <Section title="새 회의 등록" eyebrow="입력">
      <div className="grid gap-5">
        <Field label="회의 제목">
          <input className={inputClassName} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 주간 싱크, 킥오프 등" />
        </Field>
        <Field label="일시">
          <input className={inputClassName} type="datetime-local" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </Field>
        <Field label="안건">
          <textarea className={areaClassName} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
        </Field>
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

        <button type="button" className={`${buttonPrimaryClassName} mt-2`} onClick={handleSubmit}>회의 기록 저장</button>
      </div>
    </Section>
  )
}
