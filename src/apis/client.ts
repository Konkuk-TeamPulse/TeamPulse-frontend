import type { ErrorResult, LegacyApiResponse, SpecResponse } from './types'

const ACCESS_TOKEN_KEY = 'teampulse.accessToken'
const REFRESH_TOKEN_KEY = 'teampulse.refreshToken'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, '')
  : ''

export class ApiRequestError extends Error {
  status: number
  responseCode?: number
  details?: unknown

  constructor(message: string, status: number, responseCode?: number, details?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.responseCode = responseCode
    this.details = details
  }
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveAuthTokens(jwtInfo: { accessToken: string; refreshToken: string }) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, jwtInfo.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, jwtInfo.refreshToken)
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function hasAccessToken() {
  return Boolean(getAccessToken())
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const token = auth ? getAccessToken() : null
  const headers = new Headers(init.headers)

  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null

  if (payload && typeof payload === 'object' && 'isSuccess' in payload) {
    const spec = payload as SpecResponse<T | ErrorResult | null>
    if (!response.ok || !spec.isSuccess) {
      const details = spec.result && typeof spec.result === 'object' ? spec.result : undefined
      throw new ApiRequestError(
        formatErrorMessage(spec.responseMessage, details),
        response.status,
        spec.responseCode,
        details,
      )
    }
    return spec.result as T
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const legacy = payload as LegacyApiResponse<T>
    if (!response.ok || !legacy.success) {
      throw new ApiRequestError(
        legacy.error?.message ?? `요청에 실패했습니다. (${response.status})`,
        response.status,
        undefined,
        legacy.error?.details,
      )
    }
    return legacy.data
  }

  if (!response.ok) {
    throw new ApiRequestError(`요청에 실패했습니다. (${response.status})`, response.status)
  }

  return payload as T
}

function formatErrorMessage(message: string, details?: unknown) {
  if (!details || typeof details !== 'object' || !('errors' in details)) return message

  const errors = (details as ErrorResult).errors ?? []
  if (!errors.length) return message

  return errors.map((error) => error.message).join('\n')
}
