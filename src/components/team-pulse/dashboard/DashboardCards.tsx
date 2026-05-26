import { Empty } from '../ui/Common'
import type { Task } from '../../../types/shell'
import type { TeamProfile } from '../../../types/workspace'

export { ActivityListCard, InviteLinkCard } from './DashboardSideCards'
export { MiniTaskBoard } from './MiniTaskBoard'

interface ProjectProgressCardProps {
  team: TeamProfile
  completion: number
  formatDate: (value: string) => string
}

export function ProjectProgressCard({ team, completion, formatDate }: ProjectProgressCardProps) {
  return (
    <div className="rounded-lg bg-forest p-6 text-white shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">{team.name || '프로젝트'}</h2>
          <p className="mt-2 text-sm font-medium text-white/70">마감일 {formatDate(team.dueDate)}</p>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">진행 중</span>
      </div>
      <div className="mt-9 flex items-end gap-4">
        <strong className="text-5xl font-extrabold tracking-tight">{completion}%</strong>
        <span className="pb-2 text-sm font-medium text-white/70">전체 진행률</span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(completion, 100)}%` }} />
      </div>
    </div>
  )
}

export function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'blue' | 'green' | 'yellow' }) {
  const dotClass = tone === 'green' ? 'bg-emerald-500' : tone === 'yellow' ? 'bg-gold' : 'bg-blue-500'

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <span className={`block h-3 w-3 rounded-full ${dotClass}`} />
      <p className="mt-7 text-sm font-semibold text-slate-500">{label}</p>
      <div className="mt-2 flex items-end gap-1">
        <strong className="text-3xl font-extrabold text-slate-950">{value}</strong>
        <span className="pb-1 text-sm font-semibold text-slate-500">{detail}</span>
      </div>
    </article>
  )
}

export function TaskStatusSummary({ tasks }: { tasks: Task[] }) {
  const pendingTasks = tasks.filter((task) => task.status !== 'DONE')
  const doneTasks = tasks.filter((task) => task.status === 'DONE')

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">업무 현황</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatusBox label="할 일" value={tasks.filter((task) => task.status === 'TODO').length} />
        <StatusBox label="진행 중" value={tasks.filter((task) => task.status === 'DOING').length} />
        <StatusBox label="완료" value={doneTasks.length} />
      </div>
      <div className="mt-6 grid gap-3">
        {pendingTasks.slice(0, 5).map((task) => (
          <div key={task.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <strong className="block truncate text-sm font-bold text-slate-900">{task.title}</strong>
              <span className="text-xs font-medium text-slate-500">{task.owner}</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">{task.dueDate}</span>
          </div>
        ))}
        {!pendingTasks.length && <Empty>진행 중인 업무가 없습니다.</Empty>}
      </div>
    </article>
  )
}

function StatusBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <strong className="mt-2 block text-2xl font-extrabold text-slate-950">{value}</strong>
    </div>
  )
}
