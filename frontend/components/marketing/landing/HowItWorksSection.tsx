"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { FolderOpen, PackageCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react"

import SectionWrapper from "@/components/marketing/ux/SectionWrapper"

const STEP_ICONS = [
  <FolderOpen key="0" className="size-5" />,
  <Truck key="1" className="size-5" />,
  <ShieldCheck key="2" className="size-5" />,
  <RefreshCcw key="3" className="size-5" />,
  <PackageCheck key="4" className="size-5" />,
]

const STEP_COLORS = ["#6C5CE7", "#4B7BFF", "#1A9FE0", "#00BAC5", "#00C48C"] as const

const LEAF_PATH =
  "M20 10H85C101 10 110 19 110 35V78C110 94 101 103 85 103H58C47 103 40 108 35 116C32 121 25 121 22 116C14 103 10 91 10 76V35C10 19 19 10 35 10H20Z"

export default function HowItWorksSection() {
  const t = useTranslations("HowItWorks")
  const [active, setActive] = React.useState(0)

  const steps = React.useMemo(() => {
    const raw = t.raw("steps") as { step: string; title: string; desc: string }[]
    return raw.map((s, i) => ({
      ...s,
      icon: STEP_ICONS[i],
      color: STEP_COLORS[i] ?? "#00BAC5",
    }))
  }, [t])

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setActive((n) => (n + 1) % steps.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [steps.length])

  return (
    <SectionWrapper eyebrow={t("eyebrow")} title={t("title")} description={t("description")}>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="relative mx-auto max-w-6xl p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]"
          >
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[color-mix(in_oklab,var(--secondary)_14%,transparent)] blur-3xl" />
            <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] blur-3xl" />
          </div>

          <div className="relative grid grid-cols-5 gap-4">
            {steps.map((s, idx) => {
              const isActive = active === idx
              return (
                <motion.button
                  key={s.step}
                  type="button"
                  onMouseEnter={() => setActive(idx)}
                  onFocus={() => setActive(idx)}
                  className={[
                    "relative rounded-2xl border bg-background/35 p-4 text-start",
                    "transition hover:bg-background/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  ].join(" ")}
                  animate={{
                    y: isActive ? -3 : 0,
                    borderColor: isActive ? `${s.color}66` : "color-mix(in_oklab,var(--border)_92%,transparent)",
                    boxShadow: isActive ? `0 18px 46px ${s.color}24` : "0 8px 22px rgba(0,0,0,0.14)",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-lg font-semibold" style={{ color: s.color }}>
                      {s.step}
                    </div>
                    <div
                      className="inline-flex size-10 items-center justify-center rounded-full border bg-background"
                      style={{ borderColor: `${s.color}66`, color: s.color }}
                    >
                      {s.icon}
                    </div>
                  </div>
                  <div className="mt-2 font-semibold">{s.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>

                  {/* connector down */}
                  <motion.div
                    aria-hidden
                    className="absolute left-1/2 top-full mt-2 h-10 w-px -translate-x-1/2"
                    animate={{ opacity: isActive ? 1 : 0.55 }}
                    style={{
                      background: `linear-gradient(to bottom, ${s.color}cc, transparent)`,
                    }}
                  />
                </motion.button>
              )
            })}
          </div>

          <div className="relative mt-10 grid grid-cols-5 items-center gap-4">
            {steps.map((s, idx) => {
              const isActive = active === idx
              return (
                <motion.div
                  key={s.step}
                  className="relative flex items-center justify-center"
                  animate={{ opacity: isActive ? 1 : 0.65, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                >
                  <svg width="150" height="150" viewBox="0 0 120 120" aria-hidden>
                    <path
                      d={LEAF_PATH}
                      fill={s.color}
                      style={{
                        filter: isActive
                          ? `drop-shadow(0 22px 40px ${s.color}66)`
                          : `drop-shadow(0 14px 26px ${s.color}3a)`,
                      }}
                    />
                  </svg>
                  <div className="pointer-events-none absolute top-[56px] text-white">{s.icon}</div>

                  {/* subtle right flow hint */}
                  {idx < steps.length - 1 ? (
                    <motion.div
                      aria-hidden
                      className="absolute -right-3 top-1/2 h-px w-6"
                      animate={{ opacity: isActive ? 1 : 0.45 }}
                      style={{
                        background: `linear-gradient(to right, transparent, ${s.color}aa)`,
                      }}
                    />
                  ) : null}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="p-1">
          <div className="space-y-4">
            {steps.map((s, idx) => (
              <motion.div
                key={s.step}
                className="rounded-2xl border bg-background/40 p-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.35, ease: "easeOut", delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold" style={{ color: s.color }}>
                    {s.step}
                  </div>
                  <div
                    className="inline-flex size-10 items-center justify-center rounded-full border bg-background"
                    style={{ borderColor: `${s.color}66`, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <div className="font-semibold">{s.title}</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
