import { memberApi, taskApi } from '..'
import type { TaskStatus } from '../../types/shell'
import { getActiveProjectId } from './active-project'
import { findMemberById } from './helpers'
import { loadWorkspaceByProject } from './workspace-api'

export async function createTeamPulseTask(input: {
  title: string
  ownerId: number
  dueDate: string
  blockers: string[]
  precedingTaskId?: number
}) {
  const activeProjectId = getActiveProjectId()
  const members = await memberApi.list(activeProjectId)
  const assignee = findMemberById(members, input.ownerId)

  const created = await taskApi.create(activeProjectId, {
    title: input.title,
    description: input.blockers.length ? `Blockers: ${input.blockers.join(', ')}` : undefined,
    assigneeId: assignee.memberId,
    assigneeEmail: assignee.email,
    dueDate: input.dueDate,
  })

  if (input.precedingTaskId && input.precedingTaskId !== created.taskId) {
    await taskApi.addDependency(created.taskId, input.precedingTaskId)
  }

  const workspace = await loadWorkspaceByProject(activeProjectId)
  const precedingTask = workspace.tasks.find((task) => task.id === input.precedingTaskId)

  if (!precedingTask) return workspace

  return {
    ...workspace,
    tasks: workspace.tasks.map((task) => task.id === created.taskId ? {
      ...task,
      blockers: [precedingTask.title],
    } : task),
  }
}

export async function updateTeamPulseTaskStatus(taskId: number, status: TaskStatus) {
  await taskApi.updateStatus(taskId, status)
  return loadWorkspaceByProject(getActiveProjectId())
}

export async function updateTeamPulseTask(input: {
  taskId: number
  title?: string
  ownerId?: number
  dueDate?: string
}) {
  const activeProjectId = getActiveProjectId()
  const members = input.ownerId ? await memberApi.list(activeProjectId) : []
  const assignee = input.ownerId ? findMemberById(members, input.ownerId) : undefined

  await taskApi.update(input.taskId, {
    title: input.title,
    assigneeId: assignee?.memberId,
    dueDate: input.dueDate,
  })

  return loadWorkspaceByProject(activeProjectId)
}

export async function addTeamPulseTaskDependency(taskId: number, precedingTaskId: number) {
  await taskApi.addDependency(taskId, precedingTaskId)
  const workspace = await loadWorkspaceByProject(getActiveProjectId())
  const precedingTask = workspace.tasks.find((task) => task.id === precedingTaskId)

  if (!precedingTask) return workspace

  return {
    ...workspace,
    tasks: workspace.tasks.map((task) => task.id === taskId ? {
      ...task,
      blockers: Array.from(new Set([...task.blockers, precedingTask.title])),
    } : task),
  }
}

export async function removeTeamPulseTaskDependency(taskId: number, dependencyId: number) {
  await taskApi.removeDependency(taskId, dependencyId)
  const workspace = await loadWorkspaceByProject(getActiveProjectId())
  const dependencyTask = workspace.tasks.find((task) => task.id === dependencyId)

  if (!dependencyTask) return workspace

  return {
    ...workspace,
    tasks: workspace.tasks.map((task) => task.id === taskId ? {
      ...task,
      blockers: task.blockers.filter((blocker) => blocker !== dependencyTask.title),
    } : task),
  }
}

export async function deleteTeamPulseTask(taskId: number) {
  await taskApi.remove(taskId)
  return loadWorkspaceByProject(getActiveProjectId())
}
