import { useState } from 'react'
import { Section, Field, inputClassName, areaClassName, buttonPrimaryClassName, Empty, Pill } from './Common'
import type { Task, TaskStatus } from '../../types/shell'

interface TasksViewProps {
  grouped: Record<TaskStatus, Task[]>
  memberNames: string[]
  defaultOwner: string
  onAddTask: (task: { title: string; owner: string; dueDate: string; blockers: string }) => void
  onUpdateStatus: (taskId: number, status: TaskStatus) => void
  onRemoveTask: (taskId: number) => void
  formatDate: (value: string) => string
  statusLabels: Record<TaskStatus, string>
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function TasksView({
  grouped,
  memberNames,
  defaultOwner,
  onAddTask,
  onUpdateStatus,
  onRemoveTask,
  formatDate,
  statusLabels,
  showToast
}: TasksViewProps) {
  const [form, setForm] = useState({ title: '', owner: defaultOwner, dueDate: '', blockers: '' })

  const handleSubmit = () => {
    if (!form.title.trim()) return showToast('할 일 제목을 입력해주세요.', 'error')
    if (!form.dueDate) return showToast('마감일을 선택해주세요.', 'error')
    
    onAddTask(form)
    setForm({ ...form, title: '', blockers: '' })
    showToast('새로운 할 일이 추가되었습니다.', 'success')
  }

  return (
    <div className="space-y-10 pb-10 animate-[rise_0.4s_ease-out]">
      <Section title="새로운 할 일" eyebrow="Input">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="할 일 제목">
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
            <button type="button" className={`${buttonPrimaryClassName} w-full`} onClick={handleSubmit}>추가하기</button>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
             <Field label="차단 요소 (선택사항)">
               <textarea 
                className={areaClassName} 
                value={form.blockers} 
                onChange={(e) => setForm({ ...form, blockers: e.target.value })} 
                placeholder="한 줄에 하나씩 입력하세요" 
               />
             </Field>
          </div>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((status) => (
          <div key={status} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="font-display text-xl font-bold tracking-tight">{statusLabels[status]}</h3>
               <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-bold text-black/40">{grouped[status].length}</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {grouped[status].length ? grouped[status].map((task) => (
                <article key={task.id} className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <strong className="block font-display text-lg leading-snug">{task.title}</strong>
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-black/50">
                    <span>{task.owner}</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  
                  {task.blockers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {task.blockers.map((b, i) => <Pill key={i} tone="accent">{b}</Pill>)}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-black/5 pt-4">
                    {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).filter(s => s !== status).map((candidate) => (
                      <button 
                        key={candidate} 
                        type="button" 
                        className="rounded-full border border-black/10 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-black/50 transition hover:bg-forest hover:text-paper" 
                        onClick={() => onUpdateStatus(task.id, candidate)}
                      >
                        {statusLabels[candidate]}로 이동
                      </button>
                    ))}
                    <button 
                      type="button" 
                      className="ml-auto rounded-full border border-rust/20 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-rust/60 transition hover:bg-rust hover:text-paper" 
                      onClick={() => onRemoveTask(task.id)}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              )) : <Empty>이 항목에 데이터가 없습니다.</Empty>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
