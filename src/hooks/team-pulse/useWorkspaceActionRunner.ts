import { useCallback, useState } from 'react'
import type { WorkspaceState } from '../../types/workspace'
import type { ShowToast } from './workspace-types'

export function useWorkspaceActionRunner({
  setTransport,
  setWorkspace,
  showToast,
}: {
  setTransport: (transport: 'api' | 'offline') => void
  setWorkspace: (workspace: WorkspaceState) => void
  showToast: ShowToast
}) {
  const [isBusy, setIsBusy] = useState(false)

  const runWorkspaceAction = useCallback(async (
    apiAction: () => Promise<WorkspaceState>,
    successMsg?: string
  ) => {
    if (isBusy) {
      showToast('이전 요청을 처리하는 중입니다.', 'info')
      return
    }

    setIsBusy(true)
    try {
      const nextWorkspace = await apiAction()
      setTransport('api')
      setWorkspace(nextWorkspace)
      if (successMsg) showToast(successMsg, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : '요청에 실패했습니다.'
      showToast(message, 'error')
    } finally {
      setIsBusy(false)
    }
  }, [isBusy, setTransport, setWorkspace, showToast])

  return { isBusy, runWorkspaceAction }
}
