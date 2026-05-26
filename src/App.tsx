import { Layout } from './components/team-pulse/Layout'
import { Onboarding } from './components/team-pulse/onboarding/Onboarding'
import { Toast } from './components/team-pulse/ui/Toast'
import { taskStatusLabels } from './hooks/team-pulse/constants'
import { useTeamPulseWorkspace } from './hooks/team-pulse/useTeamPulseWorkspace'
import { useToast } from './hooks/team-pulse/useToast'
import { formatDate } from './lib/utils'
import { HomePage, MeetingsPage, ReportsPage, TasksPage, TeamPage } from './pages/team-pulse'

export default function TeamPulseApp() {
  const { toast, showToast, closeToast } = useToast()
  const { state, actions } = useTeamPulseWorkspace(showToast)

  if (!state.workspace.initialized) {
    return (
      <>
        <Onboarding
          onStart={actions.startWorkspace}
          onLogin={actions.handleLogin}
          onSignup={actions.handleSignup}
          projects={state.projects}
          invitation={state.invitation}
          onAcceptInvitation={actions.handleAcceptInvitation}
          onSelectProject={actions.openProject}
          onLogout={actions.handleLogout}
          showToast={showToast}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      </>
    )
  }

  return (
    <Layout
      view={state.view}
      setView={actions.setView}
      userName={state.workspace.user.name}
      teamName={state.workspace.team.name}
      courseName={state.workspace.team.courseName}
      onReset={actions.resetWorkspace}
      onLogout={actions.handleLogout}
      onExitProject={actions.exitProject}
      risks={state.workspace.risks}
    >
      <TeamPulsePageContent
        state={state}
        actions={actions}
        showToast={showToast}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </Layout>
  )
}

type TeamPulseState = ReturnType<typeof useTeamPulseWorkspace>['state']
type TeamPulseActions = ReturnType<typeof useTeamPulseWorkspace>['actions']

function TeamPulsePageContent({
  state,
  actions,
  showToast,
}: {
  state: TeamPulseState
  actions: TeamPulseActions
  showToast: ReturnType<typeof useToast>['showToast']
}) {
  if (state.view === 'home') {
    return (
      <HomePage
        workspace={state.workspace}
        tasks={state.tasks}
        completion={state.completion}
        formatDate={formatDate}
        onCreateInviteLink={actions.regenerateInvite}
        showToast={showToast}
      />
    )
  }

  if (state.view === 'tasks') {
    return (
      <TasksPage
        grouped={state.grouped}
        memberNames={state.memberNames}
        defaultOwner={state.defaultOwner}
        onAddTask={actions.addTask}
        tasks={state.tasks}
        onUpdateStatus={actions.updateTaskStatus}
        onEditTask={actions.editTask}
        onAddDependency={actions.addTaskDependency}
        onRemoveDependency={actions.removeTaskDependency}
        onRemoveTask={actions.removeTask}
        formatDate={formatDate}
        statusLabels={taskStatusLabels}
        showToast={showToast}
      />
    )
  }

  if (state.view === 'meetings') {
    return (
      <MeetingsPage
        meetings={state.workspace.meetings}
        memberNames={state.memberNames}
        defaultOwner={state.defaultOwner}
        onAddMeeting={actions.addMeeting}
        onLoadMeetingDetail={actions.loadMeetingDetail}
        formatDate={formatDate}
        showToast={showToast}
      />
    )
  }

  if (state.view === 'reports') {
    return (
      <ReportsPage
        workspace={state.workspace}
        onGenerateReport={actions.generateReport}
        onDownloadReport={actions.downloadReport}
        showToast={showToast}
      />
    )
  }

  return (
    <TeamPage
      workspace={state.workspace}
      onSaveTeam={actions.saveTeam}
      onRemoveMember={actions.removeMember}
      onRegenerateInvite={actions.regenerateInvite}
      showToast={showToast}
    />
  )
}
