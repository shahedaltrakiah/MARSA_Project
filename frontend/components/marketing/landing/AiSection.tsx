"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Brain, MoveRight, Sparkles } from "lucide-react"

import { Reveal } from "@/components/marketing/motion"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"
import { Link } from "@/i18n/navigation"

export default function AiSection() {
  const t = useTranslations("Ai")
  const suggestions = t.raw("suggestions") as string[]
  const [aiStep, setAiStep] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => setAiStep((v) => (v + 1) % suggestions.length), 2600)
    return () => window.clearInterval(id)
  }, [suggestions.length])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="text-sm font-semibold tracking-wide">
            <span className="bg-[linear-gradient(90deg,color-mix(in_oklab,var(--primary)_88%,white),color-mix(in_oklab,var(--secondary)_88%,white))] bg-clip-text text-transparent">
              {t("eyebrow")}
            </span>
          </div>
          <h2 className="mt-2 text-balance font-[var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">{t("body")}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "group w-full sm:w-auto transition-transform hover:-translate-y-0.5"
              )}
            >
              {t("ctaPrimary")}{" "}
              <MoveRight className="ml-2 inline size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/features"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full sm:w-auto transition-transform hover:-translate-y-0.5"
              )}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border bg-card/50 p-5 shadow-sm backdrop-blur">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent)]"
            >
              <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--secondary)_16%,transparent)] blur-3xl" />
              <div className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--primary)_16%,transparent)] blur-3xl" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="text-sm font-medium">{t("exampleLabel")}</div>
              <Badge variant="secondary" className="gap-2">
                <Sparkles className="size-4" />
                {t("aiBadge")}
              </Badge>
            </div>
            <Separator className="relative my-4" />

            <div className="relative space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-2xl border bg-background/70 p-4 shadow-sm">
                <div className="inline-flex size-9 items-center justify-center rounded-2xl border bg-card">
                  <Brain className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{t("nextStep")}</div>
                    <div className="text-xs text-muted-foreground">{t("autoUpdates")}</div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{suggestions[aiStep]}</div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full w-1/3 rounded-full bg-[linear-gradient(90deg,color-mix(in_oklab,var(--primary)_75%,white),color-mix(in_oklab,var(--secondary)_75%,white))] transition-transform duration-[2600ms] ease-linear"
                      style={{ transform: `translateX(${aiStep * 100}%)` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="text-xs font-medium text-muted-foreground">{t("whyTitle")}</div>
                <div className="mt-2 text-sm text-muted-foreground">{t("whyBody")}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
