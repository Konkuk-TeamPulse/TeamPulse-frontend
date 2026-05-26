import {
  addTeamPulseTaskDependency,
  createTeamPulseTask,
  deleteTeamPulseTask,
  removeTeamPulseTaskDependency,
  updateTeamPulseTask,
  updateTeamPulseTaskStatus,
} from '../../apis/team-pulse'
import { parseLines } from '../../lib/utils'
import type { TaskStatus } from '../../types/shell'
import type { ShowToast, WorkspaceActionRunner } from './workspace-types'

export function useTaskActions(runWorkspaceAction: WorkspaceActionRunner, showToast: ShowToast) {
  const addTask = (form: { title: string; owner: string; dueDate: string; blockers: string; precedingTaskId?: number }) => {
    runWorkspaceAction(
      () => createTeamPulseTask({ ...form, blockers: parseLines(form.blockers) }),
    )
  }

  const updateTaskStatus = (taskId: number, status: TaskStatus) => {
    runWorkspaceAction(
      () => updateTeamPulseTaskStatus(taskId, status),
    )
  }

  const editTask = (taskId: number, input: { title: string; owner: string; dueDate: string }) => {
    runWorkspaceAction(
      () => updateTeamPulseTask({ taskId, ...input }),
      '업무가 수정되었습니다.'
    )
  }

  const addTaskDependency = (taskId: number, precedingTaskId: number) => {
    if (taskId === precedingTaskId) {
      showToast('자기 자신을 선행 업무로 설정할 수 없습니다.', 'error')
      return
    }

    runWorkspaceAction(
      () => addTeamPulseTaskDependency(taskId, precedingTaskId),
      '선행 업무가 추가되었습니다.'
    )
  }

  const removeTaskDependency = (taskId: number, dependencyId: number) => {
    runWorkspaceAction(
      () => removeTeamPulseTaskDependency(taskId, dependencyId),
      '선행 업무가 삭제되었습니다.'
    )
  }

  const removeTask = (taskId: number) => {
    runWorkspaceAction(
      () => deleteTeamPulseTask(taskId),
    )
  }

  return {
    addTask,
    addTaskDependency,
    editTask,
    removeTask,
    removeTaskDependency,
    updateTaskStatus,
  }
}
