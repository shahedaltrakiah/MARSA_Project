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
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  clearToken,
  getStoredUser,
  getToken,
  setToken,
  storeUser,
} from '@/lib/auth'
import type { User } from '@/types/api'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
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
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      })
      setToken(res.data.token)
      storeUser(res.data.user)
      setUser(res.data.user)
      router.push('/app/projects')
    },
    [router]
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<{ user: User; token: string }>(
        '/auth/register',
        { name, email, password, password_confirmation: password }
      )
      setToken(res.data.token)
      storeUser(res.data.user)
      setUser(res.data.user)
      router.push('/app/projects')
    },
    [router]
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearToken()
      setUser(null)
      router.push('/login')
    }
  }, [router])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
