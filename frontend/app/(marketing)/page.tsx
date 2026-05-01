import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/utils"

export default function LandingPage() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(900px_circle_at_20%_20%,color-mix(in_oklab,var(--marsa-accent-violet)_30%,transparent),transparent_60%),radial-gradient(900px_circle_at_80%_30%,color-mix(in_oklab,var(--marsa-accent-teal)_28%,transparent),transparent_55%)]"
      />

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="size-4" />
            Built for founders
          </Badge>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Build Your Startup With Clarity
          </h1>
          <p className="mt-5 text-pretty text-lg text-muted-foreground sm:text-xl">
            A structured workspace for entrepreneurs — from idea to execution
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Get Started <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/about"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}
            >
              See How It Works
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-3">
          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Guided Framework</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Navigate Offering → Model → Customer → Money with a consistent structure that keeps you focused.
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Context-aware suggestions and next steps (UI-ready placeholders — Claude will wire logic).
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Financial Tools</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Lightweight panels for assumptions, runway, and pricing — designed to scale with your business.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-3 sm:p-10">
          <div className="sm:col-span-2">
            <div className="text-sm font-medium">From idea to execution</div>
            <div className="mt-2 text-pretty text-sm text-muted-foreground">
              MARSA gives you a consistent, calm surface for building: a topbar for context, a framework sidebar,
              and a notes panel for quick capture.
            </div>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            <Link href="/app/projects" className={cn(buttonVariants({ variant: "secondary" }))}>
              Open Workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

