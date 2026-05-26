import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  Field,
  inputClassName,
  Section,
} from '../ui/Common'
import type { AuthPanelProps } from './types'

export function AuthPanel({
  authMode,
  authForm,
  projects,
  onAuthSubmit,
  onLogout,
  onSelectProject,
  resetSignupForm,
  setAuthForm,
  setAuthMode,
}: AuthPanelProps) {
  return (
    <Section title="계정 연결" eyebrow="인증">
      {projects ? (
        <ProjectList
          projects={projects}
          onLogout={onLogout}
          onSelectProject={onSelectProject}
        />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              className={authMode === 'login' ? buttonPrimaryClassName : buttonSecondaryClassName}
              onClick={() => setAuthMode('login')}
            >
              로그인
            </button>
            <button
              type="button"
              className={authMode === 'signup' ? buttonPrimaryClassName : buttonSecondaryClassName}
              onClick={() => {
                setAuthMode('signup')
                resetSignupForm()
              }}
            >
              회원가입
            </button>
          </div>
          {authMode === 'login' ? (
            <LoginForm authForm={authForm} onSubmit={onAuthSubmit} setAuthForm={setAuthForm} />
          ) : (
            <SignupForm authForm={authForm} onSubmit={onAuthSubmit} setAuthForm={setAuthForm} />
          )}
        </>
      )}
    </Section>
  )
}

function ProjectList({
  projects,
  onLogout,
  onSelectProject,
}: Pick<AuthPanelProps, 'projects' | 'onLogout' | 'onSelectProject'> & { projects: NonNullable<AuthPanelProps['projects']> }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">
          참여 중인 프로젝트 ({projects.length})
        </p>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          onClick={onLogout}
        >
          로그아웃
        </button>
      </div>
      {projects.length ? (
        projects.map((project, index) => (
          <button
            key={`${project.projectId}-${index}`}
            type="button"
            className="grid gap-2 rounded-lg border border-black/10 bg-white px-4 py-3 text-left transition hover:border-forest/40 hover:bg-forest/5"
            onClick={() => onSelectProject(project.projectId)}
          >
            <span className="text-base font-extrabold text-ink">
              {project.projectName}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {project.subject} · {project.role} · {project.endDate}
            </span>
          </button>
        ))
      ) : (
        <p className="rounded-lg border border-dashed border-black/15 px-4 py-5 text-sm font-semibold text-slate-500">
          현재 참여 중인 프로젝트가 없습니다.
        </p>
      )}
    </div>
  )
}

function LoginForm({
  authForm,
  onSubmit,
  setAuthForm,
}: Pick<AuthPanelProps, 'authForm' | 'setAuthForm'> & { onSubmit: AuthPanelProps['onAuthSubmit'] }) {
  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <Field label="이메일">
        <input
          className={inputClassName}
          value={authForm.loginEmail}
          onChange={(event) => setAuthForm((current) => ({ ...current, loginEmail: event.target.value }))}
          placeholder="email@example.com"
        />
      </Field>
      <Field label="비밀번호">
        <input
          className={inputClassName}
          type="password"
          value={authForm.password}
          onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="영문, 숫자, 특수문자 포함"
        />
      </Field>
      <button type="submit" className={buttonPrimaryClassName}>
        로그인하고 불러오기
      </button>
    </form>
  )
}

function SignupForm({
  authForm,
  onSubmit,
  setAuthForm,
}: Pick<AuthPanelProps, 'authForm' | 'setAuthForm'> & { onSubmit: AuthPanelProps['onAuthSubmit'] }) {
  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field label="이름">
        <input className={inputClassName} value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} placeholder="홍길동" />
      </Field>
      <Field label="이메일">
        <input className={inputClassName} type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="user@example.com" />
      </Field>
      <Field label="비밀번호">
        <input className={inputClassName} type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="영문, 숫자, 특수문자 포함" />
      </Field>
      <Field label="비밀번호 확인">
        <input className={inputClassName} type="password" value={authForm.passwordConfirm} onChange={(event) => setAuthForm((current) => ({ ...current, passwordConfirm: event.target.value }))} placeholder="비밀번호 재입력" />
      </Field>
      <Field label="학교">
        <input className={inputClassName} value={authForm.university} onChange={(event) => setAuthForm((current) => ({ ...current, university: event.target.value }))} placeholder="건국대학교" />
      </Field>
      <Field label="전화번호">
        <input className={inputClassName} value={authForm.phone} onChange={(event) => setAuthForm((current) => ({ ...current, phone: event.target.value }))} placeholder="010-1234-1234" />
      </Field>
      <div className="sm:col-span-2">
        <button type="submit" className={`${buttonPrimaryClassName} w-full py-3`}>
          회원가입
        </button>
      </div>
    </form>
  )
}
