import type { RiskSignal } from '../../types/shell'

export function RiskAlertPanel({ risks }: { risks: RiskSignal[] }) {
  if (!risks.length) {
    return (
      <section className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-emerald-800">
              리스크 알림
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-700">
              현재 감지된 위험 신호가 없습니다.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            안정
          </span>
        </div>
      </section>
    )
  }

  const mostSevere = risks.some((risk) => risk.severity === 'CRITICAL')
    ? '위험'
    : '주의'
  const panelClass =
    mostSevere === '위험'
      ? 'border-rose-100 bg-rose-50 text-rose-800'
      : 'border-amber-100 bg-amber-50 text-amber-800'

  return (
    <section className={`mb-5 rounded-lg border px-4 py-4 ${panelClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">리스크 알림</p>
          <p className="mt-1 text-xs font-semibold opacity-80">
            {risks.length}개의 위험 신호가 감지되었습니다.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold">
          {mostSevere}
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {risks.slice(0, 4).map((risk) => (
          <article key={risk.id} className="rounded-lg bg-white/80 p-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-extrabold">{risk.title}</strong>
              <span className="text-[0.68rem] font-bold">
                {risk.severity === 'CRITICAL' ? '위험' : '주의'}
              </span>
            </div>
            <p className="mt-2 text-xs font-medium leading-5 opacity-80">
              {risk.body}
            </p>
            {risk.action && (
              <p className="mt-2 text-xs font-semibold leading-5">
                대응: {risk.action}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
