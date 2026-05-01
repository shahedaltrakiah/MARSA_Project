import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="text-balance font-[var(--font-heading)] text-3xl font-semibold tracking-tight">
          About MARSA
        </h1>
        <p className="mt-3 text-muted-foreground">
          MARSA helps entrepreneurs move from idea to execution with a structured workspace for business modeling,
          financial planning, and action — with AI guidance along the way.
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
      </div>

      <Separator className="my-10" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Help founders make better decisions faster — with clear structure and calm execution.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A world where every entrepreneur can build with confidence, not chaos.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Who it’s for</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Solo founders, early teams, and builders validating ideas, planning finances, and executing weekly.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

