import { useState } from 'react'
import { Section, Field, inputClassName, buttonPrimaryClassName, buttonSecondaryClassName, Pill, Mini } from './Common'
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
  onLoadSample: () => void
  healthStatus?: string
  transport: 'api' | 'local'
  apiBaseUrl: string
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function Onboarding({ onStart, onLoadSample, healthStatus, transport, apiBaseUrl, showToast }: OnboardingProps) {
  const [setup, setSetup] = useState({
    name: '',
    email: '',
    teamName: '',
    courseName: '',
    semester: '2026-1',
    dueDate: '',
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

  return (
    <div className="min-h-screen bg-paper px-5 py-6 text-ink sm:px-7 lg:px-10 animate-[rise_0.6s_ease-out]">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-center space-y-10">
          <header className="space-y-4">
             <Pill tone="accent">과제 #2 - 모바일 퍼스트</Pill>
             <h1 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">TeamPulse</h1>
             <p className="max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
              실제 데이터를 기반으로 워크스페이스를 시작하세요. 팀을 만들고, 할 일을 추적하며, 프로젝트 리포트를 손쉽게 생성할 수 있습니다.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2">
            <Mini title="클라우드 아키텍처">Vercel + AWS + MySQL 기반의 안정적인 백엔드 구성</Mini>
            <Mini title="모바일 퍼스트">스마트폰 사용에 최적화된 하단 탭 내비게이션</Mini>
            <Mini title="입력 중심 UI">더미 대시보드가 아닌, 실제 입력으로 채워지는 워크스페이스</Mini>
            <Mini title="기록의 연결">회의, 할 일, 활동 로그가 유기적으로 연결된 시스템</Mini>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <Pill tone={healthStatus === 'UP' ? 'good' : 'muted'}>{healthStatus === 'UP' ? '서버 연결됨' : '서버 오프라인'}</Pill>
            <Pill tone={transport === 'api' ? 'good' : 'muted'}>{transport === 'api' ? '클라우드 동기화' : '로컬 전용 모드'}</Pill>
            <code className="rounded-full bg-black/5 px-3 py-1.5 text-[0.7rem] text-black/50">{apiBaseUrl}</code>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <Section title="워크스페이스 시작하기" eyebrow="Setup">
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
