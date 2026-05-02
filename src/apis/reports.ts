import { ApiRequestError, apiBaseUrl, getAccessToken, requestJson } from './client'
import type { ReportCreateResult } from './types'

export const reportApi = {
  create(projectId: number, reportType: 'PDF' = 'PDF') {
    return requestJson<ReportCreateResult>(
      `/api/projects/${projectId}/reports`,
      {
        method: 'POST',
        body: JSON.stringify({ reportType }),
      },
    )
  },
  async download(reportId: number) {
    const token = getAccessToken()
    const headers = new Headers()
    if (token) {
      headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`)
    }

    const response = await fetch(
      `${apiBaseUrl}/api/reports/${reportId}/download`,
      { headers },
    )
    if (!response.ok) {
      throw new ApiRequestError(
        `리포트 다운로드에 실패했습니다. (${response.status})`,
        response.status,
      )
    }
    return response.blob()
  },
}
