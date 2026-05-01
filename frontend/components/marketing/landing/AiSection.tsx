"use client"

import * as React from "react"
import Link from "next/link"
import { Brain, Sparkles } from "lucide-react"

import { Reveal } from "@/components/marketing/motion"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"

export default function AiSection() {
  const [aiStep, setAiStep] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => setAiStep((v) => (v + 1) % 3), 2600)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="text-sm font-medium text-muted-foreground">AI recommendations</div>
          <h2 className="mt-2 text-balance font-[var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Suggestions that are tied to your work — not generic advice.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            MARSA uses your project context to propose next steps, questions to answer, and risks to consider — so you
            keep moving without guesswork.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full sm:w-auto")}
            >
              Start your startup
            </Link>
            <Link
              href="/features"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}
            >
              Explore features
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-3xl border bg-card/60 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Example suggestion</div>
              <Badge variant="secondary" className="gap-2">
                <Sparkles className="size-4" />
                AI
              </Badge>
            </div>
            <Separator className="my-4" />

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-2xl border bg-background p-4">
                <div className="inline-flex size-9 items-center justify-center rounded-2xl border bg-card">
                  <Brain className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium">Next step</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {aiStep === 0 &&
                      "Your value proposition is clear — now validate pricing with 5 quick customer calls this week."}
                    {aiStep === 1 &&
                      "Your burn rate implies ~6 months runway. Consider narrowing scope or adding a pre‑sale offer."}
                    {aiStep === 2 &&
                      "Your acquisition channel is broad. Pick one: LinkedIn outbound or partnerships — then define a weekly target."}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs font-medium text-muted-foreground">Why this helps</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  AI output is framed as a concrete action tied to your model and numbers — so it’s easy to execute.
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

