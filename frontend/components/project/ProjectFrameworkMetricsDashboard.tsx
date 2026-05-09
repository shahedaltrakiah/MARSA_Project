"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Activity,
  Banknote,
  BarChart2,
  Boxes,
  BriefcaseBusiness,
  Crosshair,
  Megaphone,
  Target,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/components/utils"
import { useNotesRail } from "@/contexts/NotesRailContext"
import { completionForSection, DASHBOARD_SECTIONS } from "@/lib/section-progress"
import type { Project, ProjectSectionContent, ProjectSectionName } from "@/types/api"

function sanitizeFilename(name: string): string {
  const s = name.trim().replace(/[^\w\-]+/g, "-").replace(/^-+|-+$/g, "")
  return s || "project"
}

function sectionIcon(slug: string) {
  const cls = "size-4 shrink-0"
  switch (slug) {
    case "offering":
      return <BriefcaseBusiness className={cls} />
    case "reach":
      return <Megaphone className={cls} />
    case "customer":
      return <Target className={cls} />
    case "money":
      return <Banknote className={cls} />
    case "assets":
      return <Boxes className={cls} />
    case "action":
      return <Activity className={cls} />
    case "targets":
      return <Crosshair className={cls} />
    default:
      return <BarChart2 className={cls} />
  }
}

export type ProjectFrameworkMetricsDashboardProps = {
  projectId: number
  project: Project | null
  sections: Partial<Record<ProjectSectionName, ProjectSectionContent>>
  loading: boolean
}

export function ProjectFrameworkMetricsDashboard({
  projectId,
  project,
  sections,
  loading,
}: ProjectFrameworkMetricsDashboardProps) {
  const { collapsed: notesCollapsed } = useNotesRail()
  const t = useTranslations("Workspace.dashboard")
  const tSections = useTranslations("Workspace.sections")
  const containerMax = notesCollapsed ? "max-w-none" : "max-w-4xl"

  const metrics = React.useMemo(() => {
    return DASHBOARD_SECTIONS.map((s) => {
      const content = sections[s.key] ?? {}
      return {
        ...s,
        ...completionForSection(s.key, content),
      }
    })
  }, [sections])

  const overallPct = React.useMemo(() => {
    if (metrics.length === 0) return 0
    const sum = metrics.reduce((acc, m) => acc + m.pct, 0)
    return Math.round(sum / metrics.length)
  }, [metrics])

  function exportJson() {
    if (!project) return
    const exportData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
      },
      sections: Object.fromEntries(
        DASHBOARD_SECTIONS.map(({ key }) => [key, sections[key] ?? {}])
      ) as Record<string, ProjectSectionContent>,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const day = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `marsa-export-${sanitizeFilename(project.name)}-${day}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={cn("mx-auto w-full space-y-6 px-2 py-8", containerMax)}>
        <div className="h-10 max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7].map((k) => (
            <div key={k} className="h-32 animate-pulse rounded-xl bg-muted/80" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("mx-auto w-full space-y-8 px-2 py-6", containerMax)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-[var(--font-heading)] text-xl font-semibold tracking-tight sm:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={exportJson} disabled={!project}>
          {t("exportJson")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("overall")}</CardTitle>
          <CardDescription>{t("overallDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="relative flex size-36 items-center justify-center rounded-full border-4 border-primary/30 bg-muted/40">
            <span className="text-3xl font-bold tabular-nums text-foreground">{overallPct}%</span>
          </div>
          <div className="min-w-0 flex-1 space-y-2 sm:max-w-md">
            <Progress value={overallPct} className="h-3" />
            <p className="text-xs text-muted-foreground">{t("weightedHint")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((m) => (
          <Card key={m.slug}>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{sectionIcon(m.slug)}</span>
                <CardTitle className="text-base">{tSections(m.key)}</CardTitle>
              </div>
              <span className="text-sm font-semibold tabular-nums text-muted-foreground">{m.pct}%</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={m.pct} />
              <p className="text-xs text-muted-foreground">
                {t("fieldsComplete", { filled: m.filled, total: m.total })}
              </p>
              <Link
                href={`/app/projects/${projectId}/${m.slug}`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "inline-flex w-full justify-center")}
              >
                {t("goToSection")}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
