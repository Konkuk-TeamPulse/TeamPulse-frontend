import type { Activity, Meeting, Report, RiskSignal, Task } from './shell'

export type MemberRole = 'LEADER' | 'MEMBER'

export type Member = {
  id: number
  name: string
  role: MemberRole
}

export type UserProfile = {
  name: string
  email: string
}

export type TeamProfile = {
  name: string
  courseName: string
  semester: string
  dueDate: string
  inviteCode: string
  inviteUrl?: string
  inviteExpiredAt?: string
}

export type WorkspaceState = {
  initialized: boolean
  user: UserProfile
  team: TeamProfile
  members: Member[]
  tasks: Task[]
  meetings: Meeting[]
  activities: Activity[]
  reports: Report[]
  risks: RiskSignal[]
}
