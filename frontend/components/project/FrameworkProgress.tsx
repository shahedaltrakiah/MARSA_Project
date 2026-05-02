"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Circle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/utils"
import api from "@/lib/api"
import type { ProjectSectionContent, ProjectSectionName } from "@/types/api"

const SECTIONS: { slug: ProjectSectionName; label: string }[] = [
  { slug: "offering", label: "Offering" },
  { slug: "business-model", label: "Business Model" },
  { slug: "customer", label: "Customer" },
  { slug: "money", label: "Money" },
  { slug: "assets", label: "Assets" },
  { slug: "action", label: "Action" },
]

function hasNonEmptyField(content: ProjectSectionContent): boolean {
  return Object.values(content).some((v) => typeof v === "string" && v.trim().length > 0)
}

export type FrameworkProgressProps = {
  projectId: number
  projectRouteId: string
}

export function FrameworkProgress({ projectId, projectRouteId }: FrameworkProgressProps) {
  const [loading, setLoading] = React.useState(true)
  const [filled, setFilled] = React.useState<Record<ProjectSectionName, boolean> | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFilled(null)

    const run = async () => {
      const results = await Promise.all(
        SECTIONS.map((s) =>
          api
            .get<{ data: ProjectSectionContent }>(`/projects/${projectId}/sections/${s.slug}`)
            .then((res) => hasNonEmptyField(res.data.data ?? {}))
            .catch(() => false)
        )
      )
      if (cancelled) return
      const next = {} as Record<ProjectSectionName, boolean>
      SECTIONS.forEach((s, i) => {
        next[s.slug] = Boolean(results[i])
      })
      setFilled(next)
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [projectId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Framework progress</CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !filled ? (
          <ul className="space-y-2" aria-busy="true" aria-label="Loading framework progress">
            {SECTIONS.map((s) => (
              <li key={s.slug} className="flex items-center gap-2">
                <div className="size-4 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="h-4 max-w-[220px] flex-1 animate-pulse rounded bg-muted" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => {
              const done = filled[s.slug]
              return (
                <li key={s.slug}>
                  <Link
                    href={`/app/projects/${projectRouteId}/${s.slug}`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-1 py-1.5 text-sm transition-colors",
                      "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    {done ? (
                      <Check className="size-4 shrink-0 text-primary" aria-hidden />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground/45" aria-hidden />
                    )}
                    <span>{s.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
