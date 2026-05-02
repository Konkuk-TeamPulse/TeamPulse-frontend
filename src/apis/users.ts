import { requestJson } from './client'
import type { UserMe } from './types'

export const userApi = {
  me() {
    return requestJson<UserMe>('/api/users/me')
  },
}
