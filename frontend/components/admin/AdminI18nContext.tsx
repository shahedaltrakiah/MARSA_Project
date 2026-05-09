"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { adminMessages, type AdminLocale, type AdminMsg } from "@/components/admin/admin-messages"

const STORAGE_KEY = "marsa_admin_locale"

type Ctx = {
  locale: AdminLocale
  setLocale: (loc: AdminLocale) => void
  t: AdminMsg
}

const AdminI18nContext = createContext<Ctx | null>(null)

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>("en")

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === "ar" || raw === "en") {
        setLocaleState(raw)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setLocale = useCallback((loc: AdminLocale) => {
    setLocaleState(loc)
    try {
      localStorage.setItem(STORAGE_KEY, loc)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useMemo(() => adminMessages[locale], [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>
}

export function useAdminI18n(): Ctx {
  const ctx = useContext(AdminI18nContext)
  if (!ctx) {
    throw new Error("useAdminI18n must be used within AdminI18nProvider")
  }
  return ctx
}
