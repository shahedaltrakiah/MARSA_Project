"use client"

import { AlertTriangle, LayoutGrid, Wallet } from "lucide-react"

import SectionWrapper from "@/components/marketing/ux/SectionWrapper"

const CARDS = [
  {
    icon: <AlertTriangle className="size-6" />,
    title: "Confusion",
    description: "Ideas live in too many places, and decisions get delayed.",
    bracketColor: "#6C5CE7",
    dotColor: "#6C5CE780",
  },
  {
    icon: <LayoutGrid className="size-6" />,
    title: "Lack of structure",
    description: "You can't tell what's next, so execution becomes reactive.",
    bracketColor: "#1A9FE0",
    dotColor: "#1A9FE080",
  },
  {
    icon: <Wallet className="size-6" />,
    title: "Financial uncertainty",
    description: "Runway and assumptions drift without a shared model.",
    bracketColor: "#00BAC5",
    dotColor: "#00BAC580",
  },
] as const

export default function ProblemSection() {
  return (
    <SectionWrapper
      eyebrow="Why founders get stuck"
      title="The early stage is messy — MARSA makes it structured."
      description="Most teams don't lack effort. They lack a clear system that connects strategy, numbers, and execution."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.title} className="group relative">
            {/* Floating dotted rectangle offset behind card (bottom-right) */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                top: 10,
                left: 10,
                borderRadius: 20,
                border: `2px dashed ${c.dotColor}`,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Card */}
            <div
              className="relative z-10 flex flex-col items-center rounded-[20px] bg-card px-6 pb-7 pt-8 text-center transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: `2px dashed ${c.bracketColor}50` }}
            >
              {/* Top-left solid L-bracket */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  width: 22,
                  height: 22,
                  borderTop: `3px solid ${c.bracketColor}`,
                  borderLeft: `3px solid ${c.bracketColor}`,
                  borderRadius: "4px 0 0 0",
                }}
              />

              {/* Top-right solid L-bracket */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 22,
                  height: 22,
                  borderTop: `3px solid ${c.bracketColor}`,
                  borderRight: `3px solid ${c.bracketColor}`,
                  borderRadius: "0 4px 0 0",
                }}
              />

              {/* Icon */}
              <div
                className="mb-4 flex size-14 items-center justify-center rounded-2xl"
                style={{
                  background: `${c.bracketColor}12`,
                  color: c.bracketColor,
                  border: `1.5px solid ${c.bracketColor}30`,
                }}
              >
                {c.icon}
              </div>

              <p className="font-semibold text-foreground">{c.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
