"use client"

import * as React from "react"

import { cn } from "@/components/utils"
import { Reveal } from "@/components/marketing/motion"

export default function SectionWrapper({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("mx-auto max-w-6xl px-4 py-12 sm:py-16", className)}>
      <Reveal>
        <div className="max-w-2xl">
          {eyebrow ? <div className="text-sm font-medium text-muted-foreground">{eyebrow}</div> : null}
          <h2 className="mt-2 text-balance font-[var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {description ? <p className="mt-4 text-pretty text-muted-foreground">{description}</p> : null}
        </div>
      </Reveal>

      <div className="mt-8">{children}</div>
    </section>
  )
}

