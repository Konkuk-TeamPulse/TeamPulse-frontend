import { useEffect, useMemo, useState, useCallback } from 'react'
import { ApiRequestError, clearAuthTokens, hasAccessToken, login, logout, signup } from './apis'
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
  listAssignmentProjects,
  loadInvitationInfo,
  loadAssignmentProject,
  loadAssignmentMeetingDetail,
  removeAssignmentTaskDependency,
  regenerateAssignmentInviteCode,
  resetAssignmentWorkspace,
  updateAssignmentTask,
  updateAssignmentTaskStatus,
  updateAssignmentTeam,
} from './lib/assignment2-api'
import {
  createEmptyWorkspace,
} from './lib/workspace-store'
import {
  formatDate,
  parseLines,
  compareTasks,
} from './lib/utils'
import type { TaskStatus } from './types/shell'
import type { Member, WorkspaceState } from './types/workspace'
import type { InvitationInfo, ProjectSummary } from './apis'

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

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(createEmptyWorkspace())
  const [transport, setTransport] = useState<'api' | 'offline'>('offline')
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null)
  const [view, setView] = useState<ViewKey>('home')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }, [])

  const handleAction = useCallback(async (
    apiAction: () => Promise<WorkspaceState>,
    successMsg?: string
  ) => {
    try {
      const nextWorkspace = await apiAction()
      setTransport('api')
      setWorkspace(nextWorkspace)
      if (successMsg) showToast(successMsg, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : '요청에 실패했습니다.'
      showToast(message, 'error')
    }
  }, [showToast])

  useEffect(() => {
    let active = true
    listAssignmentProjects()
      .then((nextProjects) => {
        if (!active) return
        setTransport('api')
        setProjects(nextProjects)
        setWorkspace(createEmptyWorkspace())
      })
      .catch((error) => {
        if (!active) return
        if (error instanceof ApiRequestError && error.status === 401) {
          clearAuthTokens()
          setProjects(null)
        }
        setTransport('offline')
      })
    return () => { active = false }
  }, [showToast])

  useEffect(() => {
    const inviteCode = window.location.pathname.match(/^\/invite\/([^/]+)/)?.[1]
    if (!inviteCode) return

    let active = true
    loadInvitationInfo(inviteCode)
      .then((info) => {
        if (!active) return
        setInvitation(info)
      })
      .catch((error) => {
        if (!active) return
        const message = error instanceof Error ? error.message : '초대 수락에 실패했습니다.'
        showToast(message, 'error')
      })
    return () => { active = false }
  }, [showToast])

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
      '워크스페이스가 생성되었습니다.'
    )
  }

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    if (!hasAccessToken()) {
      setPendingInviteCode(invitation.inviteCode)
      showToast('초대 수락을 위해 먼저 로그인하거나 회원가입해주세요.', 'info')
      return
    }

    try {
      const nextWorkspace = await acceptAssignmentInvitation(invitation.inviteCode)
      setWorkspace(nextWorkspace)
      setTransport('api')
      setProjects(null)
      setInvitation(null)
      setPendingInviteCode(null)
      setView('home')
      window.history.replaceState(null, '', '/')
      showToast('초대를 수락했습니다.', 'success')
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        clearAuthTokens()
        setProjects(null)
        setPendingInviteCode(invitation.inviteCode)
        showToast('로그인이 필요합니다. 로그인 후 초대 수락을 다시 진행합니다.', 'info')
        return
      }

      const message = error instanceof Error ? error.message : '초대 수락에 실패했습니다.'
      showToast(message, 'error')
    }
  }

  const handleLogin = (input: Parameters<typeof login>[0]) => {
    handleAction(
      async () => {
        await login(input)
        setTransport('api')
        const inviteCode = pendingInviteCode ?? invitation?.inviteCode

        if (inviteCode) {
          const nextWorkspace = await acceptAssignmentInvitation(inviteCode)
          setProjects(null)
          setPendingInviteCode(null)
          setInvitation(null)
          window.history.replaceState(null, '', '/')
          return nextWorkspace
        }

        const nextProjects = await listAssignmentProjects()
        setProjects(nextProjects)
        return {
          ...createEmptyWorkspace(),
          initialized: false,
          user: {
            name: input.email,
            email: input.email,
          },
        }
      },
      pendingInviteCode ?? invitation?.inviteCode ? '로그인 후 초대를 수락했습니다.' : '로그인되었습니다.'
    )
  }

  const openProject = (projectId: number) => {
    handleAction(
      () => loadAssignmentProject(projectId),
      '프로젝트를 불러왔습니다.'
    )
  }

  const exitProject = async () => {
    try {
      const nextProjects = await listAssignmentProjects()
      setProjects(nextProjects)
      setWorkspace(createEmptyWorkspace())
      setTransport('api')
      setView('home')
      showToast('프로젝트 목록으로 돌아왔습니다.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : '프로젝트 목록을 불러오지 못했습니다.'
      showToast(message, 'error')
    }
  }

  const handleSignup = (input: Parameters<typeof signup>[0]) => {
    handleAction(
      async () => {
        const user = await signup(input)
        setTransport('api')
        const inviteCode = pendingInviteCode ?? invitation?.inviteCode

        if (inviteCode) {
          const nextWorkspace = await acceptAssignmentInvitation(inviteCode)
          setProjects(null)
          setPendingInviteCode(null)
          setInvitation(null)
          window.history.replaceState(null, '', '/')
          return nextWorkspace
        }

        const nextProjects = await listAssignmentProjects()
        setProjects(nextProjects)
        return {
          ...createEmptyWorkspace(),
          initialized: false,
          user: {
            name: user.name ?? input.name,
            email: user.email,
          },
        }
      },
      pendingInviteCode ?? invitation?.inviteCode ? '회원가입 후 초대를 수락했습니다.' : '회원가입되었습니다.'
    )
  }

  const resetWorkspace = () => {
    if (!window.confirm('워크스페이스를 초기화하시겠습니까?')) return
    handleAction(
      () => resetAssignmentWorkspace(),
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
    setTransport('offline')
    setProjects(null)
    setWorkspace(empty)
    setView('home')
    showToast('로그아웃되었습니다.', 'success')
  }

  const addTask = (form: { title: string; owner: string; dueDate: string; blockers: string; precedingTaskId?: number }) => {
    handleAction(
      () => createAssignmentTask({ ...form, blockers: parseLines(form.blockers) }),
    )
  }

  const updateTaskStatus = (taskId: number, status: TaskStatus) => {
    handleAction(
      () => updateAssignmentTaskStatus(taskId, status),
    )
  }

  const editTask = (taskId: number, input: { title: string; owner: string; dueDate: string }) => {
    handleAction(
      () => updateAssignmentTask({ taskId, ...input }),
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
      '선행 업무가 추가되었습니다.'
    )
  }

  const removeTaskDependency = (taskId: number, dependencyId: number) => {
    handleAction(
      () => removeAssignmentTaskDependency(taskId, dependencyId),
      '선행 업무가 삭제되었습니다.'
    )
  }

  const removeTask = (taskId: number) => {
    handleAction(
      () => deleteAssignmentTask(taskId),
    )
  }

  const addMeeting = (form: {
    title: string
    time: string
    agenda: string
    attendees: string[]
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
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : '회의록 상세 조회에 실패했습니다.'
      showToast(message, 'error')
      return false
    }
  }

  const generateReport = () => {
    handleAction(
      () => generateAssignmentReport(),
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
    )
  }

  const removeMember = (m: Member) => {
    const currentMember = workspace.members.find((member) => member.name === workspace.user.name)
    if (currentMember?.role !== 'LEADER') return showToast('팀장만 팀원을 내보낼 수 있습니다.', 'error')
    if (m.name === workspace.user.name) return showToast('자기 자신은 내보낼 수 없습니다.', 'error')
    if (workspace.members.length === 1) return showToast('최소 한 명의 팀원은 있어야 합니다.', 'error')
    if (workspace.tasks.some((t) => t.owner === m.name && t.status !== 'DONE')) {
      return showToast('완료되지 않은 할 일이 있는 팀원은 제외할 수 없습니다.', 'error')
    }
    handleAction(
      () => deleteAssignmentMember(m.id),
      '팀원이 제외되었습니다.'
    )
  }

  const regenerateInvite = () => {
    handleAction(
      () => regenerateAssignmentInviteCode(),
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
          projects={projects}
          invitation={invitation}
          onAcceptInvitation={handleAcceptInvitation}
          onSelectProject={openProject}
          onLogout={handleLogout}
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
      onExitProject={exitProject}
      risks={workspace.risks}
    >
      {view === 'home' && (
        <HomePage
          workspace={workspace}
          tasks={tasks}
          completion={completion}
          formatDate={formatDate}
          onCreateInviteLink={regenerateInvite}
          showToast={showToast}
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

export default App
