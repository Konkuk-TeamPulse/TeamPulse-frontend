import { useState, type FormEvent } from 'react'
import { validateEmail } from '../../../lib/utils'
import { AuthPanel } from './AuthPanel'
import { BrandPanel } from './BrandPanel'
import { InvitationPanel } from './InvitationPanel'
import type { AuthForm, AuthMode, OnboardingProps, SetupForm } from './types'
import { WorkspaceSetupPanel } from './WorkspaceSetupPanel'

const initialSetup: SetupForm = {
  teamName: '',
  courseName: '',
  semester: '2026-1',
  dueDate: '',
}

const initialAuthForm: AuthForm = {
  loginEmail: '',
  password: '',
  passwordConfirm: '',
  email: '',
  name: '',
  university: '',
  phone: '',
}

export function Onboarding({
  onStart,
  onLogin,
  onSignup,
  projects,
  invitation,
  onAcceptInvitation,
  onSelectProject,
  onLogout,
  showToast,
}: OnboardingProps) {
  const [setup, setSetup] = useState(initialSetup)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authForm, setAuthForm] = useState(initialAuthForm)

  const resetSignupForm = () => {
    setAuthForm((current) => ({
      ...current,
      password: '',
      passwordConfirm: '',
      email: '',
      name: '',
      university: '',
      phone: '',
    }))
  }

  const handleStartSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!setup.teamName.trim()) return showToast('팀 이름을 입력해주세요.', 'error')
    if (!setup.courseName.trim()) return showToast('과목명을 입력해주세요.', 'error')
    if (!setup.dueDate) return showToast('최종 마감일을 선택해주세요.', 'error')

    onStart(setup)
  }

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (authMode === 'login') {
      if (!authForm.loginEmail.trim()) return showToast('이메일을 입력해주세요.', 'error')
      if (!authForm.password) return showToast('비밀번호를 입력해주세요.', 'error')

      onLogin({
        email: authForm.loginEmail,
        password: authForm.password,
      })
      return
    }

    if (!authForm.name.trim()) return showToast('이름을 입력해주세요.', 'error')
    if (!authForm.email.trim()) return showToast('이메일을 입력해주세요.', 'error')
    if (!validateEmail(authForm.email)) return showToast('유효한 이메일 형식이 아닙니다.', 'error')
    if (!authForm.password) return showToast('비밀번호를 입력해주세요.', 'error')
    if (!authForm.passwordConfirm) return showToast('비밀번호를 한 번 더 입력해주세요.', 'error')
    if (authForm.password !== authForm.passwordConfirm) return showToast('비밀번호가 일치하지 않습니다.', 'error')
    if (!authForm.university.trim()) return showToast('학교 이름을 입력해주세요.', 'error')
    if (!authForm.phone.trim()) return showToast('전화번호를 입력해주세요.', 'error')

    onSignup({
      email: authForm.email,
      password: authForm.password,
      name: authForm.name,
      university: authForm.university,
      phone: authForm.phone,
    })
  }

  return (
    <div className="min-h-screen bg-paper px-5 py-6 text-ink sm:px-7 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <BrandPanel />

        <div className="flex flex-col justify-center gap-6">
          {invitation && (
            <InvitationPanel
              invitation={invitation}
              onAcceptInvitation={onAcceptInvitation}
            />
          )}

          <AuthPanel
            authMode={authMode}
            authForm={authForm}
            projects={projects}
            onAuthSubmit={handleAuthSubmit}
            onLogout={onLogout}
            onSelectProject={onSelectProject}
            resetSignupForm={resetSignupForm}
            setAuthForm={setAuthForm}
            setAuthMode={setAuthMode}
          />

          {projects && (
            <WorkspaceSetupPanel
              setup={setup}
              onSubmit={handleStartSubmit}
              setSetup={setSetup}
            />
          )}
        </div>
      </div>
    </div>
  )
}
