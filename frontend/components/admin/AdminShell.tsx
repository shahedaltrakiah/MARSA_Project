"use client"

import type { ReactNode } from "react"

import { AdminI18nProvider, useAdminI18n } from "@/components/admin/AdminI18nContext"
import AdminSidebar from "@/components/admin/AdminSidebar"

function AdminShellInner({ children }: { children: ReactNode }) {
  const { locale } = useAdminI18n()
  const rtl = locale === "ar"

  return (
    <div
      className="flex min-h-screen"
      dir={rtl ? "rtl" : "ltr"}
      lang={locale}
    >
      <AdminSidebar />
      <main className="relative flex-1 overflow-y-auto bg-gradient-to-br from-primary/[0.07] via-background to-teal-500/[0.06] p-6 sm:p-8 lg:p-10 dark:from-primary/[0.12] dark:to-teal-950/40">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminI18nProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminI18nProvider>
  )
}
