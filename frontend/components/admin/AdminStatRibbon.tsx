"use client"

import { Crown, Sparkles, Users } from "lucide-react"

import type { AdminDashboardStats } from "@/types/admin"
import { cn } from "@/components/utils"

type Props = {
  stats: AdminDashboardStats
  labels: {
    entrepreneurs: string
    staff: string
    profiles: string
  }
}

export function AdminStatRibbon({ stats, labels }: Props) {
  const cards = [
    {
      label: labels.entrepreneurs,
      value: stats.workspace_members,
      icon: Users,
      className:
        "border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-card to-card dark:from-sky-400/10",
      accent: "text-sky-600 dark:text-sky-400",
    },
    {
      label: labels.staff,
      value: stats.staff,
      icon: Crown,
      className:
        "border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-card to-card dark:from-violet-400/10",
      accent: "text-violet-600 dark:text-violet-400",
    },
    {
      label: labels.profiles,
      value: stats.profiles_with_content,
      icon: Sparkles,
      className:
        "border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 via-card to-card dark:from-emerald-400/10",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={cn(
            "relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
            c.className
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {c.value}
              </p>
            </div>
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm",
                c.accent
              )}
            >
              <c.icon className="size-5" strokeWidth={2} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
