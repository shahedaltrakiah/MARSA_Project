import Cookies from 'js-cookie'

const TOKEN_KEY = 'marsa_token'
const USER_KEY = 'marsa_user'
const COOKIE_EXPIRES_DAYS = 30

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function clearToken(): void {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(USER_KEY)
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null
  const raw = Cookies.get(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function storeUser(user: unknown): void {
  Cookies.set(USER_KEY, JSON.stringify(user), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function getStoredRole(): string {
  const user = getStoredUser<{ role?: string }>()
  return user?.role ?? 'user'
}
