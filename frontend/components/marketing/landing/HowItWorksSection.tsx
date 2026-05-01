"use client"

import { Lightbulb, LayoutGrid, LineChart, ListChecks } from "lucide-react"

import SectionWrapper from "@/components/marketing/ux/SectionWrapper"

const STEPS = [
  {
    step: "01",
    icon: <Lightbulb className="size-5" />,
    title: "Website visit",
    desc: "Explore the product, see examples, and understand the workflow.",
    color: "#4EC5C1",
    labelAbove: false,
  },
  {
    step: "02",
    icon: <LayoutGrid className="size-5" />,
    title: "Social presence",
    desc: "Build credibility: positioning, messaging, and consistent touchpoints.",
    color: "#2BA8C8",
    labelAbove: true,
  },
  {
    step: "03",
    icon: <LineChart className="size-5" />,
    title: "Customer support",
    desc: "Capture feedback, validate assumptions, and close the clarity gap.",
    color: "#1A7AC8",
    labelAbove: false,
  },
  {
    step: "04",
    icon: <ListChecks className="size-5" />,
    title: "Post-purchase",
    desc: "Turn insights into execution: iterate, track, and improve retention.",
    color: "#1A4FA8",
    labelAbove: true,
  },
] as const

const LINK_W = 178
const LINK_H = 94
const OVERLAP = 38

export default function HowItWorksSection() {
  const totalW = STEPS.length * LINK_W - (STEPS.length - 1) * OVERLAP

  return (
    <SectionWrapper
      eyebrow="How it works"
      title="A step-by-step flow that reduces cognitive load."
      description="Each step is focused. Each output feeds the next — so you build with clarity and momentum."
    >
      {/* Desktop chain */}
      <div className="relative hidden md:block">
        <div className="relative mx-auto" style={{ height: 300, width: totalW }}>
          {STEPS.map((s, i) => {
            const x = i * (LINK_W - OVERLAP)
            const above = s.labelAbove

            return (
              <div
                key={s.step}
                style={{
                  position: "absolute",
                  left: x,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: LINK_W,
                  height: LINK_H,
                  zIndex: i % 2 === 0 ? 2 : 1,
                }}
              >
                {/* Chain link oval */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                    boxShadow: `0 4px 20px ${s.color}55`,
                  }}
                >
                  {s.step}
                </div>

                {/* Label + icon badge above or below */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 160,
                    textAlign: "center",
                    ...(above
                      ? { bottom: LINK_H + 12 }
                      : { top: LINK_H + 12 }),
                  }}
                >
                  {/* Dotted connector line */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 12,
                      borderLeft: `2px dashed ${s.color}70`,
                      ...(above ? { bottom: -12 } : { top: -12 }),
                    }}
                  />

                  {/* Icon circle */}
                  {above ? (
                    <>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          border: `2px solid ${s.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: s.color,
                          margin: "0 auto 8px",
                          background: "white",
                        }}
                      >
                        {s.icon}
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.title}</p>
                      <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{s.desc}</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.title}</p>
                      <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>{s.desc}</p>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          border: `2px solid ${s.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: s.color,
                          margin: "0 auto",
                          background: "white",
                        }}
                      >
                        {s.icon}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="grid gap-4 sm:grid-cols-2 md:hidden">
        {STEPS.map((s) => (
          <div key={s.step} className="rounded-2xl border bg-card p-5">
            <div
              className="mb-3 inline-flex size-10 items-center justify-center rounded-full border-2"
              style={{ borderColor: s.color, color: s.color }}
            >
              {s.icon}
            </div>
            <div className="text-xs font-bold" style={{ color: s.color }}>{s.step}</div>
            <div className="mt-1 font-semibold">{s.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
