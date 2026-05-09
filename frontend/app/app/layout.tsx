import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { hasLocale } from "next-intl"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"

import WorkspaceChrome from "@/components/layout/WorkspaceChrome"
import { LocaleDirection } from "@/components/providers/LocaleDirection"
import { routing } from "@/i18n/routing"

const LOCALE_COOKIE = "NEXT_LOCALE"

export default async function AppShell({ children }: { children: ReactNode }) {
  const store = await cookies()
  const raw = store.get(LOCALE_COOKIE)?.value
  const locale = hasLocale(routing.locales, raw) ? raw! : routing.defaultLocale
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleDirection />
      <div
        data-marsa-app-shell
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
      >
        <WorkspaceChrome>{children}</WorkspaceChrome>
      </div>
    </NextIntlClientProvider>
  )
}

