"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { ProjectListCard } from "@/components/project/ProjectListCard"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/components/utils"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"
import {
  downloadProjectExport,
  isExportForbidden,
  type ProjectExportKind,
} from "@/lib/projectExport"
import type { Project } from "@/types/api"

function formatUpdated(iso: string, locale: string, justNow: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  const intlLocale = locale === "ar" ? "ar-SA" : "en-US"
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" })
  if (minutes < 1) return justNow
  if (minutes < 60) return rtf.format(-minutes, "minute")
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, "hour")
  const days = Math.floor(hours / 24)
  if (days < 7) return rtf.format(-days, "day")
  return new Intl.DateTimeFormat(intlLocale, { month: "short", day: "numeric" }).format(new Date(iso))
}

function filterProjects(
  list: Project[],
  tab: string,
  userId: number | undefined
): Project[] {
  if (!userId) return list
  if (tab === "mine") return list.filter((p) => p.owner.id === userId)
  if (tab === "shared") return list.filter((p) => p.owner.id !== userId)
  return list
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const { projects, isLoading, error, refetch } = useProjects()
  const t = useTranslations("Workspace.projects")
  const locale = useLocale()
  const [tab, setTab] = React.useState("all")
  const [exportNotice, setExportNotice] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!exportNotice) return
    const id = window.setTimeout(() => setExportNotice(null), 5000)
    return () => window.clearTimeout(id)
  }, [exportNotice])

  const formatRel = React.useCallback(
    (iso: string) => formatUpdated(iso, locale, t("justNow")),
    [locale, t]
  )

  const visible = React.useMemo(
    () => filterProjects(projects, tab, user?.id),
    [projects, tab, user?.id]
  )

  const onExport = React.useCallback(
    async (project: Project, kind: ProjectExportKind) => {
      try {
        await downloadProjectExport(project.id, kind, project.name)
      } catch (err) {
        setExportNotice(isExportForbidden(err) ? t("exportForbidden") : t("exportFailed"))
      }
    },
    [t]
  )

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          href="/app/projects/new"
          className={cn(buttonVariants({ variant: "secondary" }), "sm:w-auto")}
        >
          {t("newProject")}
        </Link>
      </div>

      <Separator className="my-4" />

      {exportNotice ? (
        <div
          className="mb-4 rounded-xl border border-rose-200/80 bg-gradient-to-r from-rose-50/95 via-orange-50/80 to-amber-50/70 px-4 py-3 text-sm text-rose-950 shadow-sm dark:border-rose-500/30 dark:from-rose-950/40 dark:via-orange-950/25 dark:to-amber-950/20 dark:text-rose-100"
          role="status"
        >
          {exportNotice}
        </div>
      ) : null}

      {isLoading && (
        <div className="py-16 text-center text-sm text-muted-foreground">{t("loadingList")}</div>
      )}

      {error && !isLoading && (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
            {t("retry")}
          </Button>
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {t("empty")}{" "}
          <Link href="/app/projects/new" className="font-medium text-foreground hover:underline">
            {t("createFirstLink")}
          </Link>
        </div>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList variant="line" className="mb-4 w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="all">{t("filterAll")}</TabsTrigger>
            <TabsTrigger value="mine">{t("filterMine")}</TabsTrigger>
            <TabsTrigger value="shared">{t("filterShared")}</TabsTrigger>
          </TabsList>
          <div className="mt-0 space-y-3">
            {visible.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              visible.map((project) => (
                <ProjectListCard
                  key={project.id}
                  project={project}
                  isOwner={Boolean(user && project.owner.id === user.id)}
                  onExport={onExport}
                  formatUpdated={formatRel}
                />
              ))
            )}
          </div>
        </Tabs>
      )}
    </div>
  )
}
