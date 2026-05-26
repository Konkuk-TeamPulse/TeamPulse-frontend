import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { InvitationInfo, ProjectSummary } from '../../../apis'
import type { ToastType } from '../../../types/navigation'

export type SetupForm = {
  teamName: string
  courseName: string
  semester: string
  dueDate: string
}

export type AuthMode = 'login' | 'signup'

export type AuthForm = {
  loginEmail: string
  password: string
  passwordConfirm: string
  email: string
  name: string
  university: string
  phone: string
}

export type OnboardingProps = {
  onStart: (setup: SetupForm) => void
  onLogin: (input: { email: string; password: string }) => void
  onSignup: (input: {
    email: string
    password: string
    name: string
    university: string
    phone: string
  }) => void
  projects: ProjectSummary[] | null
  invitation: InvitationInfo | null
  onAcceptInvitation: () => void
  onSelectProject: (projectId: number) => void
  onLogout: () => void
  showToast: (msg: string, type?: ToastType) => void
}

export type AuthPanelProps = {
  authMode: AuthMode
  authForm: AuthForm
  projects: ProjectSummary[] | null
  onAuthSubmit: (event: FormEvent<HTMLFormElement>) => void
  onLogout: () => void
  onSelectProject: (projectId: number) => void
  resetSignupForm: () => void
  setAuthForm: Dispatch<SetStateAction<AuthForm>>
  setAuthMode: Dispatch<SetStateAction<AuthMode>>
}

export type WorkspaceSetupPanelProps = {
  setup: SetupForm
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  setSetup: Dispatch<SetStateAction<SetupForm>>
}
