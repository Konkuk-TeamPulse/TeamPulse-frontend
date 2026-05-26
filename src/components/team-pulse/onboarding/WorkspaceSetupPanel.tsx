import { buttonPrimaryClassName, Field, inputClassName, Section } from '../ui/Common'
import type { WorkspaceSetupPanelProps } from './types'

export function WorkspaceSetupPanel({
  setup,
  onSubmit,
  setSetup,
}: WorkspaceSetupPanelProps) {
  return (
    <Section title="워크스페이스 시작하기" eyebrow="설정">
      <form onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="팀 이름">
            <input
              className={inputClassName}
              value={setup.teamName}
              onChange={(event) => setSetup((current) => ({ ...current, teamName: event.target.value }))}
              placeholder="예: 7조 프로젝트팀"
            />
          </Field>
          <Field label="과목명">
            <input
              className={inputClassName}
              value={setup.courseName}
              onChange={(event) => setSetup((current) => ({ ...current, courseName: event.target.value }))}
              placeholder="예: 소프트웨어공학"
            />
          </Field>
          <Field label="학기">
            <input
              className={inputClassName}
              value={setup.semester}
              onChange={(event) => setSetup((current) => ({ ...current, semester: event.target.value }))}
            />
          </Field>
          <Field label="최종 마감일">
            <input
              className={inputClassName}
              type="date"
              value={setup.dueDate}
              onChange={(event) => setSetup((current) => ({ ...current, dueDate: event.target.value }))}
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
  )
}
