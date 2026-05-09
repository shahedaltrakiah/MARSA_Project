"use client"

import { useLocale } from "next-intl"

import { cn } from "@/components/utils"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-background/60 p-0.5 text-xs font-semibold shadow-sm backdrop-blur",
        className
      )}
      role="group"
      aria-label="Language"
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
          onClick={() => router.replace(pathname, { locale: loc })}
        >
          {loc === "ar" ? "ع" : "EN"}
        </button>
      ))}
    </div>
  )
}
