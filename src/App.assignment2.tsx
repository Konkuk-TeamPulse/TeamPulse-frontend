import { useEffect, useMemo, useState, useCallback } from 'react'
import { loadHealth } from './lib/api'
import {
  bootstrapAssignmentWorkspace,
  createAssignmentMeeting,
  createAssignmentMember,
  createAssignmentTask,
  deleteAssignmentMember,
  deleteAssignmentTask,
  generateAssignmentReport,
  loadAssignmentSampleWorkspace,
  loadAssignmentWorkspace,
  regenerateAssignmentInviteCode,
  resetAssignmentWorkspace,
  updateAssignmentTaskStatus,
  updateAssignmentTeam,
} from './lib/assignment2-api'
import {
  buildActivity,
  buildMeeting,
  buildReport,
  buildTask,
  createEmptyWorkspace,
  createInviteCode,
  createSampleWorkspace,
  deriveRisks,
  loadWorkspace,
  saveWorkspace,
} from './lib/workspace-store'
import {
  formatDate,
  addDays,
  createId,
  parseLines,
  compareTasks,
} from './lib/utils'
import type { HealthSummary, TaskStatus } from './types/shell'
import type { Member, WorkspaceState } from './types/workspace'

// Components
import { Layout } from './components/assignment2/Layout'
import { Onboarding } from './components/assignment2/Onboarding'
import { HomeView } from './components/assignment2/HomeView'
import { TasksView } from './components/assignment2/TasksView'
import { MeetingsView } from './components/assignment2/MeetingsView'
import { ReportsView } from './components/assignment2/ReportsView'
import { TeamView } from './components/assignment2/TeamView'
import { Toast, type ToastType } from './components/assignment2/Toast'

type ViewKey = 'home' | 'tasks' | 'meetings' | 'reports' | 'team'

const statusLabels: Record<TaskStatus, string> = {
  TODO: '할 일',
  DOING: '진행 중',
  DONE: '완료',
}

const initialWorkspace = loadWorkspace()

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(initialWorkspace)
  const [health, setHealth] = useState<HealthSummary | null>(null)
  const [transport, setTransport] = useState<'api' | 'local'>('local')
  const [view, setView] = useState<ViewKey>('home')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }, [])

  const handleAction = useCallback(async (
    apiAction: () => Promise<WorkspaceState>,
    localAction: () => WorkspaceState,
    successMsg?: string
  ) => {
    try {
      const nextWorkspace = transport === 'api' ? await apiAction() : withDerived(localAction())
      setWorkspace(nextWorkspace)
      if (successMsg) showToast(successMsg, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : '요청에 실패했습니다.'
      showToast(message, 'error')
    }
  }, [transport, showToast])

  useEffect(() => {
    let active = true
    loadHealth().then((s) => active && setHealth(s))
    loadAssignmentWorkspace()
      .then((w) => {
        if (!active) return
        setTransport('api')
        setWorkspace(w)
      })
      .catch(() => active && setTransport('local'))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (transport === 'local') saveWorkspace(workspace)
  }, [transport, workspace])

  const memberNames = useMemo(() => workspace.members.map((m) => m.name), [workspace.members])
  const defaultOwner = memberNames[0] ?? workspace.user.name
  const tasks = useMemo(() => [...workspace.tasks].sort(compareTasks), [workspace.tasks])
  const grouped = useMemo(() => ({
    TODO: tasks.filter((t) => t.status === 'TODO'),
    DOING: tasks.filter((t) => t.status === 'DOING'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  }), [tasks])
  const completion = workspace.tasks.length
    ? Math.round((workspace.tasks.filter((t) => t.status === 'DONE').length / workspace.tasks.length) * 100)
    : 0

  const startWorkspace = (setup: Parameters<typeof bootstrapAssignmentWorkspace>[0]) => {
    handleAction(
      () => bootstrapAssignmentWorkspace(setup),
      () => ({
        ...createEmptyWorkspace(),
        initialized: true,
        user: { name: setup.name, email: setup.email },
        team: {
          name: setup.teamName,
          courseName: setup.courseName,
          semester: setup.semester,
          dueDate: setup.dueDate,
          inviteCode: createInviteCode(),
        },
        members: [{ id: createId(), name: setup.name, role: 'LEADER' }],
        activities: [buildActivity(`${setup.teamName} 워크스페이스가 시작되었습니다.`, setup.name)],
      }),
      '워크스페이스가 생성되었습니다.'
    )
  }

  const loadSample = () => {
    handleAction(
      () => loadAssignmentSampleWorkspace(),
      () => createSampleWorkspace(),
      '샘플 데이터가 로드되었습니다.'
    )
  }

  const resetWorkspace = () => {
    if (!window.confirm('워크스페이스를 초기화하시겠습니까?')) return
    handleAction(
      () => resetAssignmentWorkspace(),
      () => createEmptyWorkspace(),
      '워크스페이스가 초기화되었습니다.'
    )
    setView('home')
  }

  const addTask = (form: { title: string; owner: string; dueDate: string; blockers: string }) => {
    handleAction(
      () => createAssignmentTask({ ...form, blockers: parseLines(form.blockers) }),
      () => {
        const task = buildTask({ ...form, blockers: parseLines(form.blockers) })
        return {
          ...workspace,
          tasks: [task, ...workspace.tasks],
          activities: [buildActivity(`${task.title} 항목이 생성되었습니다.`, workspace.user.name), ...workspace.activities],
        }
      }
    )
  }

  const updateTaskStatus = (taskId: number, status: TaskStatus) => {
    handleAction(
      () => updateAssignmentTaskStatus(taskId, status),
      () => ({
        ...workspace,
        tasks: workspace.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        activities: [
          buildActivity(
            `${workspace.tasks.find((t) => t.id === taskId)?.title} 상태가 ${statusLabels[status]}로 변경되었습니다.`,
            workspace.user.name
          ),
          ...workspace.activities,
        ],
      })
    )
  }

  const removeTask = (taskId: number) => {
    handleAction(
      () => deleteAssignmentTask(taskId),
      () => ({
        ...workspace,
        tasks: workspace.tasks.filter((t) => t.id !== taskId),
        activities: [
          buildActivity(
            `${workspace.tasks.find((t) => t.id === taskId)?.title} 항목이 삭제되었습니다.`,
            workspace.user.name
          ),
          ...workspace.activities,
        ],
      })
    )
  }

  const addMeeting = (form: {
    title: string
    time: string
    agenda: string
    decisions: string
    actions: string
    actionOwner: string
    createTasks: boolean
  }) => {
    handleAction(
      () => createAssignmentMeeting({
        ...form,
        decisions: parseLines(form.decisions),
        actions: parseLines(form.actions),
      }),
      () => {
        const meeting = buildMeeting({
          ...form,
          decisions: parseLines(form.decisions),
          actions: parseLines(form.actions),
        })
        const linkedTasks = form.createTasks
          ? meeting.actions.map((a) => buildTask({ title: a, owner: form.actionOwner, dueDate: addDays(form.time, 7) }))
          : []
        return {
          ...workspace,
          meetings: [meeting, ...workspace.meetings],
          tasks: [...linkedTasks, ...workspace.tasks],
          activities: [
            buildActivity(`${meeting.title} 회의가 기록되었습니다.`, workspace.user.name),
            ...linkedTasks.map((t) => buildActivity(`${t.title} 항목이 회의를 통해 생성되었습니다.`, workspace.user.name)),
            ...workspace.activities,
          ],
        }
      }
    )
  }

  const generateReport = () => {
    handleAction(
      () => generateAssignmentReport(),
      () => {
        const report = buildReport(workspace.tasks, workspace.meetings)
        return {
          ...workspace,
          reports: [report, ...workspace.reports],
          activities: [buildActivity(`${report.label} 리포트가 생성되었습니다.`, workspace.user.name), ...workspace.activities],
        }
      }
    )
  }

  const saveTeam = (team: { name: string; courseName: string; semester: string; dueDate: string }) => {
    handleAction(
      () => updateAssignmentTeam(team),
      () => ({
        ...workspace,
        team: { ...workspace.team, ...team },
        activities: [buildActivity('팀 정보가 업데이트되었습니다.', workspace.user.name), ...workspace.activities],
      })
    )
  }

  const addMember = (m: { name: string; role: Member['role'] }) => {
    handleAction(
      () => createAssignmentMember(m),
      () => ({
        ...workspace,
        members: [...workspace.members, { id: createId(), ...m }],
        activities: [buildActivity(`${m.name}님이 팀에 합류했습니다.`, workspace.user.name), ...workspace.activities],
      })
    )
  }

  const removeMember = (m: Member) => {
    if (workspace.members.length === 1) return showToast('최소 한 명의 팀원은 있어야 합니다.', 'error')
    if (workspace.tasks.some((t) => t.owner === m.name && t.status !== 'DONE')) {
      return showToast('완료되지 않은 할 일이 있는 팀원은 제외할 수 없습니다.', 'error')
    }
    handleAction(
      () => deleteAssignmentMember(m.id),
      () => ({
        ...workspace,
        members: workspace.members.filter((item) => item.id !== m.id),
        activities: [buildActivity(`${m.name}님이 팀에서 제외되었습니다.`, workspace.user.name), ...workspace.activities],
      }),
      '팀원이 제외되었습니다.'
    )
  }

  const regenerateInvite = () => {
    handleAction(
      () => regenerateAssignmentInviteCode(),
      () => ({
        ...workspace,
        team: { ...workspace.team, inviteCode: createInviteCode() },
        activities: [buildActivity('초대 코드가 재생성되었습니다.', workspace.user.name), ...workspace.activities],
      })
    )
  }

  if (!workspace.initialized) {
    return (
      <>
        <Onboarding 
          onStart={startWorkspace}
          onLoadSample={loadSample}
          healthStatus={health?.status}
          transport={transport}
          apiBaseUrl={'/api'}
          showToast={showToast}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    )
  }

  return (
    <Layout
      view={view}
      setView={setView}
      userName={workspace.user.name}
      teamName={workspace.team.name}
      courseName={workspace.team.courseName}
      onReset={resetWorkspace}
      healthStatus={health?.status}
      transport={transport}
    >
      {view === 'home' && <HomeView workspace={workspace} tasks={tasks} completion={completion} formatDate={formatDate} />}
      {view === 'tasks' && (
        <TasksView 
          grouped={grouped}
          memberNames={memberNames}
          defaultOwner={defaultOwner}
          onAddTask={addTask}
          onUpdateStatus={updateTaskStatus}
          onRemoveTask={removeTask}
          formatDate={formatDate}
          statusLabels={statusLabels}
          showToast={showToast}
        />
      )}
      {view === 'meetings' && (
        <MeetingsView 
          meetings={workspace.meetings}
          memberNames={memberNames}
          defaultOwner={defaultOwner}
          onAddMeeting={addMeeting}
          formatDate={formatDate}
          showToast={showToast}
        />
      )}
      {view === 'reports' && <ReportsView workspace={workspace} onGenerateReport={generateReport} showToast={showToast} />}
      {view === 'team' && (
        <TeamView 
          workspace={workspace}
          onSaveTeam={saveTeam}
          onAddMember={addMember}
          onRemoveMember={removeMember}
          onRegenerateInvite={regenerateInvite}
          showToast={showToast}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}

function withDerived(workspace: WorkspaceState): WorkspaceState {
  if (!workspace.initialized) return { ...workspace, risks: [], reports: [] }
  return { ...workspace, risks: deriveRisks(workspace.tasks, workspace.meetings, workspace.members) }
}

export default App
