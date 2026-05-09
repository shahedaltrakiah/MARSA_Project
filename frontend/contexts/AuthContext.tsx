'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  clearToken,
  getStoredUser,
  getToken,
  setToken,
  storeUser,
} from '@/lib/auth'
import type { AuthResponse, User } from '@/types/api'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    inviteToken?: string | null
  ) => Promise<{ joinedProjectId?: number }>
  logout: (options?: { redirectTo?: string }) => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    const stored = getStoredUser<User>()
    if (stored) {
      setUser(stored)
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get<{ user: User }>('/auth/me')
        if (cancelled || !res.data.user) return
        setUser(res.data.user)
        storeUser(res.data.user)
      } catch (e) {
        if (cancelled) return
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          clearToken()
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    })
    setToken(res.data.token)
    storeUser(res.data.user)
    setUser(res.data.user)
  }, [])

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      inviteToken?: string | null
    ) => {
      const body: Record<string, unknown> = {
        name,
        email,
        password,
        password_confirmation: password,
      }
      if (inviteToken) {
        body.invite_token = inviteToken
      }
      const res = await api.post<AuthResponse>('/auth/register', body)
      setToken(res.data.token)
      storeUser(res.data.user)
      setUser(res.data.user)
      const id = res.data.meta?.joined_project_id
      return id !== undefined ? { joinedProjectId: id } : {}
    },
    []
  )

  const logout = useCallback(async (options?: { redirectTo?: string }) => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearToken()
      setUser(null)
      router.push(options?.redirectTo ?? '/login')
    }
  }, [router])

  const updateUser = useCallback((next: User) => {
    setUser(next)
    storeUser(next)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [user, isLoading, login, register, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
