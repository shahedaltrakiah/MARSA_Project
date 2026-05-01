"use client"

import { Brain, LayoutGrid, Lightbulb, LineChart, ListChecks } from "lucide-react"

import SectionWrapper from "@/components/marketing/ux/SectionWrapper"

const RING_DATA = [
  { w: 72, h: 360, offset: 0,   color: "#6C5CE7" },
  { w: 64, h: 306, offset: 56,  color: "#4B7BFF" },
  { w: 56, h: 252, offset: 108, color: "#1A9FE0" },
  { w: 50, h: 198, offset: 154, color: "#00BAC5" },
  { w: 44, h: 150, offset: 195, color: "#00C48C" },
]

const FEATURES = [
  {
    icon: <Lightbulb className="size-[18px]" />,
    title: "Build your idea",
    description: "Clarify the problem, customer, and value proposition with guided prompts.",
  },
  {
    icon: <LayoutGrid className="size-[18px]" />,
    title: "Structure your business model",
    description: "Map pricing, channels, costs, and key activities in a clean, connected framework.",
  },
  {
    icon: <LineChart className="size-[18px]" />,
    title: "Plan your finances",
    description: "Track burn, runway, and targets — and keep assumptions explicit.",
  },
  {
    icon: <ListChecks className="size-[18px]" />,
    title: "Manage your tasks",
    description: "Turn strategy into weekly execution so your plan becomes progress.",
  },
  {
    icon: <Brain className="size-[18px]" />,
    title: "Get AI recommendations",
    description: "Context-aware suggestions that reduce decision fatigue and keep momentum high.",
  },
]

export default function WhatYouCanDoSection() {
  return (
    <SectionWrapper
      eyebrow="What you can do"
      title="A clear workflow for founders."
      description="Each feature answers a specific question — so you always know what to do next."
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20">
        {/* Funnel rings */}
        <div className="relative hidden h-[420px] w-[280px] shrink-0 lg:block">
          {RING_DATA.map((ring, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: ring.offset,
                transform: "translateY(-50%)",
                zIndex: RING_DATA.length - i,
              }}
            >
              <div
                style={{
                  width: ring.w,
                  height: ring.h,
                  borderRadius: "50%",
                  border: `13px solid ${ring.color}`,
                  boxShadow: `0 4px 28px ${ring.color}35`,
                }}
              />
              {/* Icon tile above ring */}
              <div
                style={{
                  position: "absolute",
                  top: -24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: "white",
                  border: `1.5px solid ${ring.color}45`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: ring.color,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                }}
              >
                {FEATURES[i]?.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Feature list with colored chevrons */}
        <div className="flex flex-1 flex-col">
          {FEATURES.map((f, i) => {
            const color = RING_DATA[i]?.color ?? "#00c4cc"
            return (
              <div
                key={f.title}
                className="flex items-start gap-4 border-b border-border py-4 first:pt-0 last:border-0 last:pb-0"
              >
                <svg
                  width="12"
                  height="20"
                  viewBox="0 0 12 20"
                  fill="none"
                  className="mt-1 shrink-0"
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
                  <p className="font-semibold leading-snug text-foreground">{f.title}</p>
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
