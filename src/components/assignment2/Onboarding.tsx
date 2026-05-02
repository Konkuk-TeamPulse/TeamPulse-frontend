import { useState } from 'react'
import { Section, Field, inputClassName, buttonPrimaryClassName, buttonSecondaryClassName } from './Common'
import { validateEmail } from '../../lib/utils'

interface OnboardingProps {
  onStart: (setup: {
    name: string
    email: string
    teamName: string
    courseName: string
    semester: string
    dueDate: string
  }) => void
  onLogin: (input: {
    email: string
    password: string
  }) => void
  onSignup: (input: {
    email: string
    password: string
    name: string
    university: string
    phone: string
  }) => void
  onLoadSample: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function Onboarding({ onStart, onLogin, onSignup, onLoadSample, showToast }: OnboardingProps) {
  const [setup, setSetup] = useState({
    name: '',
    email: '',
    teamName: '',
    courseName: '',
    semester: '2026-1',
    dueDate: '',
  })
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authForm, setAuthForm] = useState({
    loginEmail: '',
    password: '',
    email: '',
    name: '',
    university: '',
    phone: '',
  })

  const handleStart = () => {
    if (!setup.name.trim()) return showToast('이름을 입력해주세요.', 'error')
    if (!setup.email.trim()) return showToast('이메일을 입력해주세요.', 'error')
    if (!validateEmail(setup.email)) return showToast('유효한 이메일 형식이 아닙니다.', 'error')
    if (!setup.teamName.trim()) return showToast('팀 이름을 입력해주세요.', 'error')
    if (!setup.courseName.trim()) return showToast('과목명을 입력해주세요.', 'error')
    if (!setup.dueDate) return showToast('최종 마감일을 선택해주세요.', 'error')

    onStart(setup)
  }

  const handleAuth = () => {
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
        <div className="flex flex-col justify-center space-y-6">
          <header className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="grid h-10 w-10 place-items-center rounded-md bg-forest text-sm font-extrabold text-white">TP</div>
               <h1 className="text-3xl font-extrabold tracking-tight text-forest">TeamPulse</h1>
             </div>
             <p className="max-w-xl text-base font-medium leading-7 text-slate-500">
              프로젝트, 업무, 회의록, 리포트를 한 화면에서 관리합니다.
             </p>
          </header>

        </div>

        <div className="flex flex-col justify-center gap-6">
          <Section title="계정 연결" eyebrow="인증">
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button type="button" className={authMode === 'login' ? buttonPrimaryClassName : buttonSecondaryClassName} onClick={() => setAuthMode('login')}>로그인</button>
              <button type="button" className={authMode === 'signup' ? buttonPrimaryClassName : buttonSecondaryClassName} onClick={() => setAuthMode('signup')}>회원가입</button>
            </div>
            {authMode === 'login' ? (
              <div className="grid gap-5">
                <Field label="이메일"><input className={inputClassName} value={authForm.loginEmail} onChange={(e) => setAuthForm({ ...authForm, loginEmail: e.target.value })} placeholder="202114216" /></Field>
                <Field label="비밀번호"><input className={inputClassName} type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="!aaa123123" /></Field>
                <button type="button" className={buttonPrimaryClassName} onClick={handleAuth}>로그인하고 불러오기</button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="이름"><input className={inputClassName} value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="이주호" /></Field>
                <Field label="이메일"><input className={inputClassName} type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="user@example.com" /></Field>
                <Field label="비밀번호"><input className={inputClassName} type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="!aaa123123" /></Field>
                <Field label="학교"><input className={inputClassName} value={authForm.university} onChange={(e) => setAuthForm({ ...authForm, university: e.target.value })} placeholder="건국대학교" /></Field>
                <Field label="전화번호"><input className={inputClassName} value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="010-1234-1234" /></Field>
                <div className="flex items-end"><button type="button" className={`${buttonPrimaryClassName} w-full`} onClick={handleAuth}>회원가입</button></div>
              </div>
            )}
          </Section>

          <Section title="워크스페이스 시작하기" eyebrow="설정">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="사용자 이름"><input className={inputClassName} value={setup.name} onChange={(e) => setSetup({ ...setup, name: e.target.value })} placeholder="예: 홍길동" /></Field>
              <Field label="이메일 주소"><input className={inputClassName} type="email" value={setup.email} onChange={(e) => setSetup({ ...setup, email: e.target.value })} placeholder="email@example.com" /></Field>
              <Field label="팀 이름"><input className={inputClassName} value={setup.teamName} onChange={(e) => setSetup({ ...setup, teamName: e.target.value })} placeholder="예: 7조 프로젝트팀" /></Field>
              <Field label="과목명"><input className={inputClassName} value={setup.courseName} onChange={(e) => setSetup({ ...setup, courseName: e.target.value })} placeholder="예: 소프트웨어공학" /></Field>
              <Field label="학기"><input className={inputClassName} value={setup.semester} onChange={(e) => setSetup({ ...setup, semester: e.target.value })} /></Field>
              <Field label="최종 마감일"><input className={inputClassName} type="date" value={setup.dueDate} onChange={(e) => setSetup({ ...setup, dueDate: e.target.value })} /></Field>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button type="button" className={buttonPrimaryClassName} onClick={handleStart}>워크스페이스 생성</button>
              <button type="button" className={buttonSecondaryClassName} onClick={onLoadSample}>샘플 데이터로 둘러보기</button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
