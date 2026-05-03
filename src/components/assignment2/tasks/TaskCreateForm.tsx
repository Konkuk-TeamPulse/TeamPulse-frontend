import { useState, type FormEvent } from 'react'
import { Section, Field, inputClassName, buttonPrimaryClassName } from '../Common'
import type { Task } from '../../../types/shell'

interface TaskCreateFormProps {
  tasks: Task[]
  memberNames: string[]
  defaultOwner: string
  onAddTask: (task: { title: string; owner: string; dueDate: string; blockers: string; precedingTaskId?: number }) => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function TaskCreateForm({ tasks, memberNames, defaultOwner, onAddTask, showToast }: TaskCreateFormProps) {
  const [form, setForm] = useState({ title: '', owner: defaultOwner, dueDate: '', precedingTaskId: '' })

  const handleSubmit = () => {
    if (!form.title.trim()) return showToast('할 일 제목을 입력해주세요.', 'error')
    if (!form.dueDate) return showToast('마감일을 선택해주세요.', 'error')

    onAddTask({
      title: form.title,
      owner: form.owner,
      dueDate: form.dueDate,
      blockers: '',
      precedingTaskId: form.precedingTaskId ? Number(form.precedingTaskId) : undefined,
    })
    setForm({ ...form, title: '', precedingTaskId: '' })
    showToast('새로운 할 일이 추가되었습니다.', 'success')
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSubmit()
  }

  return (
    <Section title="새 업무" eyebrow="입력">
      <form className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleFormSubmit}>
        <Field label="업무 제목">
          <input
            className={inputClassName}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="무엇을 해야 하나요?"
          />
        </Field>
        <Field label="담당자">
          <select
            className={inputClassName}
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
          >
            {memberNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </Field>
        <Field label="마감일">
          <input
            className={inputClassName}
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </Field>
        <div className="flex items-end">
          <button type="submit" className={`${buttonPrimaryClassName} w-full`}>업무 생성</button>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Field label="선행 업무">
            <select
              className={inputClassName}
              value={form.precedingTaskId}
              onChange={(e) => setForm({ ...form, precedingTaskId: e.target.value })}
            >
              <option value="">없음</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </Field>
        </div>
      </form>
    </Section>
  )
}
