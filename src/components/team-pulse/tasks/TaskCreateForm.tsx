import { useState, type FormEvent } from 'react'
import { Section, Field, inputClassName, buttonPrimaryClassName } from '../ui/Common'
import type { Task } from '../../../types/shell'
import type { Member } from '../../../types/workspace'

interface TaskCreateFormProps {
  tasks: Task[]
  members: Member[]
  defaultOwnerId: number
  onAddTask: (task: { title: string; ownerId: number; dueDate: string; blockers: string; precedingTaskId?: number }) => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function TaskCreateForm({ tasks, members, defaultOwnerId, onAddTask, showToast }: TaskCreateFormProps) {
  const [form, setForm] = useState({ title: '', ownerId: String(defaultOwnerId || ''), dueDate: '', precedingTaskId: '' })

  const handleSubmit = () => {
    const title = form.title.trim()
    if (!title) return showToast('할 일 제목을 입력해주세요.', 'error')
    if (!form.ownerId) return showToast('담당자를 선택해주세요.', 'error')
    if (tasks.some((task) => task.title.trim() === title)) return showToast('이미 있는 업무입니다.', 'error')
    if (!form.dueDate) return showToast('마감일을 선택해주세요.', 'error')

    onAddTask({
      title,
      ownerId: Number(form.ownerId),
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
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          >
            <option value="">담당자 선택</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
            ))}
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
