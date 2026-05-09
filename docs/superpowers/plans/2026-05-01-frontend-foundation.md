# Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js 14 frontend data layer — API client, auth context, route protection, connected auth forms, and a live projects list — on top of the visual shell delivered by Cursor.

**Architecture:** A Sanctum bearer token is stored in an HTTP-only-compatible cookie, readable by both Next.js middleware (server-side route guarding) and an Axios interceptor (API requests). Auth state lives in a React context consumed by all `/app/*` pages. The backend runs at `http://localhost:8000`; the frontend at `http://localhost:3000`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Axios, js-cookie, React Context, Jest + React Testing Library

**Prerequisite:** Cursor has completed the visual scaffold. The `frontend/` directory exists at `C:\Users\User\Desktop\MARSA_Project\frontend\` with Next.js + Tailwind + shadcn/ui installed, CSS theme variables defined, and UI shells for login/register forms, workspace layout (Topbar/Sidebar/NotesPanel), and landing page.

**Split:** Tasks marked `[CURSOR]` are handled by Cursor. Tasks marked `[CLAUDE]` are implemented by Claude Code using subagent-driven development.

---

## Directory Structure (Claude's Files)

```
frontend/
├── .env.local                              ← NEXT_PUBLIC_API_URL
├── types/
│   └── api.ts                              ← All TypeScript interfaces for backend responses
├── lib/
│   ├── api.ts                              ← Axios instance with bearer token interceptor
│   └── auth.ts                             ← Cookie token + user storage helpers
├── contexts/
│   └── AuthContext.tsx                     ← Auth state: user, login, register, logout
├── hooks/
│   ├── useAuth.ts                          ← Safe AuthContext consumer
│   └── useProjects.ts                      ← Projects list data fetching
├── middleware.ts                            ← Redirect unauthenticated /app/* → /login
├── app/
│   ├── layout.tsx                          ← Add AuthProvider wrapper (modify Cursor's)
│   ├── (auth)/
│   │   ├── login/page.tsx                  ← Connect login form to API (modify Cursor's)
│   │   └── register/page.tsx               ← Connect register form to API (modify Cursor's)
│   └── app/
│       └── projects/
│           └── page.tsx                    ← Real projects list (modify Cursor's placeholder)
└── __tests__/
    ├── lib/auth.test.ts                    ← Token helpers unit tests
    └── hooks/useProjects.test.tsx          ← Projects hook unit tests
```

---

## Task 1 [CURSOR]: Next.js Scaffold + UI Shell

**Handled by Cursor.** Deliverables:
- `frontend/` Next.js 14 project with TypeScript, Tailwind, shadcn/ui
- `app/layout.tsx` with ThemeProvider (next-themes)
- `styles/globals.css` with Midnight + Light CSS variables
- `app/(marketing)/page.tsx` — landing page
- `app/(auth)/login/page.tsx` and `register/page.tsx` — form UI shells (no logic)
- `app/app/layout.tsx` — workspace shell with Topbar, Sidebar, NotesPanel
- `app/app/projects/page.tsx` — placeholder projects page
- `components/layout/Topbar.tsx`, `Sidebar.tsx`, `NotesPanel.tsx`

**Wait for Cursor to finish before starting Task 2.**

---

## Task 2 [CLAUDE]: Environment Config + Install Dependencies

**Files:**
- Create: `frontend/.env.local`
- Modify: `frontend/package.json` (via npm install)

- [ ] **Step 1: Create `.env.local`**

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

- [ ] **Step 2: Install axios and js-cookie**

```bash
cd C:\Users\User\Desktop\MARSA_Project\frontend
npm install axios js-cookie
npm install -D @types/js-cookie
```

Expected: Both packages added to `package.json` with no errors.

- [ ] **Step 3: Install Jest + React Testing Library**

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest
```

- [ ] **Step 4: Create Jest config**

Create `frontend/jest.config.ts`:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Create `frontend/jest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `frontend/package.json`, ensure `scripts` contains:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

- [ ] **Step 6: Commit**

```bash
git add frontend/.env.local frontend/jest.config.ts frontend/jest.setup.ts frontend/package.json frontend/package-lock.json
git commit -m "chore: add env config, axios, js-cookie, jest setup"
```

---

## Task 3 [CLAUDE]: TypeScript API Types

**Files:**
- Create: `frontend/types/api.ts`

- [ ] **Step 1: Create types file**

Create `frontend/types/api.ts`:

```typescript
export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export type StartupStage =
  | 'idea'
  | 'validation'
  | 'mvp'
  | 'early_traction'
  | 'scaling'

export interface ProfileFile {
  id: number
  original_name: string
  mime_type: string
  size: number
  created_at: string
}

export interface StartupProfile {
  id: number
  idea: string | null
  problem: string | null
  solution: string | null
  customer: string | null
  stage: StartupStage | null
  team: string | null
  traction: string | null
  challenges: string | null
  goals: string | null
  files: ProfileFile[]
  updated_at: string
}

export type CollaboratorRole = 'editor' | 'viewer'

export interface ProjectCollaborator {
  id: number
  name: string
  email: string
  role: CollaboratorRole
}

export interface Project {
  id: number
  name: string
  logo: string | null
  description: string | null
  owner: User
  last_modified_by: User | null
  collaborators?: ProjectCollaborator[]
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data: T[]
}

export interface ValidationErrors {
  message: string
  errors: Record<string, string[]>
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd C:\Users\User\Desktop\MARSA_Project\frontend
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/types/api.ts
git commit -m "feat: add TypeScript API types"
```

---

## Task 4 [CLAUDE]: Auth Storage Helpers + Axios API Client

**Files:**
- Create: `frontend/lib/auth.ts`
- Create: `frontend/lib/api.ts`

- [ ] **Step 1: Create `lib/auth.ts`**

Create `frontend/lib/auth.ts`:

```typescript
import Cookies from 'js-cookie'
import type { User } from '@/types/api'

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

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = Cookies.get(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function storeUser(user: User): void {
  Cookies.set(USER_KEY, JSON.stringify(user), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
```

- [ ] **Step 2: Create `lib/api.ts`**

Create `frontend/lib/api.ts`:

```typescript
import axios, { AxiosError } from 'axios'
import { getToken } from '@/lib/auth'
import type { ValidationErrors } from '@/types/api'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function isValidationError(
  error: unknown
): error is AxiosError<ValidationErrors> {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 422 &&
    typeof error.response.data?.errors === 'object'
  )
}

export function getFirstError(
  error: unknown,
  field: string
): string | undefined {
  if (isValidationError(error)) {
    return error.response?.data.errors[field]?.[0]
  }
  return undefined
}

export default api
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/auth.ts frontend/lib/api.ts
git commit -m "feat: add auth cookie helpers and Axios API client"
```

---

## Task 5 [CLAUDE]: AuthContext + useAuth Hook

**Files:**
- Create: `frontend/contexts/AuthContext.tsx`
- Create: `frontend/hooks/useAuth.ts`

- [ ] **Step 1: Create `AuthContext.tsx`**

Create `frontend/contexts/AuthContext.tsx`:

```typescript
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
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    })
    setToken(res.data.token)
    storeUser(res.data.user)
    setUser(res.data.user)
    router.push('/app/projects')
  }, [router])

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
```

- [ ] **Step 2: Create `hooks/useAuth.ts`**

Create `frontend/hooks/useAuth.ts`:

```typescript
'use client'

import { useAuthContext } from '@/contexts/AuthContext'

export function useAuth() {
  return useAuthContext()
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/contexts/AuthContext.tsx frontend/hooks/useAuth.ts
git commit -m "feat: add AuthContext and useAuth hook"
```

---

## Task 6 [CLAUDE]: Next.js Middleware (Route Protection)

**Files:**
- Create: `frontend/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `frontend/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/about', '/pricing', '/contact']
const AUTH_PATHS = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('marsa_token')?.value

  const isAppRoute = pathname.startsWith('/app')
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isAppRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/app/projects', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/app/:path*',
    '/login',
    '/register',
  ],
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/middleware.ts
git commit -m "feat: add Next.js middleware for route protection"
```

---

## Task 7 [CLAUDE]: useProjects Hook

**Files:**
- Create: `frontend/hooks/useProjects.ts`

- [ ] **Step 1: Create `hooks/useProjects.ts`**

Create `frontend/hooks/useProjects.ts`:

```typescript
'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import type { Project } from '@/types/api'

interface UseProjectsResult {
  projects: Project[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ data: Project[] }>('/projects')
      setProjects(res.data.data)
    } catch {
      setError('Failed to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, isLoading, error, refetch: fetchProjects }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/hooks/useProjects.ts
git commit -m "feat: add useProjects data-fetching hook"
```

---

## Task 8 [CLAUDE]: Wire AuthProvider into Root Layout

**Files:**
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Read Cursor's layout**

Read `frontend/app/layout.tsx` to see what Cursor produced.

- [ ] **Step 2: Add AuthProvider**

Wrap the existing ThemeProvider content with AuthProvider. The file should look like:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MARSA — Build Your Startup With Clarity',
  description:
    'A structured workspace for entrepreneurs — from idea to execution.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={['dark', 'light']}
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

If Cursor's layout has different imports (fonts, metadata), keep those and only add the `AuthProvider` wrapper and its import.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/layout.tsx
git commit -m "feat: add AuthProvider to root layout"
```

---

## Task 9 [CLAUDE]: Wire Login Page

**Files:**
- Modify: `frontend/app/(auth)/login/page.tsx`

- [ ] **Step 1: Read Cursor's login page**

Read `frontend/app/(auth)/login/page.tsx`.

- [ ] **Step 2: Replace with wired version**

Write `frontend/app/(auth)/login/page.tsx` — keep Cursor's visual structure but add real form handling:

```typescript
'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getFirstError, isValidationError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      if (isValidationError(err)) {
        setError(
          getFirstError(err, 'email') ??
          getFirstError(err, 'password') ??
          'Invalid credentials.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your MARSA workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/'(auth)'/login/page.tsx
git commit -m "feat: wire login form to auth API"
```

---

## Task 10 [CLAUDE]: Wire Register Page

**Files:**
- Modify: `frontend/app/(auth)/register/page.tsx`

- [ ] **Step 1: Read Cursor's register page**

Read `frontend/app/(auth)/register/page.tsx`.

- [ ] **Step 2: Replace with wired version**

Write `frontend/app/(auth)/register/page.tsx`:

```typescript
'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getFirstError, isValidationError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setIsLoading(true)
    try {
      await register(name, email, password)
    } catch (err) {
      if (isValidationError(err)) {
        const errs = err.response?.data.errors ?? {}
        const flat: Record<string, string> = {}
        for (const [field, messages] of Object.entries(errs)) {
          if (messages[0]) flat[field] = messages[0]
        }
        setFieldErrors(flat)
      } else {
        setFieldErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>Start building your startup with MARSA</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <p className="text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            {fieldErrors.general && (
              <p className="text-sm text-destructive">{fieldErrors.general}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/'(auth)'/register/page.tsx
git commit -m "feat: wire register form to auth API"
```

---

## Task 11 [CLAUDE]: Projects List Page

**Files:**
- Modify: `frontend/app/app/projects/page.tsx`

- [ ] **Step 1: Write the projects page**

Write `frontend/app/app/projects/page.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Project } from '@/types/api'

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/app/projects/${project.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">{project.name}</CardTitle>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(project.updated_at).toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>
    </Link>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const { projects, isLoading, error, refetch } = useProjects()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <p className="text-muted-foreground">
            Welcome back{user ? `, ${user.name}` : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/projects/new">New Project</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="mb-4 text-muted-foreground">
            Create your first project to get started
          </p>
          <Button asChild>
            <Link href="/app/projects/new">Create Project</Link>
          </Button>
        </div>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/app/projects/page.tsx
git commit -m "feat: add live projects list page"
```

---

## Task 12 [CLAUDE]: Wire Topbar — User Display + Logout

**Files:**
- Create: `frontend/components/layout/UserMenu.tsx`
- Modify: `frontend/components/layout/Topbar.tsx`

- [ ] **Step 1: Create `UserMenu.tsx`**

Create `frontend/components/layout/UserMenu.tsx`:

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => void logout()}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Read Cursor's Topbar and add UserMenu**

Read `frontend/components/layout/Topbar.tsx`. Find where the right side of the topbar renders (typically near the theme toggle). Add `<UserMenu />` import and place it next to the theme toggle:

```typescript
import { UserMenu } from '@/components/layout/UserMenu'

// Inside the Topbar JSX, in the right section:
<div className="flex items-center gap-2">
  {/* keep Cursor's theme toggle here */}
  <UserMenu />
</div>
```

Preserve all of Cursor's existing JSX — only add the UserMenu import and component placement.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/components/layout/UserMenu.tsx frontend/components/layout/Topbar.tsx
git commit -m "feat: add user menu with logout to workspace Topbar"
```

---

## Task 13 [CLAUDE]: Unit Tests

**Files:**
- Create: `frontend/__tests__/lib/auth.test.ts`
- Create: `frontend/__tests__/hooks/useProjects.test.tsx`

- [ ] **Step 1: Write auth helper tests**

Create `frontend/__tests__/lib/auth.test.ts`:

```typescript
import Cookies from 'js-cookie'
import {
  clearToken,
  getStoredUser,
  getToken,
  setToken,
  storeUser,
} from '@/lib/auth'

jest.mock('js-cookie')

const mockCookies = Cookies as jest.Mocked<typeof Cookies>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getToken', () => {
  it('returns token when cookie exists', () => {
    mockCookies.get.mockReturnValue('abc123')
    expect(getToken()).toBe('abc123')
  })

  it('returns null when cookie does not exist', () => {
    mockCookies.get.mockReturnValue(undefined)
    expect(getToken()).toBeNull()
  })
})

describe('setToken', () => {
  it('sets the token cookie', () => {
    setToken('mytoken')
    expect(mockCookies.set).toHaveBeenCalledWith(
      'marsa_token',
      'mytoken',
      expect.objectContaining({ expires: 30 })
    )
  })
})

describe('clearToken', () => {
  it('removes both token and user cookies', () => {
    clearToken()
    expect(mockCookies.remove).toHaveBeenCalledWith('marsa_token')
    expect(mockCookies.remove).toHaveBeenCalledWith('marsa_user')
  })
})

describe('storeUser / getStoredUser', () => {
  it('stores and retrieves a user', () => {
    const user = { id: 1, name: 'Jane', email: 'j@j.com', created_at: '' }
    mockCookies.get.mockReturnValue(JSON.stringify(user))
    expect(getStoredUser()).toEqual(user)
  })

  it('returns null on malformed JSON', () => {
    mockCookies.get.mockReturnValue('not-json')
    expect(getStoredUser()).toBeNull()
  })

  it('returns null when cookie is absent', () => {
    mockCookies.get.mockReturnValue(undefined)
    expect(getStoredUser()).toBeNull()
  })
})
```

- [ ] **Step 2: Write useProjects hook tests**

Create `frontend/__tests__/hooks/useProjects.test.tsx`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from '@/hooks/useProjects'
import api from '@/lib/api'

jest.mock('@/lib/api')

const mockApi = api as jest.Mocked<typeof api>

describe('useProjects', () => {
  it('returns projects on success', async () => {
    const projects = [
      {
        id: 1,
        name: 'Test Project',
        logo: null,
        description: null,
        owner: { id: 1, name: 'Jane', email: 'j@j.com', created_at: '' },
        last_modified_by: null,
        created_at: '',
        updated_at: '',
      },
    ]
    mockApi.get.mockResolvedValueOnce({ data: { data: projects } })

    const { result } = renderHook(() => useProjects())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.projects).toEqual(projects)
    expect(result.current.error).toBeNull()
  })

  it('sets error on API failure', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useProjects())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load projects. Please try again.')
    expect(result.current.projects).toEqual([])
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/__tests__/
git commit -m "test: add auth helper and useProjects hook unit tests"
```

---

## Task 14 [CLAUDE]: Smoke Test — End-to-End Login Flow

- [ ] **Step 1: Start the backend**

In a separate terminal:
```bash
cd C:\Users\User\Desktop\MARSA_Project\backend
php artisan serve --port=8000
```

- [ ] **Step 2: Start the frontend**

```bash
cd C:\Users\User\Desktop\MARSA_Project\frontend
npm run dev
```

Expected: Server starts at `http://localhost:3000`.

- [ ] **Step 3: Verify route protection**

Open `http://localhost:3000/app/projects` in the browser without being logged in.

Expected: Redirected to `http://localhost:3000/login?from=/app/projects`.

- [ ] **Step 4: Register a new user**

Go to `http://localhost:3000/register`. Fill in:
- Name: `Test Founder`
- Email: `founder@test.com`
- Password: `password123`

Click "Create account".

Expected: Redirected to `/app/projects`, which shows "No projects yet" with a "Create Project" button.

- [ ] **Step 5: Verify auth persistence**

Refresh the page at `/app/projects`.

Expected: Still logged in, projects page loads (not redirected to login).

- [ ] **Step 6: Test logout**

Click the logout button in the workspace (Topbar).

Expected: Redirected to `/login`. Attempting to visit `/app/projects` redirects back to `/login`.

- [ ] **Step 7: Verify TypeScript and lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: Zero errors, zero new warnings.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: complete frontend foundation — auth, middleware, API client, projects list"
```

---

## Summary

After completing all tasks you will have:

- A running Next.js 14 app at `http://localhost:3000`
- Token-based auth with cookie storage (readable by both middleware and client)
- Route protection: unauthenticated `/app/*` → `/login`, authenticated `/login` → `/app/projects`
- Login and Register pages fully wired to the Laravel backend
- Live projects list pulling real data from the API
- AuthContext providing `user`, `login`, `register`, `logout` to all `/app/*` pages
- Unit tests for auth helpers and `useProjects` hook
- TypeScript zero-error baseline
