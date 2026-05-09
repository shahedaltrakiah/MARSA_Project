"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Circle } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { frameworkDotClass, frameworkSectionStyle } from "@/lib/frameworkSectionStyle"
import { cn } from "@/components/utils"
import { subsectionHasMeaningfulContent } from "@/lib/workspaceSubsection"
import type { ProjectSectionContent, ProjectSectionName } from "@/types/api"

const SECTION_SLUGS: ProjectSectionName[] = [
  "offering",
  "reach",
  "customer",
  "money",
  "assets",
  "action",
  "targets",
]

function hasNonEmptyField(content: ProjectSectionContent): boolean {
  for (const v of Object.values(content)) {
    if (typeof v === "string" && v.trim().length > 0) return true
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = v as Record<string, unknown>
      if ("points" in o || "notes" in o) {
        if (subsectionHasMeaningfulContent(v)) return true
      } else if (Object.values(o).some((s) => typeof s === "string" && String(s).trim().length > 0)) {
        return true
      } else {
        for (const inner of Object.values(o)) {
          if (inner && typeof inner === "object" && !Array.isArray(inner)) {
            if (subsectionHasMeaningfulContent(inner)) return true
          }
        }
      }
    }
  }
  return false
}

export type FrameworkProgressProps = {
  projectRouteId: string
  sections: Partial<Record<ProjectSectionName, ProjectSectionContent>>
  loading: boolean
}

export function FrameworkProgress({ projectRouteId, sections, loading }: FrameworkProgressProps) {
  const tSections = useTranslations("Workspace.sections")
  const tFw = useTranslations("Workspace.frameworkProgress")

  const filled = React.useMemo(() => {
    const next = {} as Record<ProjectSectionName, boolean>
    for (const slug of SECTION_SLUGS) {
      next[slug] = hasNonEmptyField(sections[slug] ?? {})
    }
    return next
  }, [sections])

  const completeCount = SECTION_SLUGS.reduce((n, slug) => n + (filled[slug] ? 1 : 0), 0)

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/15 shadow-sm ring-1 ring-border/30">
      <CardHeader className="flex flex-row flex-wrap items-center justify-end gap-2 border-b border-border/40 bg-muted/20 px-5 py-3 sm:px-6">
        {loading ? (
          <span
            className="h-7 w-[min(100%,14rem)] max-w-full animate-pulse rounded-full bg-muted/50"
            aria-hidden
          />
        ) : (
          <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            {tFw("summary", { complete: completeCount, total: SECTION_SLUGS.length })}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {loading ? (
          <div
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
            aria-busy="true"
            aria-label={tFw("loading")}
          >
            {SECTION_SLUGS.map((slug) => (
              <div
                key={slug}
                className="flex animate-pulse items-center gap-2 rounded-xl border border-border/40 bg-muted/40 px-3 py-3"
              >
                <div className="size-4 shrink-0 rounded-full bg-muted" />
                <div className="h-4 flex-1 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SECTION_SLUGS.map((slug) => {
              const done = filled[slug]
              const accent = frameworkSectionStyle[slug]
              return (
                <Link
                  key={slug}
                  href={`/app/projects/${projectRouteId}/${slug}`}
                  className={cn(
                    "relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-border/70 px-3 py-3 ps-4 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    done ? cn(accent.soft, accent.ring, "ring-1") : "bg-background/60 hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-y-0 start-0 w-1.5 rounded-e-sm",
                      frameworkDotClass(slug),
                      !done && "opacity-45"
                    )}
                    aria-hidden
                  />
                  {done ? (
                    <Check className="size-4 shrink-0 text-foreground dark:text-white" aria-hidden />
                  ) : (
                    <Circle className="size-4 shrink-0 text-foreground/40 dark:text-white/50" aria-hidden />
                  )}
                  <span className="min-w-0 truncate">{tSections(slug)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
