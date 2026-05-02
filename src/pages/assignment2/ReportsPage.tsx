import { useState } from 'react'
import { Section, Stat, buttonPrimaryClassName, Empty, Pill } from '../../components/assignment2/Common'
import type { WorkspaceState } from '../../types/workspace'

interface ReportsPageProps {
  workspace: WorkspaceState
  onGenerateReport: () => void
  onDownloadReport: (reportId: number) => Promise<void>
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function ReportsPage({ workspace, onGenerateReport, onDownloadReport }: ReportsPageProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const doneTasks = workspace.tasks.filter((task) => task.status === 'DONE').length
  const totalTasks = workspace.tasks.length

  const handleDownload = async (reportId: number) => {
    setDownloadingId(reportId)
    try {
      await onDownloadReport(reportId)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="grid gap-6 pb-20 lg:grid-cols-[1fr_360px] lg:pb-0">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">리포트</h2>
        
        <Section title="프로젝트 요약" eyebrow="통계">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="완료된 할 일" value={`${doneTasks} / ${totalTasks}`} />
            <Stat label="진행된 회의" value={String(workspace.meetings.length)} />
            <Stat label="전체 활동로그" value={String(workspace.activities.length)} />
            <Stat label="발견된 리스크" value={String(workspace.risks.length)} />
          </div>
          
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
             <h4 className="text-base font-bold text-slate-950">PDF 내보내기</h4>
             <button type="button" className={`${buttonPrimaryClassName} mt-6 w-full sm:w-auto px-10`} onClick={onGenerateReport}>PDF 리포트 생성</button>
          </div>
        </Section>
      </div>

      <div className="flex flex-col gap-6">
         <h3 className="text-lg font-extrabold tracking-tight text-slate-950">리포트 내역</h3>
         
         {workspace.reports.length ? (
           <div className="grid gap-4">
             {workspace.reports.map((report) => (
               <article key={report.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                 <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-slate-950">{report.label}</strong>
                    <Pill tone={report.status === 'READY' ? 'good' : 'muted'}>{report.status === 'READY' ? '완성됨' : '준비중'}</Pill>
                 </div>
                 <p className="mt-2 text-xs font-semibold text-slate-500">{report.range}</p>
                 <button
                  type="button"
                  className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-forest transition hover:bg-forest hover:text-white disabled:cursor-wait disabled:opacity-50"
                  disabled={downloadingId === report.id || report.status !== 'READY'}
                  onClick={() => void handleDownload(report.id)}
                >
                  {downloadingId === report.id ? '다운로드 중...' : 'PDF 다운로드'}
                </button>
               </article>
             ))}
           </div>
         ) : <Empty>생성된 리포트가 없습니다.</Empty>}
      </div>
    </div>
  )
}
