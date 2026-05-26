import { ApiRequestError, type MemberSummary } from '..'

export function settledValue<T>(result: PromiseSettledResult<T>) {
  return result.status === 'fulfilled' ? result.value : undefined
}

export function findMemberByName(members: MemberSummary[], name: string) {
  const member = members.find((item) => item.name === name) ?? members[0]
  if (!member) {
    throw new ApiRequestError('태스크를 배정할 팀원이 없습니다.', 400)
  }
  return member
}

export function mapAttendeeIds(members: MemberSummary[], attendeeNames: string[]) {
  const trimmedNames = attendeeNames.map((name) => name.trim()).filter(Boolean)
  const attendeeIds = trimmedNames
    .map((name) => members.find((member) => member.name === name)?.memberId)
    .filter((memberId): memberId is number => typeof memberId === 'number')

  return Array.from(new Set(attendeeIds))
}

export function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
