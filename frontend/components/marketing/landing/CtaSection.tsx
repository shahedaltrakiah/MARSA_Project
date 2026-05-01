"use client"

import Link from "next/link"

import { Reveal } from "@/components/marketing/motion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <Reveal>
        <div className="grid gap-6 rounded-3xl border bg-card/60 p-6 shadow-sm backdrop-blur sm:grid-cols-3 sm:p-10">
          <div className="sm:col-span-2">
            <div className="text-sm font-medium text-muted-foreground">Ready to build?</div>
            <h3 className="mt-2 text-balance font-[var(--font-heading)] text-2xl font-semibold tracking-tight">
              Start building your startup today.
            </h3>
            <p className="mt-3 text-pretty text-sm text-muted-foreground">
              Create your workspace, clarify your model, and move forward with confidence.
            </p>
          </div>
          <div className="flex items-center justify-start gap-3 sm:justify-end">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full sm:w-auto")}
            >
              Start your startup
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}
            >
              Contact
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

