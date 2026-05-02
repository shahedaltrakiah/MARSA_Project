"use client"

import { useMemo, useRef } from "react"
import { useLocale, useTranslations } from "next-intl"
import { AlertTriangle, Boxes, LayoutGrid, Wallet } from "lucide-react"
import { motion, useInView } from "framer-motion"

import SectionWrapper from "@/components/marketing/ux/SectionWrapper"
import { cn } from "@/components/utils"

/** Lightened mixes so icons read on dark surfaces (pure Anchor Blue (#002D62) disappears on near-black). */
const ACCENTS = [
  "var(--marsa-action-teal)",
  "color-mix(in oklab, var(--marsa-action-teal) 82%, white)",
  "color-mix(in oklab, var(--marsa-anchor-blue) 44%, white)",
  "color-mix(in oklab, var(--marsa-action-teal) 68%, white)",
] as const

const ICONS = [
  AlertTriangle,
  LayoutGrid,
  Wallet,
  Boxes,
] as const

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28 },
  },
}

function BubbleIcon({
  accent,
  Icon,
  isRtl,
}: {
  accent: string
  Icon: (typeof ICONS)[number]
  isRtl: boolean
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center",
        isRtl && "flex-row-reverse"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2.5 rounded-full border-2 border-dashed opacity-[0.38]"
        style={{ borderColor: accent }}
      />
      <div
        className="relative z-[1] flex size-[3.35rem] items-center justify-center rounded-full border-[3px] bg-background shadow-sm"
        style={{ borderColor: accent, color: accent }}
      >
        <Icon className="size-[1.35rem]" strokeWidth={2.25} aria-hidden />
      </div>
      <span
        aria-hidden
        className={cn(
          "relative z-[1] h-0 w-0 border-y-[11px] border-y-transparent",
          isRtl ? "-me-px border-r-[13px]" : "-ms-px border-l-[13px]"
        )}
        style={
          isRtl
            ? { borderRightColor: accent }
            : { borderLeftColor: accent }
        }
      />
    </div>
  )
}

export default function ProblemSection() {
  const t = useTranslations("Problem")
  const locale = useLocale()
  const isRtl = locale === "ar"
  const cards = useMemo(() => t.raw("cards") as { title: string; description: string }[], [t])

  const gridRef = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { margin: "-10% 0px", once: true })

  return (
    <SectionWrapper eyebrow={t("eyebrow")} title={t("title")} description={t("description")}>
      <motion.div
        ref={gridRef}
        className="grid gap-4 sm:grid-cols-2 sm:gap-5"
        variants={containerVariants}
        initial="hidden"
        animate={gridInView ? "show" : "hidden"}
      >
        {cards.map((c, idx) => {
          const accent = ACCENTS[idx] ?? ACCENTS[0]
          const Icon = ICONS[idx] ?? ICONS[0]
          return (
            <motion.div
              key={c.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="will-change-transform"
            >
              <div
                className={cn(
                  "group flex h-full min-h-[6.5rem] items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-shadow duration-300 sm:gap-4 sm:p-5",
                  "hover:border-[color-mix(in_oklab,var(--secondary)_35%,var(--border))] hover:shadow-md",
                  "rtl:flex-row-reverse"
                )}
              >
                <BubbleIcon accent={accent} Icon={Icon} isRtl={isRtl} />

                <div className="min-w-0 flex-1 text-start">
                  <p className="font-semibold leading-snug text-foreground">{c.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </SectionWrapper>
  )
}
