import { useState } from 'react'
import { Section, Field, inputClassName, buttonPrimaryClassName, buttonSecondaryClassName, buttonGhostClassName, Pill } from './Common'
import type { WorkspaceState, Member, MemberRole } from '../../types/workspace'

interface TeamViewProps {
  workspace: WorkspaceState
  onSaveTeam: (team: { name: string; courseName: string; semester: string; dueDate: string }) => void
  onAddMember: (member: { name: string; role: MemberRole }) => void
  onRemoveMember: (member: Member) => void
  onRegenerateInvite: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function TeamView({
  workspace,
  onSaveTeam,
  onAddMember,
  onRemoveMember,
  onRegenerateInvite,
  showToast
}: TeamViewProps) {
  const [teamForm, setTeamForm] = useState({
    name: workspace.team.name,
    courseName: workspace.team.courseName,
    semester: workspace.team.semester,
    dueDate: workspace.team.dueDate,
  })
  const [memberForm, setMemberForm] = useState<{ name: string; role: MemberRole }>({
    name: '',
    role: 'MEMBER',
  })

  const handleSaveTeam = () => {
    if (!teamForm.name.trim()) return showToast('팀 이름을 입력해주세요.', 'error')
    if (!teamForm.courseName.trim()) return showToast('과목명을 입력해주세요.', 'error')
    if (!teamForm.dueDate) return showToast('최종 마감일을 선택해주세요.', 'error')

    onSaveTeam(teamForm)
    showToast('팀 정보가 업데이트되었습니다.', 'success')
  }

  const handleAddMember = () => {
    if (!memberForm.name.trim()) return showToast('팀원 이름을 입력해주세요.', 'error')
    if (workspace.members.some((m) => m.name === memberForm.name.trim())) {
      return showToast('이미 존재하는 팀원입니다.', 'error')
    }

    onAddMember(memberForm)
    setMemberForm({ ...memberForm, name: '' })
    showToast('팀원이 추가되었습니다.', 'success')
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_400px] pb-10 animate-[rise_0.4s_ease-out]">
      <div className="flex flex-col gap-10">
        <h2 className="font-display text-4xl font-bold tracking-tight">팀 관리</h2>
        
        <Section title="프로젝트 정보" eyebrow="Core Profile">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="팀 이름"><input className={inputClassName} value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></Field>
            <Field label="과목명"><input className={inputClassName} value={teamForm.courseName} onChange={(e) => setTeamForm({ ...teamForm, courseName: e.target.value })} /></Field>
            <Field label="학기"><input className={inputClassName} value={teamForm.semester} onChange={(e) => setTeamForm({ ...teamForm, semester: e.target.value })} /></Field>
            <Field label="최종 마감일"><input className={inputClassName} type="date" value={teamForm.dueDate} onChange={(e) => setTeamForm({ ...teamForm, dueDate: e.target.value })} /></Field>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" className={`${buttonPrimaryClassName} px-10`} onClick={handleSaveTeam}>정보 업데이트</button>
            <button type="button" className={`${buttonSecondaryClassName} px-10`} onClick={() => { onRegenerateInvite(); showToast('초대 코드가 재생성되었습니다.', 'success') }}>초대 코드 재생성</button>
          </div>
          
          <div className="mt-10 rounded-[2.5rem] border-2 border-dashed border-rust/20 bg-mist/30 p-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-rust opacity-60">팀원 초대 코드</p>
            <strong className="mt-4 block font-display text-5xl tracking-[0.2em] text-ink sm:text-6xl">{workspace.team.inviteCode}</strong>
            <p className="mt-6 text-xs font-bold text-black/40 italic">팀원들에게 이 코드를 공유하여 워크스페이스에 참여하게 하세요.</p>
          </div>
        </Section>
      </div>

      <div className="flex flex-col gap-8">
        <h3 className="font-display text-2xl font-bold tracking-tight">구성원 명단</h3>
        
        <Section title="팀원 추가" eyebrow="People">
          <div className="grid gap-4">
            <Field label="팀원 이름"><input className={inputClassName} value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="이름 입력..." /></Field>
            <Field label="역할 할당"><select className={inputClassName} value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as MemberRole })}><option value="MEMBER">팀원</option><option value="LEADER">팀장</option></select></Field>
            <button type="button" className={`${buttonPrimaryClassName} mt-2 w-full`} onClick={handleAddMember}>팀에 추가</button>
          </div>
        </Section>

        <div className="grid gap-4">
          {workspace.members.map((member) => (
            <article key={member.id} className="flex items-center justify-between gap-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest font-display text-lg text-paper">
                   {member.name.charAt(0)}
                </div>
                <div>
                  <strong className="block font-display text-lg tracking-tight">{member.name}</strong>
                  <div className="mt-1 flex items-center gap-2">
                     <Pill tone={member.role === 'LEADER' ? 'accent' : 'muted'}>{member.role === 'LEADER' ? '팀장' : '팀원'}</Pill>
                  </div>
                </div>
              </div>
              <button type="button" className={`${buttonGhostClassName} scale-75 border-rust/10 text-rust/40 hover:text-rust`} onClick={() => onRemoveMember(member)}>내보내기</button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
