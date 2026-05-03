import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiBaseUrl, loadHealth } from './apis'
import {
  buildActivity,
  buildMeeting,
  buildReport,
  buildTask,
  createEmptyWorkspace,
  createInviteCode,
  deriveRisks,
  loadWorkspace,
  saveWorkspace,
} from './lib/workspace-store'
import type { HealthSummary, Task, TaskStatus } from './types/shell'
import type { Member, MemberRole, WorkspaceState } from './types/workspace'

type ViewKey = 'home' | 'tasks' | 'meetings' | 'reports' | 'team'

const views: Array<{ key: ViewKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'reports', label: 'Reports' },
  { key: 'team', label: 'Team' },
]

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To do',
  DOING: 'Doing',
  DONE: 'Done',
}

const inputClassName =
  'w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-rust/40 focus:ring-4 focus:ring-rust/8'

const areaClassName = `${inputClassName} min-h-24 resize-y`
const initialWorkspace = loadWorkspace()

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(initialWorkspace)
  const [health, setHealth] = useState<HealthSummary | null>(null)
  const [view, setView] = useState<ViewKey>('home')
  const [setup, setSetup] = useState({
    name: '',
    email: '',
    teamName: '',
    courseName: '',
    semester: '2026-1',
    dueDate: '',
  })
  const [taskForm, setTaskForm] = useState({ title: '', owner: '', dueDate: '', blockers: '' })
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    time: '',
    agenda: '',
    decisions: '',
    actions: '',
    actionOwner: '',
    createTasks: true,
  })
  const [memberForm, setMemberForm] = useState<{ name: string; role: MemberRole }>({
    name: '',
    role: 'MEMBER',
  })
  const [teamForm, setTeamForm] = useState({
    name: initialWorkspace.team.name,
    courseName: initialWorkspace.team.courseName,
    semester: initialWorkspace.team.semester,
    dueDate: initialWorkspace.team.dueDate,
  })

  useEffect(() => {
    void loadHealth().then(setHealth)
  }, [])

  useEffect(() => {
    saveWorkspace(workspace)
  }, [workspace])

  const memberNames = useMemo(() => workspace.members.map((member) => member.name), [workspace.members])
  const defaultOwner = memberNames[0] ?? workspace.user.name

  const tasks = useMemo(() => [...workspace.tasks].sort(compareTasks), [workspace.tasks])
  const grouped = useMemo(
    () => ({
      TODO: tasks.filter((task) => task.status === 'TODO'),
      DOING: tasks.filter((task) => task.status === 'DOING'),
      DONE: tasks.filter((task) => task.status === 'DONE'),
    }),
    [tasks],
  )
  const meetings = useMemo(
    () => [...workspace.meetings].sort((a, b) => normalizeDate(a.time).localeCompare(normalizeDate(b.time))),
    [workspace.meetings],
  )
  const completion = workspace.tasks.length
    ? Math.round((workspace.tasks.filter((task) => task.status === 'DONE').length / workspace.tasks.length) * 100)
    : 0

  const mutateWorkspace = (updater: (current: WorkspaceState) => WorkspaceState) => {
    setWorkspace((current) => withDerived(updater(current)))
  }

  const startWorkspace = () => {
    const name = setup.name.trim()
    const email = setup.email.trim()
    const teamName = setup.teamName.trim()
    const courseName = setup.courseName.trim()
    if (!name || !email || !teamName || !courseName || !setup.dueDate) {
      window.alert('Enter name, email, team, course, and deadline.')
      return
    }
    const leader: Member = { id: createId(), name, role: 'LEADER' }
    setWorkspace(
      withDerived({
        initialized: true,
        user: { name, email },
        team: {
          name: teamName,
          courseName,
          semester: setup.semester || '2026-1',
          dueDate: setup.dueDate,
          inviteCode: createInviteCode(),
        },
        members: [leader],
        tasks: [],
        meetings: [],
        activities: [buildActivity(`${teamName} workspace started.`, name)],
        reports: [],
        risks: [],
      }),
    )
    setTeamForm({
      name: teamName,
      courseName,
      semester: setup.semester || '2026-1',
      dueDate: setup.dueDate,
    })
    setTaskForm({ title: '', owner: name, dueDate: '', blockers: '' })
    setMeetingForm({
      title: '',
      time: '',
      agenda: '',
      decisions: '',
      actions: '',
      actionOwner: name,
      createTasks: true,
    })
  }

  const resetWorkspace = () => {
    if (!window.confirm('Reset local workspace?')) return
    setWorkspace(createEmptyWorkspace())
    setTeamForm({ name: '', courseName: '', semester: '2026-1', dueDate: '' })
    setTaskForm({ title: '', owner: '', dueDate: '', blockers: '' })
    setMeetingForm({
      title: '',
      time: '',
      agenda: '',
      decisions: '',
      actions: '',
      actionOwner: '',
      createTasks: true,
    })
    setView('home')
  }

  const addTask = () => {
    const title = taskForm.title.trim()
    const owner = (taskForm.owner || defaultOwner).trim()
    if (!title || !owner || !taskForm.dueDate) {
      window.alert('Enter task title, owner, and due date.')
      return
    }
    const task = buildTask({
      title,
      owner,
      dueDate: taskForm.dueDate,
      blockers: parseLines(taskForm.blockers),
    })
    mutateWorkspace((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
      activities: [buildActivity(`${task.title} created.`, current.user.name), ...current.activities],
    }))
    setTaskForm({ title: '', owner, dueDate: '', blockers: '' })
  }

  const updateTaskStatus = (taskId: number, status: TaskStatus) => {
    const target = workspace.tasks.find((task) => task.id === taskId)
    if (!target || target.status === status) return
    mutateWorkspace((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
      activities: [buildActivity(`${target.title} moved to ${statusLabels[status]}.`, current.user.name), ...current.activities],
    }))
  }

  const removeTask = (taskId: number) => {
    const target = workspace.tasks.find((task) => task.id === taskId)
    if (!target) return
    mutateWorkspace((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
      activities: [buildActivity(`${target.title} deleted.`, current.user.name), ...current.activities],
    }))
  }

  const addMeeting = () => {
    const title = meetingForm.title.trim()
    const agenda = meetingForm.agenda.trim()
    if (!title || !agenda || !meetingForm.time) {
      window.alert('Enter meeting title, time, and agenda.')
      return
    }
    const actions = parseLines(meetingForm.actions)
    const meeting = buildMeeting({
      title,
      time: meetingForm.time,
      agenda,
      decisions: parseLines(meetingForm.decisions),
      actions,
    })
    const linkedTasks = meetingForm.createTasks
      ? actions.map((action) =>
          buildTask({
            title: action,
            owner: meetingForm.actionOwner || defaultOwner,
            dueDate: addDays(meetingForm.time, 7),
          }),
        )
      : []
    mutateWorkspace((current) => ({
      ...current,
      meetings: [meeting, ...current.meetings],
      tasks: [...linkedTasks, ...current.tasks],
      activities: [
        buildActivity(`${meeting.title} meeting saved.`, current.user.name),
        ...linkedTasks.map((task) => buildActivity(`${task.title} generated from meeting.`, current.user.name)),
        ...current.activities,
      ],
    }))
    setMeetingForm({
      title: '',
      time: '',
      agenda: '',
      decisions: '',
      actions: '',
      actionOwner: meetingForm.actionOwner || defaultOwner,
      createTasks: true,
    })
  }

  const generateReport = () => {
    const report = buildReport(workspace.tasks, workspace.meetings)
    mutateWorkspace((current) => ({
      ...current,
      reports: [report, ...current.reports],
      activities: [buildActivity(`${report.label} refreshed.`, current.user.name), ...current.activities],
    }))
  }

  const saveTeam = () => {
    const name = teamForm.name.trim()
    const courseName = teamForm.courseName.trim()
    if (!name || !courseName || !teamForm.dueDate) {
      window.alert('Enter team name, course name, and deadline.')
      return
    }
    mutateWorkspace((current) => ({
      ...current,
      team: {
        ...current.team,
        name,
        courseName,
        semester: teamForm.semester || current.team.semester,
        dueDate: teamForm.dueDate,
      },
      activities: [buildActivity('Team profile updated.', current.user.name), ...current.activities],
    }))
  }

  const addMember = () => {
    const name = memberForm.name.trim()
    if (!name) {
      window.alert('Enter member name.')
      return
    }
    if (workspace.members.some((member) => member.name === name)) {
      window.alert('This member already exists.')
      return
    }
    const member: Member = { id: createId(), name, role: memberForm.role }
    mutateWorkspace((current) => ({
      ...current,
      members: [...current.members, member],
      activities: [buildActivity(`${name} added to team.`, current.user.name), ...current.activities],
    }))
    setMemberForm({ name: '', role: 'MEMBER' })
  }

  const removeMember = (member: Member) => {
    if (workspace.members.length === 1) {
      window.alert('At least one member must remain.')
      return
    }
    if (workspace.tasks.some((task) => task.owner === member.name && task.status !== 'DONE')) {
      window.alert('Reassign open tasks before removing this member.')
      return
    }
    mutateWorkspace((current) => ({
      ...current,
      members: current.members.filter((item) => item.id !== member.id),
      activities: [buildActivity(`${member.name} removed from team.`, current.user.name), ...current.activities],
    }))
  }

  if (!workspace.initialized) {
    return (
      <div className="min-h-screen px-5 py-6 text-ink sm:px-7 lg:px-10">
        <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_430px]">
          <Section title="A real workspace starts with input" eyebrow="TeamPulse" hero>
            <p className="max-w-xl text-base leading-7 text-black/65 sm:text-lg">
              No fake dashboard first. Create the team, enter the first tasks, and let the workspace build itself from real data.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Mini title="Start">Collect owner, team, course, and deadline first.</Mini>
              <Mini title="Operate">Tasks, meetings, and activity logs stay connected.</Mini>
              <Mini title="Deploy">Vercel + AWS + MySQL posture stays intact.</Mini>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              <Pill tone={health ? 'good' : 'muted'}>{health ? `${health.status} / ${health.storageMode}` : 'API offline'}</Pill>
              <Pill tone="muted">{apiBaseUrl}</Pill>
            </div>
          </Section>

          <Section title="Open a new workspace" eyebrow="Setup">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><input className={inputClassName} value={setup.name} onChange={(e) => setSetup({ ...setup, name: e.target.value })} /></Field>
              <Field label="Email"><input className={inputClassName} type="email" value={setup.email} onChange={(e) => setSetup({ ...setup, email: e.target.value })} /></Field>
              <Field label="Team"><input className={inputClassName} value={setup.teamName} onChange={(e) => setSetup({ ...setup, teamName: e.target.value })} /></Field>
              <Field label="Course"><input className={inputClassName} value={setup.courseName} onChange={(e) => setSetup({ ...setup, courseName: e.target.value })} /></Field>
              <Field label="Semester"><input className={inputClassName} value={setup.semester} onChange={(e) => setSetup({ ...setup, semester: e.target.value })} /></Field>
              <Field label="Deadline"><input className={inputClassName} type="date" value={setup.dueDate} onChange={(e) => setSetup({ ...setup, dueDate: e.target.value })} /></Field>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" className="rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-paper" onClick={startWorkspace}>Create workspace</button>
            </div>
          </Section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-4 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <Section title={`${workspace.user.name}'s workspace`} eyebrow={`${workspace.team.name} / ${workspace.team.courseName}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="good">Backend {health ? health.status : 'Offline'}</Pill>
            <Pill tone="muted">Deadline {formatDate(workspace.team.dueDate)}</Pill>
            <Pill tone="accent">Invite {workspace.team.inviteCode}</Pill>
            <button type="button" className="ml-auto rounded-full border border-black/10 px-4 py-2 text-sm font-semibold" onClick={resetWorkspace}>Reset</button>
          </div>
        </Section>

        <nav className="grid grid-cols-5 gap-2 rounded-[1.5rem] border border-black/8 bg-white/75 p-2">
          {views.map((item) => (
            <button key={item.key} type="button" className={['rounded-[1rem] px-3 py-3 text-sm font-semibold transition', view === item.key ? 'bg-[#fff1de] text-rust' : 'text-black/62'].join(' ')} onClick={() => setView(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>

        {view === 'home' && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)]">
            <Section title="This week" eyebrow="Home">
              {tasks.filter((task) => task.status !== 'DONE').length ? (
                <div className="grid gap-3">
                  {tasks.filter((task) => task.status !== 'DONE').slice(0, 6).map((task) => (
                    <article key={task.id} className="rounded-[1.2rem] border border-black/8 bg-white/80 p-4">
                      <strong className="block">{task.title}</strong>
                      <p className="mt-1 text-sm text-black/58">{task.owner} / {formatDate(task.dueDate)}</p>
                      {task.blockers.length > 0 && <p className="mt-2 text-sm text-rust">Blocker: {task.blockers.join(', ')}</p>}
                    </article>
                  ))}
                </div>
              ) : <Empty>No tasks yet. Add the first task in the Tasks tab.</Empty>}
            </Section>

            <Section title="Workspace status" eyebrow="Summary">
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Tasks" value={String(workspace.tasks.length)} />
                <Stat label="Complete" value={`${completion}%`} />
                <Stat label="Meetings" value={String(workspace.meetings.length)} />
                <Stat label="Risks" value={String(workspace.risks.length)} />
              </div>
            </Section>

            <Section title="Risk signals" eyebrow="Risk">
              {workspace.risks.length ? (
                <div className="grid gap-3">
                  {workspace.risks.map((risk) => (
                    <article key={risk.id} className="rounded-[1.2rem] border border-black/8 bg-white/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong>{risk.title}</strong>
                        <Pill tone={risk.severity === 'CRITICAL' ? 'accent' : risk.severity === 'WARNING' ? 'muted' : 'good'}>{risk.severity}</Pill>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-black/62">{risk.body}</p>
                    </article>
                  ))}
                </div>
              ) : <Empty>No active risks detected yet.</Empty>}
            </Section>

            <Section title="Recent activity" eyebrow="Activity">
              {workspace.activities.length ? (
                <div className="grid gap-3">
                  {workspace.activities.slice(0, 8).map((activity) => (
                    <article key={activity.id} className="border-t border-black/8 pt-3 first:border-t-0 first:pt-0">
                      <strong className="block">{activity.summary}</strong>
                      <p className="mt-1 text-sm text-black/55">{activity.actor} / {activity.at}</p>
                    </article>
                  ))}
                </div>
              ) : <Empty>No activity yet.</Empty>}
            </Section>
          </div>
        )}

        {view === 'tasks' && (
          <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Section title="Quick task" eyebrow="Tasks">
              <div className="grid gap-4">
                <Field label="Title"><input className={inputClassName} value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></Field>
                <Field label="Owner"><select className={inputClassName} value={taskForm.owner || defaultOwner} onChange={(e) => setTaskForm({ ...taskForm, owner: e.target.value })}>{memberNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></Field>
                <Field label="Due date"><input className={inputClassName} type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></Field>
                <Field label="Blockers"><textarea className={areaClassName} value={taskForm.blockers} onChange={(e) => setTaskForm({ ...taskForm, blockers: e.target.value })} placeholder="One per line" /></Field>
                <button type="button" className="rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-paper" onClick={addTask}>Add task</button>
              </div>
            </Section>

            <div className="grid gap-4 lg:grid-cols-3">
              {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((status) => (
                <Section key={status} title={statusLabels[status]} eyebrow={status}>
                  <div className="grid gap-3">
                    {grouped[status].length ? grouped[status].map((task) => (
                      <article key={task.id} className="rounded-[1.2rem] border border-black/8 bg-white/82 p-4">
                        <strong className="block">{task.title}</strong>
                        <p className="mt-1 text-sm text-black/58">{task.owner} / {formatDate(task.dueDate)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((candidate) => (
                            <button key={candidate} type="button" className={['rounded-full px-3 py-1.5 text-xs font-semibold', task.status === candidate ? 'bg-forest text-paper' : 'border border-black/10 text-black/62'].join(' ')} onClick={() => updateTaskStatus(task.id, candidate)}>{statusLabels[candidate]}</button>
                          ))}
                          <button type="button" className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black/62" onClick={() => removeTask(task.id)}>Delete</button>
                        </div>
                      </article>
                    )) : <Empty>No items in this column.</Empty>}
                  </div>
                </Section>
              ))}
            </div>
          </div>
        )}

        {view === 'meetings' && (
          <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Section title="Meeting input" eyebrow="Meetings">
              <div className="grid gap-4">
                <Field label="Title"><input className={inputClassName} value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} /></Field>
                <Field label="Time"><input className={inputClassName} type="datetime-local" value={meetingForm.time} onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })} /></Field>
                <Field label="Agenda"><textarea className={areaClassName} value={meetingForm.agenda} onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })} /></Field>
                <Field label="Decisions"><textarea className={areaClassName} value={meetingForm.decisions} onChange={(e) => setMeetingForm({ ...meetingForm, decisions: e.target.value })} /></Field>
                <Field label="Action items"><textarea className={areaClassName} value={meetingForm.actions} onChange={(e) => setMeetingForm({ ...meetingForm, actions: e.target.value })} /></Field>
                <Field label="Action owner"><select className={inputClassName} value={meetingForm.actionOwner || defaultOwner} onChange={(e) => setMeetingForm({ ...meetingForm, actionOwner: e.target.value })}>{memberNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></Field>
                <label className="flex items-center gap-3 text-sm text-black/64"><input type="checkbox" checked={meetingForm.createTasks} onChange={(e) => setMeetingForm({ ...meetingForm, createTasks: e.target.checked })} />Create tasks from action items</label>
                <button type="button" className="rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-paper" onClick={addMeeting}>Save meeting</button>
              </div>
            </Section>

            <Section title="Meeting log" eyebrow="Log">
              {meetings.length ? (
                <div className="grid gap-4">
                  {meetings.map((meeting) => (
                    <article key={meeting.id} className="rounded-[1.2rem] border border-black/8 bg-white/82 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong>{meeting.title}</strong>
                        <Pill tone="muted">Actions {meeting.actions.length}</Pill>
                      </div>
                      <p className="mt-1 text-sm text-black/55">{formatDate(meeting.time)}</p>
                      <p className="mt-3 text-sm leading-6 text-black/65">{meeting.agenda}</p>
                      {meeting.decisions.length > 0 && <ListBlock title="Decisions" items={meeting.decisions} />}
                      {meeting.actions.length > 0 && <ListBlock title="Action items" items={meeting.actions} />}
                    </article>
                  ))}
                </div>
              ) : <Empty>No meetings yet.</Empty>}
            </Section>
          </div>
        )}

        {view === 'reports' && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <Section title="Report inputs" eyebrow="Reports">
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Done tasks" value={String(workspace.tasks.filter((task) => task.status === 'DONE').length)} />
                <Stat label="Meetings" value={String(workspace.meetings.length)} />
                <Stat label="Activity" value={String(workspace.activities.length)} />
                <Stat label="Risks" value={String(workspace.risks.length)} />
              </div>
            </Section>

            <Section title="Generate draft" eyebrow="Output">
              <button type="button" className="w-full rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-paper" onClick={generateReport}>Refresh report draft</button>
              <div className="mt-4 grid gap-3">
                {workspace.reports.length ? workspace.reports.map((report) => (
                  <article key={report.id} className="rounded-[1.2rem] border border-black/8 bg-white/82 p-4">
                    <strong className="block">{report.label}</strong>
                    <p className="mt-1 text-sm text-black/55">{report.range}</p>
                    <Pill tone={report.status === 'READY' ? 'good' : 'muted'}>{report.status}</Pill>
                  </article>
                )) : <Empty>No generated reports yet.</Empty>}
              </div>
            </Section>
          </div>
        )}

        {view === 'team' && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Section title="Team profile" eyebrow="Team">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Team name"><input className={inputClassName} value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></Field>
                <Field label="Course"><input className={inputClassName} value={teamForm.courseName} onChange={(e) => setTeamForm({ ...teamForm, courseName: e.target.value })} /></Field>
                <Field label="Semester"><input className={inputClassName} value={teamForm.semester} onChange={(e) => setTeamForm({ ...teamForm, semester: e.target.value })} /></Field>
                <Field label="Deadline"><input className={inputClassName} type="date" value={teamForm.dueDate} onChange={(e) => setTeamForm({ ...teamForm, dueDate: e.target.value })} /></Field>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-paper" onClick={saveTeam}>Save team</button>
                <button type="button" className="rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm font-semibold" onClick={() => mutateWorkspace((current) => ({ ...current, team: { ...current.team, inviteCode: createInviteCode() }, activities: [buildActivity('Invite code regenerated.', current.user.name), ...current.activities] }))}>Regenerate invite</button>
              </div>
              <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-paper/72 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-black/45">Invite code</p>
                <strong className="mt-2 block text-2xl tracking-[0.16em]">{workspace.team.inviteCode}</strong>
              </div>
            </Section>

            <Section title="Members" eyebrow="People">
              <div className="grid gap-4">
                <Field label="Name"><input className={inputClassName} value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} /></Field>
                <Field label="Role"><select className={inputClassName} value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as MemberRole })}><option value="MEMBER">Member</option><option value="LEADER">Leader</option></select></Field>
                <button type="button" className="rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-paper" onClick={addMember}>Add member</button>
              </div>
              <div className="mt-4 grid gap-3">
                {workspace.members.map((member) => (
                  <article key={member.id} className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-black/8 bg-white/82 p-4">
                    <div>
                      <strong className="block">{member.name}</strong>
                      <p className="mt-1 text-sm text-black/55">{member.role === 'LEADER' ? 'Leader' : 'Member'}</p>
                    </div>
                    <button type="button" className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black/62" onClick={() => removeMember(member)}>Remove</button>
                  </article>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ eyebrow, title, children, hero = false }: { eyebrow: string; title: string; children: ReactNode; hero?: boolean }) {
  return (
    <section className={['rounded-[1.8rem] border border-black/8 p-6 shadow-[0_18px_40px_rgba(49,45,39,0.06)]', hero ? 'bg-[linear-gradient(135deg,rgba(255,247,232,0.94),rgba(246,235,216,0.9))]' : 'bg-white/76'].join(' ')}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-rust">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-black/72"><span>{label}</span>{children}</label>
}

function Pill({ children, tone }: { children: ReactNode; tone: 'good' | 'muted' | 'accent' }) {
  const className = tone === 'good' ? 'bg-forest/10 text-forest' : tone === 'accent' ? 'bg-rust/10 text-rust' : 'bg-black/6 text-black/65'
  return <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${className}`}>{children}</span>
}

function Mini({ title, children }: { title: string; children: ReactNode }) {
  return <article className="border-t border-black/8 pt-4"><strong className="block">{title}</strong><p className="mt-2 text-sm leading-6 text-black/58">{children}</p></article>
}

function Stat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-[1.2rem] border border-black/8 bg-white/82 p-4"><span className="block text-xs uppercase tracking-[0.18em] text-black/45">{label}</span><strong className="mt-2 block text-3xl tracking-[-0.03em]">{value}</strong></article>
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.2rem] border border-dashed border-black/10 bg-paper/62 p-5 text-sm leading-6 text-black/58">{children}</div>
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return <div className="mt-4 border-t border-black/8 pt-4"><strong className="block text-xs uppercase tracking-[0.18em] text-black/45">{title}</strong><ul className="mt-2 grid gap-2 text-sm leading-6 text-black/64">{items.map((item) => <li key={`${title}-${item}`}>- {item}</li>)}</ul></div>
}

function withDerived(workspace: WorkspaceState): WorkspaceState {
  if (!workspace.initialized) return { ...workspace, risks: [], reports: [] }
  return { ...workspace, risks: deriveRisks(workspace.tasks, workspace.meetings, workspace.members) }
}

function parseLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function compareTasks(a: Task, b: Task) {
  const order: Record<TaskStatus, number> = { TODO: 0, DOING: 1, DONE: 2 }
  const statusGap = order[a.status] - order[b.status]
  if (statusGap !== 0) return statusGap
  return a.dueDate.localeCompare(b.dueDate)
}

function formatDate(value: string) {
  if (!value) return '-'
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}) }).format(date)
}

function addDays(value: string, days: number) {
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return ''
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function normalizeDate(value: string) {
  if (!value) return '9999-99-99T99:99'
  return value.includes('T') ? value : `${value}T00:00`
}

function createId() {
  return Date.now() + Math.floor(Math.random() * 10000)
}

export default App
