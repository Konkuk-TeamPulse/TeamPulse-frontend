export function BrandPanel() {
  return (
    <div className="flex flex-col justify-center space-y-6">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-forest text-sm font-extrabold text-white">
            TP
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest">
            TeamPulse
          </h1>
        </div>
        <p className="max-w-xl text-base font-medium leading-7 text-slate-500">
          프로젝트, 업무, 회의록, 리포트를 한 화면에서 관리합니다.
        </p>
      </header>
    </div>
  )
}
