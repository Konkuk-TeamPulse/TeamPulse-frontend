import type { Meeting, RiskSignal, Task } from '../types/shell'
import type { Member } from '../types/workspace'

const DAY_MS = 24 * 60 * 60 * 1000

export function deriveRisks(tasks: Task[], meetings: Meeting[], members: Member[], now = new Date()): RiskSignal[] {
  const risks: RiskSignal[] = []
  const today = startOfDay(now)
  const unfinished = tasks.filter((task) => task.status !== 'DONE')

  const overdue = unfinished.filter((task) => {
    const dueDate = parseDate(task.dueDate)
    return dueDate ? dueDate < today : false
  })
  if (overdue.length > 0) {
    risks.push({
      id: 101,
      severity: 'CRITICAL',
      title: '마감 초과 태스크',
      body: `${overdue.length}개의 미완료 태스크가 마감일을 넘겼습니다.`,
      action: '범위를 줄이고 가장 오래 지연된 태스크부터 처리하세요.',
    })
  }

  const dueSoon = unfinished.filter((task) => {
    const dueDate = parseDate(task.dueDate)
    return dueDate ? dueDate >= today && dueDate.getTime() - today.getTime() <= 2 * DAY_MS : false
  })
  if (dueSoon.length > 0) {
    risks.push({
      id: 102,
      severity: 'WARNING',
      title: '마감 임박 태스크',
      body: `${dueSoon.length}개의 미완료 태스크가 2일 이내 마감됩니다.`,
      action: '오늘 처리할 항목과 미룰 항목을 분리하세요.',
    })
  }

  const blocked = unfinished.filter((task) => task.blockers.length > 0 || task.next.length > 0)
  if (blocked.length > 0) {
    risks.push({
      id: 103,
      severity: 'WARNING',
      title: '선행 작업 영향',
      body: `${blocked.length}개의 태스크가 차단 요소 또는 후속 작업 관계를 가지고 있습니다.`,
      action: '선행 작업을 먼저 완료하거나 작업을 더 작게 나누세요.',
    })
  }

  const concentration = getOwnerConcentration(unfinished)
  if (concentration && unfinished.length >= 3 && concentration.count / unfinished.length >= 0.4) {
    risks.push({
      id: 104,
      severity: 'WARNING',
      title: '역할 편중',
      body: `${concentration.owner}님이 미완료 태스크의 ${Math.round((concentration.count / unfinished.length) * 100)}%를 담당하고 있습니다.`,
      action: '담당자를 재분배하거나 태스크를 분할하세요.',
    })
  }

  if (members.length > 1 && meetings.length === 0 && unfinished.length > 0) {
    risks.push({
      id: 105,
      severity: 'INFO',
      title: '회의 기록 부족',
      body: '태스크는 존재하지만 회의 기록이 아직 없습니다.',
      action: '첫 동기화 회의를 등록하고 결정사항을 남기세요.',
    })
  }

  return risks
}

function getOwnerConcentration(tasks: Task[]) {
  const counts = new Map<string, number>()
  tasks.forEach((task) => counts.set(task.owner, (counts.get(task.owner) ?? 0) + 1))
  return [...counts.entries()]
    .map(([owner, count]) => ({ owner, count }))
    .sort((a, b) => b.count - a.count)[0]
}

function parseDate(value: string) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}
