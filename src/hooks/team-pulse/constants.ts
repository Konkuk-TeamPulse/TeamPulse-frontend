import type { TaskStatus } from '../../types/shell'

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: '할 일',
  DOING: '진행 중',
  DONE: '완료',
}
