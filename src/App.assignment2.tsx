import { useEffect, useMemo, useState, useCallback } from 'react'
import { login, logout, signup } from './apis'
import {
  addAssignmentTaskDependency,
  acceptAssignmentInvitation,
  bootstrapAssignmentWorkspace,
  createAssignmentMeeting,
  createAssignmentTask,
  deleteAssignmentMember,
  deleteAssignmentTask,
  downloadAssignmentReport,
  generateAssignmentReport,
  loadAssignmentMeetingDetail,
  loadAssignmentSampleWorkspace,
  loadAssignmentWorkspace,
  refreshAssignmentRisks,
  removeAssignmentTaskDependency,
  regenerateAssignmentInviteCode,
  resetAssignmentWorkspace,
  updateAssignmentTask,
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
import type { TaskStatus } from './types/shell'
import type { Member, WorkspaceState } from './types/workspace'

import { Layout } from './components/assignment2/Layout'
import { Onboarding } from './components/assignment2/Onboarding'
import { Toast, type ToastType } from './components/assignment2/Toast'
import { HomePage, MeetingsPage, ReportsPage, TasksPage, TeamPage } from './pages/assignment2'

type ViewKey = 'home' | 'tasks' | 'meetings' | 'reports' | 'team'

const statusLabels: Record<TaskStatus, string> = {
  TODO: '할 일',
  DOING: '진행 중',
  DONE: '완료',
}

const initialWorkspace = loadWorkspace()

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(initialWorkspace)
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
    loadAssignmentWorkspace()
      .then((w) => w.initialized ? refreshAssignmentRisks(w).catch(() => w) : w)
      .then((w) => {
        if (!active) return
        setTransport('api')
        setWorkspace(w)
        const urgentRisk = w.risks.find((risk) => risk.severity !== 'INFO')
        if (urgentRisk) {
          showToast(`리스크 알림: ${urgentRisk.title}`, urgentRisk.severity === 'CRITICAL' ? 'error' : 'info')
        }
      })
      .catch(() => active && setTransport('local'))
    return () => { active = false }
  }, [showToast])

  useEffect(() => {
    const inviteCode = window.location.pathname.match(/^\/invite\/([^/]+)/)?.[1]
    if (!inviteCode) return

    if (transport !== 'api') {
      const timer = window.setTimeout(() => showToast('초대 수락은 로그인 후 사용할 수 있습니다.', 'info'), 0)
      return () => window.clearTimeout(timer)
    }

    acceptAssignmentInvitation(inviteCode)
      .then((nextWorkspace) => {
        setWorkspace(nextWorkspace)
        setView('home')
        window.history.replaceState(null, '', '/')
        showToast('초대를 수락했습니다.', 'success')
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : '초대 수락에 실패했습니다.'
        showToast(message, 'error')
      })
  }, [transport, showToast])

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
          inviteUrl: '',
        },
        members: [{ id: createId(), name: setup.name, role: 'LEADER' }],
        activities: [buildActivity(`${setup.teamName} 워크스페이스가 시작되었습니다.`, setup.name)],
      }),
      '워크스페이스가 생성되었습니다.'
    )
  }

  const handleLogin = (input: Parameters<typeof login>[0]) => {
    handleAction(
      async () => {
        await login(input)
        setTransport('api')
        return loadAssignmentWorkspace()
      },
      () => workspace,
      '로그인되었습니다.'
    )
  }

  const handleSignup = (input: Parameters<typeof signup>[0]) => {
    handleAction(
      async () => {
        const user = await signup(input)
        setTransport('api')
        try {
          return await loadAssignmentWorkspace()
        } catch {
          return {
            ...createEmptyWorkspace(),
            initialized: false,
            user: {
              name: user.name ?? input.name,
              email: user.email,
            },
          }
        }
      },
      () => workspace,
      '회원가입되었습니다.'
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

  const handleLogout = async () => {
    if (!window.confirm('로그아웃하시겠습니까?')) return

    if (transport === 'api') {
      try {
        await logout()
      } catch {
        // 토큰 만료 등으로 서버 로그아웃이 실패해도 로컬 세션은 정리합니다.
      }
    }

    const empty = createEmptyWorkspace()
    setTransport('local')
    setWorkspace(empty)
    saveWorkspace(empty)
    setView('home')
    showToast('로그아웃되었습니다.', 'success')
  }

  const addTask = (form: { title: string; owner: string; dueDate: string; blockers: string; precedingTaskId?: number }) => {
    handleAction(
      () => createAssignmentTask({ ...form, blockers: parseLines(form.blockers) }),
      () => {
        const precedingTask = workspace.tasks.find((item) => item.id === form.precedingTaskId)
        const blockers = precedingTask ? [precedingTask.title] : parseLines(form.blockers)
        const task = buildTask({ ...form, blockers })
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

  const editTask = (taskId: number, input: { title: string; owner: string; dueDate: string }) => {
    handleAction(
      () => updateAssignmentTask({ taskId, ...input }),
      () => ({
        ...workspace,
        tasks: workspace.tasks.map((task) => task.id === taskId ? {
          ...task,
          title: input.title,
          owner: input.owner,
          dueDate: input.dueDate,
        } : task),
        activities: [buildActivity(`${input.title} 업무가 수정되었습니다.`, workspace.user.name), ...workspace.activities],
      }),
      '업무가 수정되었습니다.'
    )
  }

  const addTaskDependency = (taskId: number, precedingTaskId: number) => {
    if (taskId === precedingTaskId) {
      showToast('자기 자신을 선행 업무로 설정할 수 없습니다.', 'error')
      return
    }

    handleAction(
      () => addAssignmentTaskDependency(taskId, precedingTaskId),
      () => {
        const precedingTask = workspace.tasks.find((task) => task.id === precedingTaskId)
        if (!precedingTask) return workspace

        return {
          ...workspace,
          tasks: workspace.tasks.map((task) => task.id === taskId ? {
            ...task,
            blockers: Array.from(new Set([...task.blockers, precedingTask.title])),
          } : task),
          activities: [buildActivity(`${workspace.tasks.find((task) => task.id === taskId)?.title}에 선행 업무가 추가되었습니다.`, workspace.user.name), ...workspace.activities],
        }
      },
      '선행 업무가 추가되었습니다.'
    )
  }

  const removeTaskDependency = (taskId: number, dependencyId: number) => {
    handleAction(
      () => removeAssignmentTaskDependency(taskId, dependencyId),
      () => {
        const dependencyTask = workspace.tasks.find((task) => task.id === dependencyId)
        if (!dependencyTask) return workspace

        return {
          ...workspace,
          tasks: workspace.tasks.map((task) => task.id === taskId ? {
            ...task,
            blockers: task.blockers.filter((blocker) => blocker !== dependencyTask.title),
          } : task),
          activities: [buildActivity('선행 업무가 삭제되었습니다.', workspace.user.name), ...workspace.activities],
        }
      },
      '선행 업무가 삭제되었습니다.'
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

  const loadMeetingDetail = async (meetingId: number) => {
    try {
      const detail = await loadAssignmentMeetingDetail(meetingId)
      setWorkspace((current) => ({
        ...current,
        meetings: current.meetings.map((meeting) => meeting.id === meetingId ? detail : meeting),
      }))
      showToast('회의록 상세를 불러왔습니다.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : '회의록 상세 조회에 실패했습니다.'
      showToast(message, 'error')
    }
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
      },
      '리포트가 생성되었습니다.'
    )
  }

  const downloadReport = async (reportId: number) => {
    if (transport !== 'api') {
      showToast('PDF 다운로드는 서버 연결 상태에서 사용할 수 있습니다.', 'error')
      return
    }

    try {
      const blob = await downloadAssignmentReport(reportId)
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
      () => {
        const inviteCode = createInviteCode()
        return {
          ...workspace,
          team: {
            ...workspace.team,
            inviteCode,
            inviteUrl: `${window.location.origin}/invite/${inviteCode}`,
          },
          activities: [buildActivity('초대 링크가 생성되었습니다.', workspace.user.name), ...workspace.activities],
        }
      },
      '초대 링크가 생성되었습니다.'
    )
  }

  if (!workspace.initialized) {
    return (
      <>
        <Onboarding 
          onStart={startWorkspace}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onLoadSample={loadSample}
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
      onLogout={handleLogout}
      risks={workspace.risks}
    >
      {view === 'home' && (
        <HomePage
          workspace={workspace}
          tasks={tasks}
          completion={completion}
          formatDate={formatDate}
          onCreateInviteLink={regenerateInvite}
        />
      )}
      {view === 'tasks' && (
        <TasksPage 
          grouped={grouped}
          memberNames={memberNames}
          defaultOwner={defaultOwner}
          onAddTask={addTask}
          tasks={tasks}
          onUpdateStatus={updateTaskStatus}
          onEditTask={editTask}
          onAddDependency={addTaskDependency}
          onRemoveDependency={removeTaskDependency}
          onRemoveTask={removeTask}
          formatDate={formatDate}
          statusLabels={statusLabels}
          showToast={showToast}
        />
      )}
      {view === 'meetings' && (
        <MeetingsPage 
          meetings={workspace.meetings}
          memberNames={memberNames}
          defaultOwner={defaultOwner}
          onAddMeeting={addMeeting}
          onLoadMeetingDetail={loadMeetingDetail}
          formatDate={formatDate}
          showToast={showToast}
        />
      )}
      {view === 'reports' && (
        <ReportsPage
          workspace={workspace}
          onGenerateReport={generateReport}
          onDownloadReport={downloadReport}
          showToast={showToast}
        />
      )}
      {view === 'team' && (
        <TeamPage 
          workspace={workspace}
          onSaveTeam={saveTeam}
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
