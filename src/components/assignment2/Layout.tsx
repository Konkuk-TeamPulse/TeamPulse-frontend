import type { ReactNode } from 'react'
import type { RiskSignal } from '../../types/shell'

type ViewKey = 'home' | 'tasks' | 'meetings' | 'reports' | 'team'

interface LayoutProps {
  children: ReactNode
  view: ViewKey
  setView: (view: ViewKey) => void
  userName: string
  teamName: string
  courseName: string
  onReset: () => void
  onLogout: () => void
  onExitProject: () => void
  risks: RiskSignal[]
}

const views: Array<{ key: ViewKey; label: string; mark: string }> = [
  { key: 'home', label: '대시보드', mark: '홈' },
  { key: 'tasks', label: '업무', mark: '업' },
  { key: 'meetings', label: '회의록', mark: '회' },
  { key: 'reports', label: '리포트', mark: '리' },
  { key: 'team', label: '팀 관리', mark: '팀' },
]

export function Layout({ children, view, setView, userName, teamName, courseName, onReset, onLogout, onExitProject, risks }: LayoutProps) {
  const riskAlerts = risks.filter((risk) => risk.severity !== 'INFO')

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-14 items-center gap-3 border-b border-slate-200 px-5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-forest text-sm font-extrabold text-white">TP</div>
          <strong className="text-lg font-extrabold tracking-tight text-forest">TeamPulse</strong>
        </div>

        <nav className="space-y-1 px-4 py-6">
          {views.map((item) => (
            <button
              key={item.key}
              type="button"
              className={[
                'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition',
                view === item.key ? 'bg-mist text-forest' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
              onClick={() => setView(item.key)}
            >
              <span className="grid h-5 w-5 place-items-center rounded text-[0.65rem] font-bold">{item.mark}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {userName.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-bold text-slate-900">{userName}</strong>
              <span className="block text-xs font-medium text-slate-500">TeamPulse</span>
            </div>
          </div>
          <button type="button" className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50" onClick={onLogout}>
            로그아웃
          </button>
          <button type="button" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50" onClick={onExitProject}>
            프로젝트 나가기
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[224px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              프로젝트 대시보드: <span className="font-medium text-slate-500">{teamName || courseName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 lg:hidden" onClick={onExitProject}>프로젝트 나가기</button>
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50" onClick={onReset}>초기화</button>
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 lg:hidden" onClick={onLogout}>로그아웃</button>
            <button type="button" className="rounded-full bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm" onClick={() => setView('tasks')}>+ 새 업무</button>
          </div>
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <RiskAlertPanel risks={riskAlerts} />
          {children}
        </main>

        <nav className="fixed bottom-4 left-4 right-4 z-30 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur lg:hidden">
          <div className="grid grid-cols-5 gap-1">
            {views.map((item) => (
              <button
                key={item.key}
                type="button"
                className={[
                  'rounded-lg px-2 py-2 text-[0.68rem] font-bold',
                  view === item.key ? 'bg-forest text-white' : 'text-slate-500',
                ].join(' ')}
                onClick={() => setView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

function RiskAlertPanel({ risks }: { risks: RiskSignal[] }) {
  if (!risks.length) {
    return (
      <section className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-emerald-800">리스크 알림</p>
            <p className="mt-1 text-xs font-medium text-emerald-700">현재 감지된 위험 신호가 없습니다.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">안정</span>
        </div>
      </section>
    )
  }

  const mostSevere = risks.some((risk) => risk.severity === 'CRITICAL') ? '위험' : '주의'
  const panelClass = mostSevere === '위험'
    ? 'border-rose-100 bg-rose-50 text-rose-800'
    : 'border-amber-100 bg-amber-50 text-amber-800'

  return (
    <section className={`mb-5 rounded-lg border px-4 py-4 ${panelClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">리스크 알림</p>
          <p className="mt-1 text-xs font-semibold opacity-80">{risks.length}개의 위험 신호가 감지되었습니다.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold">{mostSevere}</span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {risks.slice(0, 4).map((risk) => (
          <article key={risk.id} className="rounded-lg bg-white/80 p-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-extrabold">{risk.title}</strong>
              <span className="text-[0.68rem] font-bold">{risk.severity === 'CRITICAL' ? '위험' : '주의'}</span>
            </div>
            <p className="mt-2 text-xs font-medium leading-5 opacity-80">{risk.body}</p>
            {risk.action && <p className="mt-2 text-xs font-semibold leading-5">대응: {risk.action}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}
