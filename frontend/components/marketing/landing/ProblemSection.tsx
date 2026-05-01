"use client"

import { AlertTriangle, LayoutGrid, Wallet } from "lucide-react"

import SectionWrapper from "@/components/marketing/ux/SectionWrapper"

export default function ProblemSection() {
  const cards = [
    {
      icon: <AlertTriangle className="size-4" />,
      title: "Confusion",
      description: "Ideas live in too many places, and decisions get delayed.",
    },
    {
      icon: <LayoutGrid className="size-4" />,
      title: "Lack of structure",
      description: "You can’t tell what’s next, so execution becomes reactive.",
    },
    {
      icon: <Wallet className="size-4" />,
      title: "Financial uncertainty",
      description: "Runway and assumptions drift without a shared model.",
    },
  ] as const

  return (
    <SectionWrapper
      eyebrow="Why founders get stuck"
      title="The early stage is messy — MARSA makes it structured."
      description="Most teams don’t lack effort. They lack a clear system that connects strategy, numbers, and execution."
    >
      {/* Inspired by image 3: metrics cards with corner + dotted accents */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, idx) => (
          <div
            key={c.title}
            className={[
              "group relative isolate overflow-hidden rounded-3xl border bg-card/60 p-6 shadow-sm backdrop-blur",
              "transition will-change-transform hover:-translate-y-0.5 hover:shadow-md",
            ].join(" ")}
          >
            <div
              aria-hidden
              className={[
                "pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100",
                "[background:radial-gradient(80%_70%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)]",
              ].join(" ")}
            />

            {/* top-left bracket */}
            <div
              aria-hidden
              className={[
                "pointer-events-none absolute left-4 top-4 h-7 w-7 rounded-[10px]",
                "border-l-4 border-t-4",
                idx % 3 === 0
                  ? "border-[color-mix(in_oklab,var(--primary)_55%,transparent)]"
                  : idx % 3 === 1
                    ? "border-[color-mix(in_oklab,var(--secondary)_60%,transparent)]"
                    : "border-[color-mix(in_oklab,var(--muted-foreground)_25%,transparent)]",
              ].join(" ")}
            />

            {/* dotted right bracket */}
            <div
              aria-hidden
              className={[
                // behind the card content (as a background accent)
                "pointer-events-none absolute -z-10 right-3 top-9 h-16 w-10 rounded-2xl",
                "border-2 border-dashed",
                "opacity-70 blur-[0.2px]",
                idx % 3 === 0
                  ? "border-[color-mix(in_oklab,var(--primary)_45%,transparent)]"
                  : idx % 3 === 1
                    ? "border-[color-mix(in_oklab,var(--secondary)_50%,transparent)]"
                    : "border-[color-mix(in_oklab,var(--muted-foreground)_22%,transparent)]",
              ].join(" ")}
            />

            <div className="relative flex items-start gap-3">
              <div
                className={[
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-background/60 shadow-sm",
                  idx % 3 === 0
                    ? "border-[color-mix(in_oklab,var(--primary)_26%,transparent)]"
                    : idx % 3 === 1
                      ? "border-[color-mix(in_oklab,var(--secondary)_30%,transparent)]"
                      : "border-[color-mix(in_oklab,var(--muted-foreground)_14%,transparent)]",
                ].join(" ")}
              >
                {c.icon}
              </div>
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}

