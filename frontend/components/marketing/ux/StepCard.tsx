"use client"

import * as React from "react"

import { Reveal } from "@/components/marketing/motion"
import { cn } from "@/components/utils"

export type StepCardProps = {
  step: number
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export default function StepCard({ step, icon, title, description, className }: StepCardProps) {
  return (
    <Reveal delay={step * 0.05}>
      <div
        className={cn(
          "rounded-3xl border bg-card/60 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-md",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">Step {step}</div>
            <div className="mt-1 font-medium">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

