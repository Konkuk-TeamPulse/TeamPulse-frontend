import type { Task } from '../../../types/shell'
import { Empty } from '../ui/Common'

export function MiniTaskBoard({ tasks, doneCount, formatDate }: { tasks: Task[]; doneCount: number; formatDate: (value: string) => string }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-slate-950">업무 보드</h3>
        <span className="text-sm font-semibold text-slate-500">완료 {doneCount}개</span>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        {(['TODO', 'DOING', 'DONE'] as const).map((status) => (
          <div key={status} className="rounded-lg border border-slate-200 bg-white/60 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-[0.12em] text-slate-600">{statusLabel(status)}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">{tasks.filter((task) => task.status === status).length}</span>
            </div>
            <div className="grid gap-3">
              {tasks.filter((task) => task.status === status).slice(0, 3).map((task) => (
                <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <strong className="block text-sm font-bold text-slate-950">{task.title}</strong>
                  <p className="mt-2 text-xs font-medium text-slate-500">{task.owner} · {formatDate(task.dueDate)}</p>
                  {task.blockers.length > 0 && <p className="mt-3 text-xs font-semibold text-rose-600">선행 업무: {task.blockers.join(', ')}</p>}
                </article>
              ))}
              {!tasks.filter((task) => task.status === status).length && <Empty>비어 있습니다.</Empty>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function statusLabel(status: Task['status']) {
  if (status === 'TODO') return '할 일'
  if (status === 'DOING') return '진행 중'
  return '완료'
}
