import type { ReactNode } from "react";
import type { TeamPulseViewKey } from "../../types/navigation";
import type { RiskSignal } from "../../types/shell";
import { RiskAlertPanel } from "./RiskAlertPanel";

interface LayoutProps {
  children: ReactNode;
  view: TeamPulseViewKey;
  setView: (view: TeamPulseViewKey) => void;
  userName: string;
  teamName: string;
  courseName: string;
  onReset: () => void;
  onLogout: () => void;
  onExitProject: () => void;
  risks: RiskSignal[];
}

const views: Array<{ key: TeamPulseViewKey; label: string; mark: string }> = [
  { key: "home", label: "대시보드", mark: "홈" },
  { key: "tasks", label: "업무", mark: "업" },
  { key: "meetings", label: "회의록", mark: "회" },
  { key: "reports", label: "리포트", mark: "리" },
  { key: "team", label: "팀 관리", mark: "팀" },
];

export function Layout({
  children,
  view,
  setView,
  userName,
  teamName,
  courseName,
  onReset,
  onLogout,
  onExitProject,
  risks,
}: LayoutProps) {
  const riskAlerts = risks.filter((risk) => risk.severity !== "INFO");

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-14 items-center gap-3 border-b border-slate-200 px-5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-forest text-sm font-extrabold text-white">
            TP
          </div>
          <strong className="text-lg font-extrabold tracking-tight text-forest">
            TeamPulse
          </strong>
        </div>

        <nav className="space-y-1 px-4 py-6">
          {views.map((item) => (
            <button
              key={item.key}
              type="button"
              className={[
                "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                view === item.key
                  ? "bg-mist text-forest"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
              onClick={() => setView(item.key)}
            >
              <span className="grid h-5 w-5 place-items-center rounded text-[0.65rem] font-bold">
                {item.mark}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {userName.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-bold text-slate-900">
                {userName}
              </strong>
              <span className="block text-xs font-medium text-slate-500">
                TeamPulse
              </span>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            onClick={onLogout}
          >
            로그아웃
          </button>
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            onClick={onExitProject}
          >
            메인으로 돌아가기
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[224px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              프로젝트 대시보드:{" "}
              <span className="font-medium text-slate-500">
                {teamName || courseName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={onExitProject}
            >
              메인으로 돌아가기
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              onClick={onReset}
            >
              초기화
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={onLogout}
            >
              로그아웃
            </button>
            <button
              type="button"
              className="rounded-full bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm"
              onClick={() => setView("tasks")}
            >
              + 새 업무
            </button>
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
                  "rounded-lg px-2 py-2 text-[0.68rem] font-bold",
                  view === item.key ? "bg-forest text-white" : "text-slate-500",
                ].join(" ")}
                onClick={() => setView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
