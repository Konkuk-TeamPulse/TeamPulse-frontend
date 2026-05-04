import { useState, type FormEvent } from 'react'
import { Empty, inputClassName, Pill } from '../Common'
import type { Task, TaskStatus } from '../../../types/shell'

interface TaskBoardProps {
  grouped: Record<TaskStatus, Task[]>
  tasks: Task[]
  memberNames: string[]
  onUpdateStatus: (taskId: number, status: TaskStatus) => void
  onEditTask: (taskId: number, task: { title: string; owner: string; dueDate: string }) => void
  onAddDependency: (taskId: number, precedingTaskId: number) => void
  onRemoveDependency: (taskId: number, dependencyId: number) => void
  onRemoveTask: (taskId: number) => void
  formatDate: (value: string) => string
  statusLabels: Record<TaskStatus, string>
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function TaskBoard({
  grouped,
  tasks,
  memberNames,
  onUpdateStatus,
  onEditTask,
  onAddDependency,
  onRemoveDependency,
  onRemoveTask,
  formatDate,
  statusLabels,
  showToast
}: TaskBoardProps) {
  const [dependencyForms, setDependencyForms] = useState<Record<number, string>>({})
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ title: '', owner: '', dueDate: '' })

  const handleAddDependency = (task: Task) => {
    const precedingTaskId = dependencyForms[task.id] ? Number(dependencyForms[task.id]) : undefined
    if (!precedingTaskId) return showToast('선행 업무를 선택해주세요.', 'error')
    if (precedingTaskId === task.id) return showToast('자기 자신을 선행 업무로 설정할 수 없습니다.', 'error')

    onAddDependency(task.id, precedingTaskId)
    setDependencyForms((current) => ({ ...current, [task.id]: '' }))
  }

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setEditForm({ title: task.title, owner: task.owner, dueDate: task.dueDate })
  }

  const submitEdit = (task: Task) => {
    if (!editForm.title.trim()) return showToast('업무 제목을 입력해주세요.', 'error')
    if (!editForm.owner) return showToast('담당자를 선택해주세요.', 'error')
    if (!editForm.dueDate) return showToast('마감일을 선택해주세요.', 'error')

    onEditTask(task.id, editForm)
    setEditingTaskId(null)
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>, task: Task) => {
    event.preventDefault()
    submitEdit(task)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((status) => (
        <div key={status} className="flex min-h-[380px] flex-col gap-4 rounded-lg border border-slate-200 bg-white/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-[0.12em] text-slate-600">{statusLabels[status]}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">{grouped[status].length}</span>
          </div>

          <div className="flex flex-col gap-4">
            {grouped[status].length ? grouped[status].map((task) => (
              <article key={task.id} className={['rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md', status === 'DOING' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'].join(' ')}>
                {editingTaskId === task.id ? (
                  <form className="grid gap-3" onSubmit={(event) => handleEditSubmit(event, task)}>
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm font-extrabold text-slate-950">업무 수정</strong>
                      <div className="flex gap-2">
                        <button type="submit" className="rounded-lg bg-forest px-3 py-2 text-xs font-bold text-white">저장</button>
                        <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50" onClick={() => setEditingTaskId(null)}>취소</button>
                      </div>
                    </div>
                    <label className="grid items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)]">
                      <span className="text-xs font-bold text-slate-500">제목</span>
                      <input className={inputClassName} value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
                    </label>
                    <label className="grid items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)]">
                      <span className="text-xs font-bold text-slate-500">담당자</span>
                      <select className={inputClassName} value={editForm.owner} onChange={(event) => setEditForm({ ...editForm, owner: event.target.value })}>
                        {memberNames.map((name) => <option key={name} value={name}>{name}</option>)}
                      </select>
                    </label>
                    <label className="grid items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)]">
                      <span className="text-xs font-bold text-slate-500">마감일</span>
                      <input className={inputClassName} type="date" value={editForm.dueDate} onChange={(event) => setEditForm({ ...editForm, dueDate: event.target.value })} />
                    </label>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <strong className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-950">{task.title}</strong>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[0.65rem] font-bold text-slate-500 transition hover:bg-slate-100"
                          onClick={() => startEdit(task)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-rose-100 px-2.5 py-1.5 text-[0.65rem] font-bold text-rose-500 transition hover:bg-rose-500 hover:text-white"
                          onClick={() => onRemoveTask(task.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{task.owner}</span>
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </>
                )}

                {task.blockers.length > 0 && (
                  <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50/70 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-rose-700">선행 업무</span>
                      <span className="text-[0.65rem] font-bold text-rose-500">{task.blockers.length}개</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.blockers.map((blocker, index) => {
                        const dependencyId = tasks.find((candidate) => candidate.title === blocker)?.id
                        return (
                          <button
                            key={index}
                            type="button"
                            className="rounded-full"
                            onClick={() => dependencyId && onRemoveDependency(task.id, dependencyId)}
                            title="선행 업무 삭제"
                          >
                            <Pill tone="accent">{blocker} ×</Pill>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-3">
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">선행 업무 추가</span>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-forest/40"
                      value={dependencyForms[task.id] ?? ''}
                      onChange={(event) => setDependencyForms((current) => ({ ...current, [task.id]: event.target.value }))}
                    >
                      <option value="">업무 선택</option>
                      {tasks
                        .filter((candidate) => candidate.id !== task.id && !task.blockers.includes(candidate.title))
                        .map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>{candidate.title}</option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-500 transition hover:bg-forest hover:text-white"
                      onClick={() => handleAddDependency(task)}
                    >
                      추가
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).filter((candidate) => candidate !== status).map((candidate) => (
                    <button
                      key={candidate}
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-slate-500 transition hover:bg-forest hover:text-white"
                      onClick={() => onUpdateStatus(task.id, candidate)}
                    >
                      {statusLabels[candidate]}로 이동
                    </button>
                  ))}
                </div>
              </article>
            )) : <Empty>비어 있습니다.</Empty>}
          </div>
        </div>
      ))}
    </div>
  )
}
