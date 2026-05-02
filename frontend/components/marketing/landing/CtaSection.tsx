"use client"

import { useTranslations } from "next-intl"

import { Reveal } from "@/components/marketing/motion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"
import { Link } from "@/i18n/navigation"

export default function CtaSection() {
  const t = useTranslations("Cta")

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <Reveal>
        <div className="grid grid-cols-1 gap-6 rounded-3xl border bg-card/60 p-6 shadow-sm backdrop-blur sm:grid-cols-3 sm:p-10">
          <div className="min-w-0 sm:col-span-2">
            <div className="text-sm font-semibold tracking-wide">
              <span className="bg-[linear-gradient(90deg,color-mix(in_oklab,var(--primary)_88%,white),color-mix(in_oklab,var(--secondary)_88%,white))] bg-clip-text text-transparent">
                {t("eyebrow")}
              </span>
            </div>
            <h3 className="mt-2 text-balance font-[var(--font-heading)] text-2xl font-semibold tracking-tight">
              {t("title")}
            </h3>
            <p className="mt-3 text-pretty text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full shrink-0 sm:w-auto")}
            >
              {t("primary")}
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full shrink-0 sm:w-auto")}
            >
              {t("secondary")}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
