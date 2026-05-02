"use client"

import { useTranslations } from "next-intl"

import { Reveal } from "@/components/marketing/motion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"
import { Link } from "@/i18n/navigation"

/** Bottom-of-page banner (dark strip + teal primary / ghost secondary). Uses `Cta` messages. */
export function MarketingPageCta({ className }: { className?: string }) {
  const t = useTranslations("Cta")

  return (
    <section className={cn("w-full", className)}>
      <Reveal>
        <div className="flex flex-col gap-8 rounded-3xl bg-[#0b1020] px-6 py-8 shadow-lg ring-1 ring-white/10 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 dark:bg-[#070a12]">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-wide text-[color-mix(in_oklab,var(--primary)_72%,white)]">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 text-balance font-[var(--font-heading)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-white/65">
              {t("description")}
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:justify-end">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 w-full justify-center rounded-full border-0 bg-[var(--marsa-action-teal)] px-6 text-base font-semibold text-black shadow-none hover:bg-[color-mix(in_oklab,var(--marsa-action-teal)_88%,black)] hover:text-black focus-visible:ring-[color-mix(in_oklab,var(--marsa-action-teal)_45%,transparent)] sm:w-auto"
              )}
            >
              {t("primary")}
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 w-full justify-center rounded-full border-white/25 bg-white/10 text-white shadow-none backdrop-blur hover:bg-white/15 hover:text-white dark:border-white/25 dark:bg-white/10 dark:hover:bg-white/15 sm:w-auto"
              )}
            >
              {t("secondary")}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
