import { Empty } from '../Common'
import type { Activity, Task } from '../../../types/shell'
import type { TeamProfile } from '../../../types/workspace'

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

export function InviteLinkCard({ inviteUrl, inviteExpiredAt, onCreateInviteLink }: { inviteUrl: string; inviteExpiredAt?: string; onCreateInviteLink: () => void }) {
  const inviteLink = inviteUrl || '초대 링크를 생성해주세요'

  return (
    <article className="rounded-lg border border-teal-100 bg-mist p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-slate-900">팀원 초대</h3>
        <button
          type="button"
          className="rounded-md bg-forest px-3 py-1.5 text-[0.68rem] font-bold text-white transition hover:bg-[#08283e]"
          onClick={onCreateInviteLink}
        >
          생성
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{inviteLink}</span>
        <span className="rounded-md bg-forest px-2 py-1 text-[0.65rem] font-bold text-white">링크</span>
      </div>
      {inviteExpiredAt && <p className="mt-3 text-xs font-semibold text-slate-500">만료 {inviteExpiredAt}</p>}
    </article>
  )
}

export function ActivityListCard({ activities }: { activities: Activity[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">최근 활동</h3>
        <span className="text-xs font-semibold text-slate-500">{activities.length}</span>
      </div>
      <div className="mt-5 grid gap-3">
        {activities.length ? activities.slice(0, 4).map((activity) => (
          <div key={activity.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <strong className="block text-xs font-bold text-slate-900">{activity.summary}</strong>
            <p className="mt-1 text-[0.68rem] font-medium text-slate-500">{activity.actor} · {activity.at}</p>
          </div>
        )) : <Empty>활동 기록이 없습니다.</Empty>}
      </div>
    </article>
  )
}

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

function StatusBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <strong className="mt-2 block text-2xl font-extrabold text-slate-950">{value}</strong>
    </div>
  )
}

function statusLabel(status: Task['status']) {
  if (status === 'TODO') return '할 일'
  if (status === 'DOING') return '진행 중'
  return '완료'
}
