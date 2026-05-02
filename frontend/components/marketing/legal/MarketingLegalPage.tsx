import type { ReactNode } from "react"

import { cn } from "@/components/utils"

type Props = {
  title: string
  lastUpdated: string
  locale: string
  /** When true (default), Arabic locale shows a banner that the legal text is English-only. Set false when an Arabic document is provided. */
  showEnglishOnlyBanner?: boolean
  englishOnlyNotice: string
  children: ReactNode
}

export function MarketingLegalPage({
  title,
  lastUpdated,
  locale,
  showEnglishOnlyBanner = true,
  englishOnlyNotice,
  children,
}: Props) {
  return (
    <section
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale === "ar" ? "ar" : "en"}
      className={cn("relative isolate overflow-hidden bg-background pb-3 pt-1 sm:pb-6 sm:pt-2")}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="marsa-grid absolute inset-0 opacity-[0.28] mask-[radial-gradient(ellipse_90%_55%_at_50%_0%,black_15%,transparent_70%)] dark:opacity-[0.18]" />
        <div className="absolute inset-x-0 top-0 h-[min(42vh,280px)] bg-[radial-gradient(ellipse_95%_55%_at_50%_-5%,color-mix(in_oklab,var(--secondary)_10%,transparent),transparent)]" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:px-5 sm:py-8 lg:py-9">
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md ring-1 ring-border/40",
            "dark:shadow-lg dark:shadow-black/20"
          )}
        >
          <header className="relative border-b border-border/55 bg-gradient-to-br from-muted/40 via-card to-card px-5 py-5 sm:px-6 sm:py-6 dark:from-muted/20 dark:via-card dark:to-card">
            <div
              className="absolute start-0 top-0 h-full w-0.5 bg-gradient-to-b from-secondary to-primary/60"
              aria-hidden
            />
            <div className="relative ps-3.5 sm:ps-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-secondary/25 bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary dark:bg-secondary/12">
                  MARSA
                </span>
              </div>
              <h1 className="text-balance font-[var(--font-heading)] text-xl font-semibold tracking-tight text-foreground sm:text-2xl sm:leading-snug">
                {title}
              </h1>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{lastUpdated}</p>
              {locale === "ar" && showEnglishOnlyBanner ? (
                <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-xs leading-relaxed text-muted-foreground dark:border-amber-400/20 dark:bg-amber-400/[0.05] sm:text-sm">
                  {englishOnlyNotice}
                </p>
              ) : null}
            </div>
          </header>

          <div className="bg-card px-5 py-6 sm:px-6 sm:py-7">{children}</div>
        </div>
      </div>
    </section>
  )
}
