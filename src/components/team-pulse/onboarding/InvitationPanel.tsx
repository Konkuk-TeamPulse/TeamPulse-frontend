import type { InvitationInfo } from '../../../apis'
import { buttonPrimaryClassName, Section } from '../ui/Common'

export function InvitationPanel({
  invitation,
  onAcceptInvitation,
}: {
  invitation: InvitationInfo
  onAcceptInvitation: () => void
}) {
  return (
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
  )
}
