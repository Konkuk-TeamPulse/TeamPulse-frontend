import { clearAuthTokens, getRefreshToken, requestJson, saveAuthTokens } from './client'
import type { AuthUser, LoginResult } from './types'

export async function signup(input: {
  email: string
  password: string
  name: string
  university: string
  phone: string
}) {
  const result = await requestJson<AuthUser>(
    '/api/auth/signup',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  )
  saveAuthTokens(result.jwtInfo)
  return result
}

export async function login(input: { email: string; password: string }) {
  const result = await requestJson<LoginResult>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  )
  saveAuthTokens(result.jwtInfo)
  return result
}

export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    await requestJson<null>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: refreshToken?.startsWith('Bearer ')
          ? refreshToken
          : `Bearer ${refreshToken ?? ''}`,
      }),
    })
  } finally {
    clearAuthTokens()
  }
}
