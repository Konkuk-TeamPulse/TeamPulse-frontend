import type { FormEvent } from 'react'
import { inputClassName } from '../ui/Common'
import type { Task } from '../../../types/shell'

export type TaskEditFormValue = {
  title: string
  owner: string
  dueDate: string
}

export function TaskEditForm({
  editForm,
  memberNames,
  onCancel,
  onChange,
  onSubmit,
  task,
}: {
  editForm: TaskEditFormValue
  memberNames: string[]
  onCancel: () => void
  onChange: (value: TaskEditFormValue) => void
  onSubmit: (event: FormEvent<HTMLFormElement>, task: Task) => void
  task: Task
}) {
  return (
    <form className="grid gap-3" onSubmit={(event) => onSubmit(event, task)}>
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm font-extrabold text-slate-950">업무 수정</strong>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-forest px-3 py-2 text-xs font-bold text-white">저장</button>
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50" onClick={onCancel}>취소</button>
        </div>
      </div>
      <label className="grid items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)]">
        <span className="text-xs font-bold text-slate-500">제목</span>
        <input className={inputClassName} value={editForm.title} onChange={(event) => onChange({ ...editForm, title: event.target.value })} />
      </label>
      <label className="grid items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)]">
        <span className="text-xs font-bold text-slate-500">담당자</span>
        <select className={inputClassName} value={editForm.owner} onChange={(event) => onChange({ ...editForm, owner: event.target.value })}>
          {memberNames.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label className="grid items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)]">
        <span className="text-xs font-bold text-slate-500">마감일</span>
        <input className={inputClassName} type="date" value={editForm.dueDate} onChange={(event) => onChange({ ...editForm, dueDate: event.target.value })} />
      </label>
    </form>
  )
}
