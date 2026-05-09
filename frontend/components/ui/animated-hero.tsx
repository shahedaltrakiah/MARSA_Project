"use client"

import { useEffect, useMemo, useState } from "react"
import { MoveRight, PhoneCall, Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { HeroAmbientBackdrop } from "@/components/marketing/HeroAmbientBackdrop"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"
import { Link } from "@/i18n/navigation"

type HeroProps = {
  /** Fills the viewport below the fixed marketing header so the next section starts after scroll. */
  fillViewport?: boolean
}

const contentEase = [0.22, 1, 0.36, 1] as const

function Hero({ fillViewport }: HeroProps = {}) {
  const t = useTranslations("Hero")
  const reduceMotion = useReducedMotion() ?? false
  const titles = useMemo(() => t.raw("rotating") as string[], [t])
  const [activeTitle, setActiveTitle] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setActiveTitle((n) => (n + 1) % titles.length)
    }, 1200)
    return () => window.clearInterval(id)
  }, [titles.length, reduceMotion])

  useEffect(() => {
    setActiveTitle(0)
  }, [titles])

  const itemFade = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.55, ease: contentEase },
    },
  }

  const lineReveal = {
    hidden: reduceMotion ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.85 },
    show: {
      opacity: 1,
      scaleX: 1,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.65, ease: contentEase },
    },
  }

  return (
    <section
      className={cn(
        "relative w-full overflow-x-clip px-4",
        fillViewport
          ? "flex min-h-[calc(100dvh-5rem)] flex-col justify-center pb-12 pt-8 sm:min-h-[calc(100dvh-6rem)] sm:pb-16 sm:pt-10"
          : "pb-8 pt-4 sm:pb-10 sm:pt-5"
      )}
    >
      {/* Full-bleed layer (was clipped to max-w-6xl and caused a vertical “seam” vs viewport edges) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 top-0 -z-10 w-[100vw] min-w-full max-w-[100vw] -translate-x-1/2 overflow-hidden [mask-image:radial-gradient(ellipse_110%_95%_at_50%_24%,black_50%,transparent_92%)]"
      >
        <div className="absolute inset-0 top-0 bg-[linear-gradient(185deg,color-mix(in_oklab,var(--secondary)_8%,transparent)_0%,transparent_88%)]" />
        <HeroAmbientBackdrop />
      </div>

      <motion.div
        className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: reduceMotion ? undefined : { staggerChildren: 0.09, delayChildren: 0.06 },
          },
        }}
      >
        <motion.div
          variants={itemFade}
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm"
        >
          <Sparkles className="size-3.5 shrink-0 text-[color-mix(in_oklab,var(--secondary)_90%,white)]" aria-hidden />
          {t("badge")}
        </motion.div>

        <motion.div
          variants={{
            hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
            show: {
              opacity: 1,
              y: 0,
              transition: reduceMotion ? { duration: 0 } : { duration: 0.58, ease: contentEase },
            },
          }}
          className="space-y-5"
        >
          <h1 className="text-balance font-[var(--font-heading)] text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] md:text-6xl">
            <span className="text-foreground">{t("headlineStart")}</span>{" "}
            {reduceMotion ? (
              <span className="bg-[linear-gradient(115deg,color-mix(in_oklab,var(--secondary)_92%,white),color-mix(in_oklab,var(--primary)_78%,white))] bg-clip-text text-transparent">
                {titles[0] ?? ""}
              </span>
            ) : (
              <span className="relative inline-grid [grid-template-areas:'slot'] place-items-center align-baseline">
                {titles.map((title, index) => (
                  <motion.span
                    key={`${title}-${index}`}
                    className="col-start-1 row-start-1 [grid-area:slot] inline-block max-w-[calc(100vw-2.5rem)] text-pretty font-[var(--font-heading)] font-semibold sm:max-w-[min(36rem,90vw)]"
                    initial={{ opacity: 0, y: -28, filter: "blur(8px)" }}
                    transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    animate={
                      activeTitle === index
                        ? { y: 0, opacity: 1, filter: "blur(0px)" }
                        : {
                            y: activeTitle > index ? -48 : 48,
                            opacity: 0,
                            filter: "blur(10px)",
                          }
                    }
                    aria-hidden={activeTitle !== index}
                  >
                    <span className="bg-[linear-gradient(115deg,color-mix(in_oklab,var(--secondary)_92%,white),color-mix(in_oklab,var(--primary)_78%,white))] bg-clip-text text-transparent">
                      {title}
                    </span>
                  </motion.span>
                ))}
              </span>
            )}
            <span className="text-foreground">{t("headlineEnd")}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("sub")}
          </p>
        </motion.div>

        <motion.div
          variants={itemFade}
          className="flex w-full max-w-lg flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center"
        >
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "group h-11 min-w-[11rem] gap-2 px-8 transition-transform hover:-translate-y-0.5"
            )}
          >
            {t("ctaPrimary")}{" "}
            <MoveRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-11 min-w-[11rem] px-8 transition-transform hover:-translate-y-0.5"
            )}
          >
            {t("ctaSecondary")} <PhoneCall className="size-4" />
          </Link>
        </motion.div>

        <motion.div
          variants={lineReveal}
          aria-hidden
          className="mt-2 h-px w-full max-w-sm origin-center bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--secondary)_45%,transparent),transparent)] sm:mt-4"
        />
      </motion.div>
    </section>
  )
}

export { Hero }
