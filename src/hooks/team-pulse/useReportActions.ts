import { downloadTeamPulseReport, generateTeamPulseReport } from '../../apis/team-pulse'
import type { ShowToast, WorkspaceActionRunner } from './workspace-types'

export function useReportActions({
  runWorkspaceAction,
  showToast,
  transport,
}: {
  runWorkspaceAction: WorkspaceActionRunner
  showToast: ShowToast
  transport: 'api' | 'offline'
}) {
  const generateReport = () => {
    runWorkspaceAction(
      () => generateTeamPulseReport(),
      '리포트가 생성되었습니다.'
    )
  }

  const downloadReport = async (reportId: number) => {
    if (transport !== 'api') {
      showToast('PDF 다운로드는 서버 연결 상태에서 사용할 수 있습니다.', 'error')
      return
    }

    try {
      const blob = await downloadTeamPulseReport(reportId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'teampulse-report.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast('PDF 다운로드를 시작했습니다.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PDF 다운로드에 실패했습니다.'
      showToast(message, 'error')
    }
  }

  return { downloadReport, generateReport }
}
