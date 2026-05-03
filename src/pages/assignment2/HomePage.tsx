import {
  ActivityListCard,
  InviteLinkCard,
  MetricCard,
  MiniTaskBoard,
  ProjectProgressCard,
  TaskStatusSummary,
} from '../../components/assignment2/dashboard/DashboardCards'
import type { WorkspaceState } from '../../types/workspace'
import type { Task } from '../../types/shell'

interface HomePageProps {
  workspace: WorkspaceState
  tasks: Task[]
  completion: number
  formatDate: (value: string) => string
  onCreateInviteLink: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function HomePage({ workspace, tasks, completion, formatDate, onCreateInviteLink, showToast }: HomePageProps) {
  const pendingTasks = tasks.filter((task) => task.status !== 'DONE')
  const doneTasks = tasks.filter((task) => task.status === 'DONE')
  const activeRisks = workspace.risks.filter((risk) => risk.severity !== 'INFO')
  const riskLabel = activeRisks.length ? activeRisks[0].severity === 'CRITICAL' ? '높음' : '보통' : '낮음'

  return (
    <div className="space-y-8">
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_240px_240px]">
        <ProjectProgressCard team={workspace.team} completion={completion} formatDate={formatDate} />
        <MetricCard label="남은 업무" value={`${pendingTasks.length}`} detail={`/ ${tasks.length}`} tone="blue" />
        <MetricCard label="리스크 수준" value={riskLabel} detail={activeRisks.length ? `${activeRisks.length}개 활성` : '안정'} tone={riskLabel === '낮음' ? 'green' : 'yellow'} />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <TaskStatusSummary tasks={tasks.map((task) => ({ ...task, dueDate: formatDate(task.dueDate) }))} />

        <aside className="grid min-w-0 gap-5">
          <InviteLinkCard
            inviteUrl={workspace.team.inviteUrl ?? ''}
            inviteExpiredAt={workspace.team.inviteExpiredAt}
            onCreateInviteLink={onCreateInviteLink}
            showToast={showToast}
          />
          <ActivityListCard activities={workspace.activities} />
        </aside>
      </section>

      <MiniTaskBoard tasks={tasks} doneCount={doneTasks.length} formatDate={formatDate} />
    </div>
  )
}
