import { reportApi } from '..'
import { buildActivity } from '../../lib/workspace-store'
import type { Report } from '../../types/shell'
import type { WorkspaceState } from '../../types/workspace'
import { getActiveProjectId } from './active-project'
import { loadWorkspaceByProject } from './workspace-api'

export async function generateTeamPulseReport() {
  const report = await reportApi.create(getActiveProjectId())
  return withReport(await loadWorkspaceByProject(getActiveProjectId()), {
    id: report.reportId,
    label: 'TeamPulse PDF 리포트',
    range: report.downloadUrl,
    status: 'READY',
  })
}

export async function downloadTeamPulseReport(reportId: number) {
  return reportApi.download(reportId)
}

function withReport(workspace: WorkspaceState, report: Report): WorkspaceState {
  return {
    ...workspace,
    reports: [report, ...workspace.reports],
    activities: [
      buildActivity(`${report.label}가 생성되었습니다.`, workspace.user.name),
      ...workspace.activities,
    ],
  }
}
