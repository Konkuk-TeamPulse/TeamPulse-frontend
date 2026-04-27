import type { HealthSummary, ShellData } from '../types/shell'
import { fallbackShellData } from './mock-shell-data'

type ApiError = {
  code?: string
  message: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: ApiError
}

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, '')
  : 'http://localhost:8080'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`)
  }

  const payload = (await response.json()) as ApiResponse<T>

  if (!payload.success) {
    throw new Error(payload.error?.message ?? 'API request failed')
  }

  return payload.data
}

export async function loadShellData(): Promise<ShellData> {
  try {
    return await getJson<ShellData>('/api/demo/shell-data')
  } catch {
    return fallbackShellData
  }
}

export async function loadHealth(): Promise<HealthSummary | null> {
  try {
    return await getJson<HealthSummary>('/api/health')
  } catch {
    return null
  }
}
