import { fallbackShellData } from '../lib/mock-shell-data'
import { requestJson } from './client'
import type { HealthSummary, ShellData } from './types'

export async function loadShellData(): Promise<ShellData> {
  try {
    return await requestJson<ShellData>('/api/demo/shell-data', {}, false)
  } catch {
    return fallbackShellData
  }
}

export async function loadHealth(): Promise<HealthSummary | null> {
  try {
    return await requestJson<HealthSummary>('/api/health', {}, false)
  } catch {
    return null
  }
}
