import { useState, type FormEvent } from 'react'
import { Section, Field, inputClassName, buttonPrimaryClassName, buttonSecondaryClassName, buttonGhostClassName, Pill } from '../../components/assignment2/Common'
import type { WorkspaceState, Member } from '../../types/workspace'

interface TeamPageProps {
  workspace: WorkspaceState
  onSaveTeam: (team: { name: string; courseName: string; semester: string; dueDate: string }) => void
  onRemoveMember: (member: Member) => void
  onRegenerateInvite: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function TeamPage({
  workspace,
  onSaveTeam,
  onRemoveMember,
  onRegenerateInvite,
  showToast
}: TeamPageProps) {
  const [teamForm, setTeamForm] = useState({
    name: workspace.team.name,
    courseName: workspace.team.courseName,
    semester: workspace.team.semester,
    dueDate: workspace.team.dueDate,
  })

  const handleSaveTeam = () => {
    if (!teamForm.name.trim()) return showToast('팀 이름을 입력해주세요.', 'error')
    if (!teamForm.courseName.trim()) return showToast('과목명을 입력해주세요.', 'error')
    if (!teamForm.dueDate) return showToast('최종 마감일을 선택해주세요.', 'error')

    onSaveTeam(teamForm)
    showToast('팀 정보가 업데이트되었습니다.', 'success')
  }

  const handleTeamFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSaveTeam()
  }

  const copyInviteLink = async () => {
    if (!workspace.team.inviteUrl) {
      showToast('초대 링크를 먼저 생성해주세요.', 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(workspace.team.inviteUrl)
      showToast('초대 링크가 복사되었습니다.', 'success')
    } catch {
      showToast('초대 링크 복사에 실패했습니다.', 'error')
    }
  }

  return (
    <div className="grid min-w-0 gap-6 pb-20 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-0">
      <div className="flex min-w-0 flex-col gap-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">팀 관리</h2>
        
        <Section title="프로젝트 정보" eyebrow="기본 정보">
          <form onSubmit={handleTeamFormSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="팀 이름"><input className={inputClassName} value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></Field>
              <Field label="과목명"><input className={inputClassName} value={teamForm.courseName} onChange={(e) => setTeamForm({ ...teamForm, courseName: e.target.value })} /></Field>
              <Field label="학기"><input className={inputClassName} value={teamForm.semester} onChange={(e) => setTeamForm({ ...teamForm, semester: e.target.value })} /></Field>
              <Field label="최종 마감일"><input className={inputClassName} type="date" value={teamForm.dueDate} onChange={(e) => setTeamForm({ ...teamForm, dueDate: e.target.value })} /></Field>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button type="submit" className={`${buttonPrimaryClassName} px-10`}>정보 업데이트</button>
              <button type="button" className={`${buttonSecondaryClassName} px-10`} onClick={() => { onRegenerateInvite(); showToast('초대 링크가 생성되었습니다.', 'success') }}>초대 링크 생성</button>
            </div>
          </form>
          
          <div className="mt-8 min-w-0 rounded-lg border border-teal-100 bg-mist p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-forest/70">초대 링크</p>
            <div className="mt-4 flex min-w-0 items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
              <strong className="block min-w-0 flex-1 overflow-hidden break-all px-2 py-1 text-sm font-semibold text-slate-900">
                {workspace.team.inviteUrl || '초대 링크를 생성해주세요'}
              </strong>
              <button
                type="button"
                className={[
                  'shrink-0 rounded-md px-3 py-2 text-xs font-bold text-white transition',
                  workspace.team.inviteUrl ? 'bg-forest hover:bg-[#08283e]' : 'cursor-not-allowed bg-slate-300',
                ].join(' ')}
                onClick={copyInviteLink}
                disabled={!workspace.team.inviteUrl}
              >
                복사
              </button>
            </div>
            {workspace.team.inviteCode && (
              <p className="mt-4 text-xs font-bold text-slate-500">코드: {workspace.team.inviteCode}</p>
            )}
            {workspace.team.inviteExpiredAt && (
              <p className="mt-2 text-xs font-bold text-slate-500">만료: {workspace.team.inviteExpiredAt}</p>
            )}
          </div>
        </Section>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <h3 className="text-lg font-extrabold tracking-tight text-slate-950">구성원</h3>
        
        <div className="grid gap-4">
          {workspace.members.map((member) => (
            <article key={member.id} className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                   {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-bold tracking-tight text-slate-950">{member.name}</strong>
                  <div className="mt-1 flex items-center gap-2">
                     <Pill tone={member.role === 'LEADER' ? 'accent' : 'muted'}>{member.role === 'LEADER' ? '팀장' : '팀원'}</Pill>
                  </div>
                </div>
              </div>
              <button type="button" className={`${buttonGhostClassName} text-rose-500`} onClick={() => onRemoveMember(member)}>내보내기</button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
