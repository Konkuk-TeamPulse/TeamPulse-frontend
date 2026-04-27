import { useState, useEffect, type ReactNode } from 'react'
import { Pill } from './Common'

type ViewKey = 'home' | 'tasks' | 'meetings' | 'reports' | 'team'

interface LayoutProps {
  children: ReactNode
  view: ViewKey
  setView: (view: ViewKey) => void
  userName: string
  teamName: string
  courseName: string
  onReset: () => void
  healthStatus?: string
  transport: 'api' | 'local'
}

const views: Array<{ key: ViewKey; label: string; icon: string }> = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'tasks', label: '할 일', icon: '📋' },
  { key: 'meetings', label: '회의', icon: '🤝' },
  { key: 'reports', label: '리포트', icon: '📊' },
  { key: 'team', label: '팀', icon: '👥' },
]

export function Layout({ children, view, setView, userName, teamName, courseName, onReset, healthStatus, transport }: LayoutProps) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardVisible(true)
      }
    }
    const onBlur = () => setIsKeyboardVisible(false)

    window.addEventListener('focusin', onFocus)
    window.addEventListener('focusout', onBlur)
    return () => {
      window.removeEventListener('focusin', onFocus)
      window.removeEventListener('focusout', onBlur)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink pb-safe">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-rust opacity-80">{teamName} / {courseName}</p>
            <h1 className="font-display text-xl font-bold tracking-tight">{userName}님의 워크스페이스</h1>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
             <Pill tone={healthStatus === 'UP' ? 'good' : 'muted'}>{healthStatus === 'UP' ? '서버 연결됨' : '오프라인'}</Pill>
             <Pill tone={transport === 'api' ? 'good' : 'muted'}>{transport === 'api' ? '클라우드' : '로컬'}</Pill>
             <button type="button" className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold transition active:scale-95" onClick={onReset}>초기화</button>
          </div>
        </div>
      </header>

      <main className={`flex-1 px-4 py-6 sm:px-6 lg:px-8 ${isKeyboardVisible ? 'pb-10' : 'pb-32'}`}>
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {!isKeyboardVisible && (
        <nav className="fixed bottom-6 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 rounded-[2rem] border border-black/10 bg-white/90 p-2 shadow-2xl backdrop-blur-xl sm:bottom-8 sm:w-full animate-[rise_0.3s_ease-out]">
          <div className="flex items-center justify-around">
            {views.map((item) => (
              <button
                key={item.key}
                type="button"
                className={[
                  'flex flex-col items-center gap-1 rounded-[1.5rem] px-4 py-2 transition-all duration-300',
                  view === item.key ? 'bg-forest text-paper scale-110 shadow-lg' : 'text-black/40 hover:text-black/60'
                ].join(' ')}
                onClick={() => setView(item.key)}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
