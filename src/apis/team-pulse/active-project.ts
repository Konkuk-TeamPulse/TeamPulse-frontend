const DEMO_PROJECT_ID = 1
const ACTIVE_PROJECT_KEY = 'teampulse.activeProjectId'

let activeProjectId = readActiveProjectId()

export function getActiveProjectId() {
  return activeProjectId
}

export function resetActiveProjectId() {
  saveActiveProjectId(DEMO_PROJECT_ID)
}

export function saveActiveProjectId(projectId: number) {
  activeProjectId = projectId
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, String(projectId))
  }
}

function readActiveProjectId() {
  if (typeof window === 'undefined') return DEMO_PROJECT_ID
  const raw = window.localStorage.getItem(ACTIVE_PROJECT_KEY)
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEMO_PROJECT_ID
}
