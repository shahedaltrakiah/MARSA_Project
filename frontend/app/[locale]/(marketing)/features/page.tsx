"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import {
  Bot,
  CircleDollarSign,
  ClipboardCheck,
  LayoutGrid,
  ListChecks,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  Waypoints,
} from "lucide-react"

import { MarketingPageCta } from "@/components/marketing/MarketingPageCta"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const SECTION_ICONS = [
  <ScanSearch key="i0" className="size-4" />,
  <LayoutGrid key="i1" className="size-4" />,
  <CircleDollarSign key="i2" className="size-4" />,
  <ListChecks key="i3" className="size-4" />,
  <Bot key="i4" className="size-4" />,
  <ShieldCheck key="i5" className="size-4" />,
]

const BULLET_ICONS: ReactNode[][] = [
  [<ClipboardCheck key="b" className="size-3.5" />, <TestTube2 key="b" className="size-3.5" />, <Waypoints key="b" className="size-3.5" />],
  [<Sparkles key="b" className="size-3.5" />, <Target key="b" className="size-3.5" />, <LayoutGrid key="b" className="size-3.5" />],
  [<Target key="b" className="size-3.5" />, <TestTube2 key="b" className="size-3.5" />, <Target key="b" className="size-3.5" />],
  [<ClipboardCheck key="b" className="size-3.5" />, <Target key="b" className="size-3.5" />, <Waypoints key="b" className="size-3.5" />],
  [<Sparkles key="b" className="size-3.5" />, <ScanSearch key="b" className="size-3.5" />, <Waypoints key="b" className="size-3.5" />],
  [<ShieldCheck key="b" className="size-3.5" />, <LayoutGrid key="b" className="size-3.5" />, <ShieldCheck key="b" className="size-3.5" />],
]

export default function FeaturesPage() {
  const t = useTranslations("Features")
  const sections = t.raw("sections") as {
    title: string
    description: string
    bullets: string[]
  }[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <Badge variant="secondary">{t("badge")}</Badge>
        <h1 className="mt-4 text-balance font-[var(--font-heading)] text-4xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">{t("description")}</p>
      </div>

      <Separator className="my-10" />

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((f, idx) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.04 }}
            whileHover={{ y: -4 }}
          >
            <Card className="bg-card/70 shadow-sm backdrop-blur transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary leading-none text-white [&_svg]:block [&_svg]:shrink-0">
                    {SECTION_ICONS[idx]}
                  </span>
                  {f.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{f.description}</p>
                <div className="flex flex-col gap-2">
                  {f.bullets.map((b, bi) => (
                    <div
                      key={b}
                      className="flex w-full items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs text-foreground/90"
                    >
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary/35 leading-none text-white [&_svg]:block [&_svg]:shrink-0">
                        {BULLET_ICONS[idx]?.[bi] ?? <Sparkles className="size-3.5" />}
                      </span>
                      <span className="min-w-0 leading-snug text-foreground/90">{b}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <MarketingPageCta className="mt-14" />
    </div>
  )
}
