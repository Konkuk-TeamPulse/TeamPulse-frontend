import { Empty } from '../ui/Common'
import type { Activity } from '../../../types/shell'

export function InviteLinkCard({
  inviteUrl,
  inviteExpiredAt,
  onCreateInviteLink,
  showToast,
}: {
  inviteUrl: string
  inviteExpiredAt?: string
  onCreateInviteLink: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const inviteLink = inviteUrl || '초대 링크를 생성해주세요'
  const hasInviteLink = Boolean(inviteUrl)

  const copyInviteLink = async () => {
    if (!inviteUrl) {
      showToast('초대 링크를 먼저 생성해주세요.', 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(inviteUrl)
      showToast('초대 링크가 복사되었습니다.', 'success')
    } catch {
      showToast('초대 링크 복사에 실패했습니다.', 'error')
    }
  }

  return (
    <article className="min-w-0 rounded-lg border border-teal-100 bg-mist p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-slate-900">팀원 초대</h3>
        <button type="button" className="rounded-md bg-forest px-3 py-1.5 text-[0.68rem] font-bold text-white transition hover:bg-[#08283e]" onClick={onCreateInviteLink}>
          생성
        </button>
      </div>
      <div className="mt-4 flex min-w-0 items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
        <button
          type="button"
          className={[
            'block min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-xs font-semibold transition',
            hasInviteLink ? 'text-slate-700 hover:bg-slate-50 active:scale-[0.99]' : 'cursor-not-allowed text-slate-400',
          ].join(' ')}
          onClick={copyInviteLink}
          disabled={!hasInviteLink}
        >
          {inviteLink}
        </button>
        <button
          type="button"
          className={[
            'rounded-md px-2 py-1 text-[0.65rem] font-bold text-white transition',
            hasInviteLink ? 'bg-forest hover:bg-[#08283e]' : 'cursor-not-allowed bg-slate-300',
          ].join(' ')}
          onClick={copyInviteLink}
          disabled={!hasInviteLink}
        >
          복사
        </button>
      </div>
      {inviteExpiredAt && <p className="mt-3 text-xs font-semibold text-slate-500">만료 {inviteExpiredAt}</p>}
    </article>
  )
}

export function ActivityListCard({ activities }: { activities: Activity[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">최근 활동</h3>
        <span className="text-xs font-semibold text-slate-500">{activities.length}</span>
      </div>
      <div className="mt-5 grid gap-3">
        {activities.length ? activities.slice(0, 4).map((activity) => (
          <div key={activity.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <strong className="block text-xs font-bold text-slate-900">{activity.summary}</strong>
            <p className="mt-1 text-[0.68rem] font-medium text-slate-500">{activity.actor} · {activity.at}</p>
          </div>
        )) : <Empty>활동 기록이 없습니다.</Empty>}
      </div>
    </article>
  )
}
