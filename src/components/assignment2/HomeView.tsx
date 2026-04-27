import { Section, Stat, Empty, Pill } from './Common'
import type { WorkspaceState } from '../../types/workspace'
import type { Task } from '../../types/shell'

interface HomeViewProps {
  workspace: WorkspaceState
  tasks: Task[]
  completion: number
  formatDate: (value: string) => string
}

export function HomeView({ workspace, tasks, completion, formatDate }: HomeViewProps) {
  const pendingTasks = tasks.filter((task) => task.status !== 'DONE')

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-[rise_0.4s_ease-out]">
      <div className="col-span-full mb-2">
         <h2 className="font-display text-4xl font-bold tracking-tight">프로젝트 현황</h2>
      </div>

      <Stat label="전체 할 일" value={String(workspace.tasks.length)} />
      <Stat label="진행률" value={`${completion}%`} />
      <Stat label="회의 기록" value={String(workspace.meetings.length)} />
      <Stat label="발견된 리스크" value={String(workspace.risks.length)} />

      <div className="col-span-full lg:col-span-2">
        <Section title="다가오는 할 일" eyebrow="Next Actions">
          {pendingTasks.length ? (
            <div className="grid gap-3">
              {pendingTasks.slice(0, 5).map((task) => (
                <article key={task.id} className="rounded-2xl border border-black/5 bg-white/60 p-5 transition hover:bg-white/90">
                  <div className="flex items-start justify-between">
                    <strong className="font-display text-lg">{task.title}</strong>
                    <Pill tone={task.status === 'DOING' ? 'accent' : 'muted'}>{task.status === 'DOING' ? '진행중' : '대기중'}</Pill>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-black/50">
                    <span>{task.owner}</span>
                    <span>마감: {formatDate(task.dueDate)}</span>
                  </div>
                  {task.blockers.length > 0 && (
                    <div className="mt-3 border-t border-black/5 pt-3 text-xs font-bold text-rust">
                       차단 요소: {task.blockers.join(', ')}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : <Empty>진행 중인 할 일이 없습니다. 할 일 탭에서 새로운 작업을 추가해보세요.</Empty>}
        </Section>
      </div>

      <div className="col-span-full lg:col-span-1">
        <Section title="리스크 신호" eyebrow="Health">
          {workspace.risks.length ? (
            <div className="grid gap-3">
              {workspace.risks.map((risk) => (
                <article key={risk.id} className="rounded-2xl border border-black/5 bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="font-display text-base">{risk.title}</strong>
                    <Pill tone={risk.severity === 'CRITICAL' ? 'accent' : risk.severity === 'WARNING' ? 'muted' : 'good'}>
                      {risk.severity === 'CRITICAL' ? '심각' : risk.severity === 'WARNING' ? '주의' : '양호'}
                    </Pill>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-black/60">{risk.body}</p>
                  <p className="mt-3 rounded-2xl bg-paper/70 px-3 py-2 text-xs font-bold leading-relaxed text-forest">
                    대응: {risk.action}
                  </p>
                </article>
              ))}
            </div>
          ) : <Empty>감지된 리스크가 없습니다.</Empty>}
        </Section>
      </div>

      <div className="col-span-full">
        <Section title="최근 활동" eyebrow="Timeline">
          {workspace.activities.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspace.activities.slice(0, 9).map((activity) => (
                <article key={activity.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-forest">
                  <strong className="block text-sm font-bold leading-tight">{activity.summary}</strong>
                  <div className="mt-1 flex gap-2 text-[0.65rem] font-bold text-black/40">
                     <span>{activity.actor}</span>
                     <span>•</span>
                     <span>{activity.at}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : <Empty>활동 로그가 없습니다.</Empty>}
        </Section>
      </div>
    </div>
  )
}
