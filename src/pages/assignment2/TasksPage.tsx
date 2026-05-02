import { TaskBoard } from '../../components/assignment2/tasks/TaskBoard'
import { TaskCreateForm } from '../../components/assignment2/tasks/TaskCreateForm'
import type { Task, TaskStatus } from '../../types/shell'

interface TasksPageProps {
  grouped: Record<TaskStatus, Task[]>
  tasks: Task[]
  memberNames: string[]
  defaultOwner: string
  onAddTask: (task: { title: string; owner: string; dueDate: string; blockers: string; precedingTaskId?: number }) => void
  onUpdateStatus: (taskId: number, status: TaskStatus) => void
  onEditTask: (taskId: number, task: { title: string; owner: string; dueDate: string }) => void
  onAddDependency: (taskId: number, precedingTaskId: number) => void
  onRemoveDependency: (taskId: number, dependencyId: number) => void
  onRemoveTask: (taskId: number) => void
  formatDate: (value: string) => string
  statusLabels: Record<TaskStatus, string>
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function TasksPage({
  grouped,
  tasks,
  memberNames,
  defaultOwner,
  onAddTask,
  onUpdateStatus,
  onEditTask,
  onAddDependency,
  onRemoveDependency,
  onRemoveTask,
  formatDate,
  statusLabels,
  showToast
}: TasksPageProps) {
  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <TaskCreateForm tasks={tasks} memberNames={memberNames} defaultOwner={defaultOwner} onAddTask={onAddTask} showToast={showToast} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-950">업무 보드</h2>
        <span className="text-sm font-semibold text-slate-500">총 {tasks.length}개</span>
      </div>

      <TaskBoard
        grouped={grouped}
        tasks={tasks}
        memberNames={memberNames}
        onUpdateStatus={onUpdateStatus}
        onEditTask={onEditTask}
        onAddDependency={onAddDependency}
        onRemoveDependency={onRemoveDependency}
        onRemoveTask={onRemoveTask}
        formatDate={formatDate}
        statusLabels={statusLabels}
        showToast={showToast}
      />
    </div>
  )
}
