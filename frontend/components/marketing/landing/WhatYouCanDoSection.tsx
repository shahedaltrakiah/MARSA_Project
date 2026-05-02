"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Brain, LayoutGrid, Lightbulb, LineChart, ListChecks, Users } from "lucide-react"

import SectionWrapper from "@/components/marketing/ux/SectionWrapper"

const RING_DATA = [
  { w: 130, h: 380, offset: 0, color: "#6C5CE7" },
  { w: 120, h: 324, offset: 78, color: "#4B7BFF" },
  { w: 110, h: 268, offset: 146, color: "#1A9FE0" },
  { w: 100, h: 214, offset: 208, color: "#00BAC5" },
  { w: 90, h: 162, offset: 264, color: "#00C48C" },
  { w: 80, h: 116, offset: 314, color: "#2ECC71" },
]

const FEATURE_ICONS = [
  <Lightbulb key="0" className="size-[18px]" />,
  <LayoutGrid key="1" className="size-[18px]" />,
  <LineChart key="2" className="size-[18px]" />,
  <ListChecks key="3" className="size-[18px]" />,
  <Brain key="4" className="size-[18px]" />,
  <Users key="5" className="size-[18px]" />,
]

export default function WhatYouCanDoSection() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const t = useTranslations("WhatYouCanDo")
  const items = useMemo(() => t.raw("items") as { title: string; description: string }[], [t])

  return (
    <SectionWrapper eyebrow={t("eyebrow")} title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20">
        {/* Funnel rings */}
        <div className="relative hidden h-[440px] w-[330px] shrink-0 lg:block">
          {RING_DATA.map((ring, i) => {
            const isActive = activeIdx === i
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: ring.offset,
                  transform: "translateY(-50%)",
                  zIndex: RING_DATA.length - i,
                  transition: "filter 0.3s ease",
                  filter: isActive ? `drop-shadow(0 0 18px ${ring.color}90)` : "none",
                }}
              >
                <div
                  style={{
                    width: ring.w,
                    height: ring.h,
                    borderRadius: "50%",
                    border: `18px solid ${ring.color}`,
                    opacity: isActive ? 1 : 0.78,
                    transform: isActive ? "scaleX(1.08)" : "scaleX(1)",
                    boxShadow: isActive
                      ? `0 8px 40px ${ring.color}60`
                      : `0 3px 16px ${ring.color}22`,
                    transition: "opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                />
                {/* Icon tile */}
                <div
                  className="absolute flex items-center justify-center rounded-[13px] border bg-card shadow-sm"
                  style={{
                    top: -26,
                    left: "50%",
                    transform: `translateX(-50%) ${isActive ? "scale(1.15) translateY(-2px)" : "scale(1)"}`,
                    width: 48,
                    height: 48,
                    color: ring.color,
                    borderColor: `${ring.color}45`,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: isActive
                      ? `0 6px 20px ${ring.color}55`
                      : "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {FEATURE_ICONS[i]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature list */}
        <div className="flex flex-1 flex-col">
          {items.map((f, i) => {
            const color = RING_DATA[i]?.color ?? "#00c4cc"
            const isActive = activeIdx === i
            return (
              <div
                key={f.title}
                className="flex cursor-default items-start gap-4 rounded-xl border-b border-border py-4 first:pt-0 last:border-0 last:pb-0"
                style={{
                  paddingLeft: isActive ? 10 : 0,
                  paddingRight: isActive ? 10 : 0,
                  background: isActive ? `${color}0d` : "transparent",
                  transition: "background 0.25s ease, padding 0.25s ease",
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {/* Chevron */}
                <svg
                  width="12"
                  height="20"
                  viewBox="0 0 12 20"
                  fill="none"
                  className="mt-1 shrink-0"
                  style={{
                    transform: isActive ? "translateX(4px)" : "translateX(0)",
                    transition: "transform 0.25s ease",
                  }}
                >
                  <path
                    d="M10 2L2 10l8 8"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p
                    className="font-semibold leading-snug transition-colors duration-200"
                    style={{ color: isActive ? color : undefined }}
                  >
                    {f.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionWrapper>
  )
}
