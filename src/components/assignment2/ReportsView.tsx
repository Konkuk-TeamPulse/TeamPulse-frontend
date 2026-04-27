import { Section, Stat, buttonPrimaryClassName, Empty, Pill } from './Common'
import type { WorkspaceState } from '../../types/workspace'

interface ReportsViewProps {
  workspace: WorkspaceState
  onGenerateReport: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function ReportsView({ workspace, onGenerateReport, showToast }: ReportsViewProps) {
  const doneTasks = workspace.tasks.filter((task) => task.status === 'DONE').length
  const totalTasks = workspace.tasks.length

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px] pb-10 animate-[rise_0.4s_ease-out]">
      <div className="flex flex-col gap-6">
        <h2 className="font-display text-4xl font-bold tracking-tight">리포트</h2>
        
        <Section title="프로젝트 건강도" eyebrow="Statistics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="완료된 할 일" value={`${doneTasks} / ${totalTasks}`} />
            <Stat label="진행된 회의" value={String(workspace.meetings.length)} />
            <Stat label="전체 활동로그" value={String(workspace.activities.length)} />
            <Stat label="발견된 리스크" value={String(workspace.risks.length)} />
          </div>
          
          <div className="mt-8 rounded-[2rem] border border-black/5 bg-white/50 p-8">
             <h4 className="font-display text-xl font-bold">자동 분석 및 생성</h4>
             <p className="mt-2 text-sm leading-relaxed text-black/65">
               TeamPulse가 팀의 작업 완료율, 회의 빈도, 활동 로그를 분석하여 객관적인 상태 리포트 초안을 생성합니다.
             </p>
             <button type="button" className={`${buttonPrimaryClassName} mt-6 w-full sm:w-auto px-10`} onClick={() => { onGenerateReport(); showToast('리포트 초안이 생성되었습니다.', 'success') }}>리포트 초안 새로고침</button>
          </div>
        </Section>
      </div>

      <div className="flex flex-col gap-6">
         <h3 className="font-display text-2xl font-bold tracking-tight">리포트 내역</h3>
         
         {workspace.reports.length ? (
           <div className="grid gap-4">
             {workspace.reports.map((report) => (
               <article key={report.id} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition hover:shadow-md">
                 <div className="flex items-center justify-between">
                    <strong className="font-display text-lg">{report.label}</strong>
                    <Pill tone={report.status === 'READY' ? 'good' : 'muted'}>{report.status === 'READY' ? '완성됨' : '준비중'}</Pill>
                 </div>
                 <p className="mt-2 text-xs font-bold text-black/40">{report.range}</p>
                 <button type="button" className="mt-4 text-xs font-bold text-rust hover:underline">상세 보기 →</button>
               </article>
             ))}
           </div>
         ) : <Empty>생성된 리포트가 없습니다.</Empty>}
      </div>
    </div>
  )
}
