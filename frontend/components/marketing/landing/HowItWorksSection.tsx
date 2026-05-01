"use client"

import { Lightbulb, LayoutGrid, LineChart, ListChecks } from "lucide-react"

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: <Lightbulb className="size-4" />,
      title: "Website visit",
      desc: "Explore the product, see examples, and understand the workflow.",
    },
    {
      step: "02",
      icon: <LayoutGrid className="size-4" />,
      title: "Social presence",
      desc: "Build credibility: positioning, messaging, and consistent touchpoints.",
    },
    {
      step: "03",
      icon: <LineChart className="size-4" />,
      title: "Customer support",
      desc: "Capture feedback, validate assumptions, and close the clarity gap.",
    },
    {
      step: "04",
      icon: <ListChecks className="size-4" />,
      title: "Post-purchase",
      desc: "Turn insights into execution: iterate, track, and improve retention.",
    },
  ] as const

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="max-w-2xl">
        <div className="text-sm font-medium text-muted-foreground">How it works</div>
        <h2 className="mt-2 text-balance font-[var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
          A step-by-step flow that reduces cognitive load.
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Each step is focused. Each output feeds the next — so you build with clarity and momentum.
        </p>
      </div>

      {/* Inspired by image 2: linked chain flow */}
      <div className="relative mt-10 overflow-hidden rounded-[32px] border bg-card/40 p-5 shadow-sm backdrop-blur sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]"
        >
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] blur-2xl" />
          <div className="absolute -right-32 -bottom-40 h-80 w-80 rounded-full bg-[color-mix(in_oklab,var(--secondary)_12%,transparent)] blur-2xl" />
        </div>

        <div className="relative">
          {/* chain links background for md+ */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-16 hidden h-20 md:block"
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6">
              {steps.map((s, i) => (
                <div key={s.step} className="relative h-14 flex-1">
                  <div
                    className={[
                      "absolute inset-0 rounded-full border-[12px]",
                      i % 2 === 0
                        ? "border-[color-mix(in_oklab,var(--secondary)_32%,transparent)]"
                        : "border-[color-mix(in_oklab,var(--primary)_26%,transparent)]",
                    ].join(" ")}
                  />
                  {i < steps.length - 1 ? (
                    <div
                      className={[
                        "absolute -right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-card",
                        "shadow-[0_0_0_10px_color-mix(in_oklab,var(--card)_70%,transparent)]",
                      ].join(" ")}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((s, idx) => (
              <div
                key={s.step}
                className="relative rounded-3xl border bg-card/70 p-5 shadow-sm backdrop-blur transition will-change-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={[
                      "inline-flex size-10 items-center justify-center rounded-2xl border bg-background/60",
                      "shadow-sm",
                      idx % 2 === 0
                        ? "border-[color-mix(in_oklab,var(--secondary)_30%,transparent)]"
                        : "border-[color-mix(in_oklab,var(--primary)_26%,transparent)]",
                    ].join(" ")}
                  >
                    {s.icon}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">{s.step}</div>
                </div>
                <div className="mt-4 font-medium">{s.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.desc}</div>

                {/* subtle dotted connector hint on mobile */}
                {idx < steps.length - 1 ? (
                  <div
                    aria-hidden
                    className="mt-4 flex items-center gap-2 md:hidden"
                  >
                    <div className="h-px flex-1 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--muted-foreground)_22%,transparent),transparent)]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_oklab,var(--muted-foreground)_35%,transparent)]" />
                    <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,color-mix(in_oklab,var(--muted-foreground)_22%,transparent))]" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

