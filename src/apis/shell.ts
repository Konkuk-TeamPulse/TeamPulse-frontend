import { requestJson } from './client'
import type { HealthSummary } from './types'

export async function loadHealth(): Promise<HealthSummary | null> {
  try {
    return await requestJson<HealthSummary>('/api/health', {}, false)
  } catch {
    return null
  }
}
