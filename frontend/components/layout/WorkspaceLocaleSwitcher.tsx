"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { cn } from "@/components/utils"
import { routing } from "@/i18n/routing"

const COOKIE_NAME = "NEXT_LOCALE"
const ONE_YEAR_SEC = 60 * 60 * 24 * 365

type AppLocale = "en" | "ar"

function persistCookieLocale(locale: AppLocale) {
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=${ONE_YEAR_SEC};SameSite=Lax`
}

export default function WorkspaceLocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const t = useTranslations("Workspace.aria")

  const selectLocale = (loc: AppLocale) => {
    if (loc === locale) return
    persistCookieLocale(loc)
    router.refresh()
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-background/60 p-0.5 text-xs font-semibold shadow-sm backdrop-blur",
        className
      )}
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          className={cn(
            "rounded-[10px] px-2.5 py-1.5 transition-colors",
            locale === loc
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => selectLocale(loc as AppLocale)}
        >
          {loc === "ar" ? "ع" : "EN"}
        </button>
      ))}
    </div>
  )
}
