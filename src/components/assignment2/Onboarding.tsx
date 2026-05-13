import { useState, type FormEvent } from "react";
import {
  Section,
  Field,
  inputClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
} from "./Common";
import { validateEmail } from "../../lib/utils";
import type { InvitationInfo, ProjectSummary } from "../../apis";

interface OnboardingProps {
  onStart: (setup: {
    teamName: string;
    courseName: string;
    semester: string;
    dueDate: string;
  }) => void;
  onLogin: (input: { email: string; password: string }) => void;
  onSignup: (input: {
    email: string;
    password: string;
    name: string;
    university: string;
    phone: string;
  }) => void;
  projects: ProjectSummary[] | null;
  invitation: InvitationInfo | null;
  onAcceptInvitation: () => void;
  onSelectProject: (projectId: number) => void;
  onLogout: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
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
  const [setup, setSetup] = useState({
    teamName: "",
    courseName: "",
    semester: "2026-1",
    dueDate: "",
  });
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({
    loginEmail: "",
    password: "",
    passwordConfirm: "",
    email: "",
    name: "",
    university: "",
    phone: "",
  });

  const handleStart = () => {
    if (!setup.teamName.trim())
      return showToast("팀 이름을 입력해주세요.", "error");
    if (!setup.courseName.trim())
      return showToast("과목명을 입력해주세요.", "error");
    if (!setup.dueDate)
      return showToast("최종 마감일을 선택해주세요.", "error");

    onStart(setup);
  };

  const handleStartSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleStart();
  };

  const handleAuth = () => {
    if (authMode === "login") {
      if (!authForm.loginEmail.trim())
        return showToast("이메일을 입력해주세요.", "error");
      if (!authForm.password)
        return showToast("비밀번호를 입력해주세요.", "error");
      onLogin({
        email: authForm.loginEmail,
        password: authForm.password,
      });
      return;
    }

    if (!authForm.name.trim())
      return showToast("이름을 입력해주세요.", "error");
    if (!authForm.email.trim())
      return showToast("이메일을 입력해주세요.", "error");
    if (!validateEmail(authForm.email))
      return showToast("유효한 이메일 형식이 아닙니다.", "error");
    if (!authForm.password)
      return showToast("비밀번호를 입력해주세요.", "error");
    if (!authForm.passwordConfirm)
      return showToast("비밀번호를 한 번 더 입력해주세요.", "error");
    if (authForm.password !== authForm.passwordConfirm)
      return showToast("비밀번호가 일치하지 않습니다.", "error");
    if (!authForm.university.trim())
      return showToast("학교 이름을 입력해주세요.", "error");
    if (!authForm.phone.trim())
      return showToast("전화번호를 입력해주세요.", "error");

    onSignup({
      email: authForm.email,
      password: authForm.password,
      name: authForm.name,
      university: authForm.university,
      phone: authForm.phone,
    });
  };

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAuth();
  };

  return (
    <div className="min-h-screen bg-paper px-5 py-6 text-ink sm:px-7 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
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

        <div className="flex flex-col justify-center gap-6">
          {invitation && (
            <Section title="프로젝트 초대" eyebrow="초대">
              <div className="grid gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-extrabold tracking-tight text-slate-950">
                    {invitation.projectName}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {invitation.subject} · 팀장 {invitation.teamLeaderName}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    만료 {invitation.expiredAt}
                  </p>
                </div>
                {invitation.isExpired ? (
                  <p className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
                    만료된 초대 링크입니다.
                  </p>
                ) : invitation.isAlreadyJoined ? (
                  <p className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                    이미 참여 중인 프로젝트입니다.
                  </p>
                ) : (
                  <button
                    type="button"
                    className={buttonPrimaryClassName}
                    onClick={onAcceptInvitation}
                  >
                    초대 수락
                  </button>
                )}
              </div>
            </Section>
          )}

          <Section title="계정 연결" eyebrow="인증">
            {projects ? (
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
            ) : (
              <>
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    className={
                      authMode === "login"
                        ? buttonPrimaryClassName
                        : buttonSecondaryClassName
                    }
                    onClick={() => setAuthMode("login")}
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    className={
                      authMode === "signup"
                        ? buttonPrimaryClassName
                        : buttonSecondaryClassName
                    }
                    onClick={() => setAuthMode("signup")}
                  >
                    회원가입
                  </button>
                </div>
                {authMode === "login" ? (
                  <form className="grid gap-5" onSubmit={handleAuthSubmit}>
                    <Field label="이메일">
                      <input
                        className={inputClassName}
                        value={authForm.loginEmail}
                        onChange={(e) =>
                          setAuthForm({
                            ...authForm,
                            loginEmail: e.target.value,
                          })
                        }
                        placeholder="email@example.com"
                      />
                    </Field>
                    <Field label="비밀번호">
                      <input
                        className={inputClassName}
                        type="password"
                        value={authForm.password}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, password: e.target.value })
                        }
                        placeholder="영문, 숫자, 특수문자 포함"
                      />
                    </Field>
                    <button type="submit" className={buttonPrimaryClassName}>
                      로그인하고 불러오기
                    </button>
                  </form>
                ) : (
                  <form
                    className="grid gap-5 sm:grid-cols-2"
                    onSubmit={handleAuthSubmit}
                  >
                    <Field label="이름">
                      <input
                        className={inputClassName}
                        value={authForm.name}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, name: e.target.value })
                        }
                        placeholder="홍길동"
                      />
                    </Field>
                    <Field label="이메일">
                      <input
                        className={inputClassName}
                        type="email"
                        value={authForm.email}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, email: e.target.value })
                        }
                        placeholder="user@example.com"
                      />
                    </Field>
                    <Field label="비밀번호">
                      <input
                        className={inputClassName}
                        type="password"
                        value={authForm.password}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, password: e.target.value })
                        }
                        placeholder="영문, 숫자, 특수문자 포함"
                      />
                    </Field>
                    <Field label="비밀번호 확인">
                      <input
                        className={inputClassName}
                        type="password"
                        value={authForm.passwordConfirm}
                        onChange={(e) =>
                          setAuthForm({
                            ...authForm,
                            passwordConfirm: e.target.value,
                          })
                        }
                        placeholder="비밀번호 재입력"
                      />
                    </Field>
                    <Field label="학교">
                      <input
                        className={inputClassName}
                        value={authForm.university}
                        onChange={(e) =>
                          setAuthForm({
                            ...authForm,
                            university: e.target.value,
                          })
                        }
                        placeholder="건국대학교"
                      />
                    </Field>
                    <Field label="전화번호">
                      <input
                        className={inputClassName}
                        value={authForm.phone}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, phone: e.target.value })
                        }
                        placeholder="010-1234-1234"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className={`${buttonPrimaryClassName} w-full py-3`}
                      >
                        회원가입
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </Section>

          {projects && (
            <Section title="워크스페이스 시작하기" eyebrow="설정">
              <form onSubmit={handleStartSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="팀 이름">
                    <input
                      className={inputClassName}
                      value={setup.teamName}
                      onChange={(e) =>
                        setSetup({ ...setup, teamName: e.target.value })
                      }
                      placeholder="예: 7조 프로젝트팀"
                    />
                  </Field>
                  <Field label="과목명">
                    <input
                      className={inputClassName}
                      value={setup.courseName}
                      onChange={(e) =>
                        setSetup({ ...setup, courseName: e.target.value })
                      }
                      placeholder="예: 소프트웨어공학"
                    />
                  </Field>
                  <Field label="학기">
                    <input
                      className={inputClassName}
                      value={setup.semester}
                      onChange={(e) =>
                        setSetup({ ...setup, semester: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="최종 마감일">
                    <input
                      className={inputClassName}
                      type="date"
                      value={setup.dueDate}
                      onChange={(e) =>
                        setSetup({ ...setup, dueDate: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="mt-8 grid gap-4">
                  <button type="submit" className={buttonPrimaryClassName}>
                    워크스페이스 생성
                  </button>
                </div>
              </form>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
