"use client"

import * as React from "react"

import { cn } from "@/components/utils"

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const v = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  )
}
