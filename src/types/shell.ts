export type ViewKey = 'dashboard' | 'board' | 'meetings' | 'activity' | 'reports'

export type TaskStatus = 'TODO' | 'DOING' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type RiskSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type ReportStatus = 'READY' | 'GENERATING' | 'FAILED'

export type Milestone = {
  date: string
  label: string
}

export type DeploymentTarget = {
  frontend: string
  backend: string
  database: string
}

export type ShellMeta = {
  teamName: string
  workspaceName: string
  currentPhase: string
  deadline: string
  stack: string[]
  deployment: DeploymentTarget
}

export type Task = {
  id: number
  title: string
  owner: string
  status: TaskStatus
  dueDate: string
  priority: TaskPriority
  blockers: string[]
  next: string[]
  note: string
}

export type RiskSignal = {
  id: number
  severity: RiskSeverity
  title: string
  body: string
  action: string
}

export type Meeting = {
  id: number
  title: string
  time: string
  agenda: string
  decisions: string[]
  actions: string[]
}

export type Activity = {
  id: number
  actor: string
  at: string
  summary: string
}

export type Report = {
  id: number
  label: string
  range: string
  status: ReportStatus
}

export type ShellData = {
  meta: ShellMeta
  milestones: Milestone[]
  tasks: Task[]
  riskSignals: RiskSignal[]
  meetings: Meeting[]
  activities: Activity[]
  reports: Report[]
}

export type HealthSummary = {
  status: string
  service: string
  currentPhase: string
  storageMode: string
  deploymentTarget: DeploymentTarget
  publicApi: boolean
}
