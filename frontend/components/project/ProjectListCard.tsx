"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  Clock,
  FileText,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Package,
  Settings2,
  Share2,
  User,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { resolveProjectLogoUrl } from "@/components/project/ProjectLogoControl"
import { cn } from "@/components/utils"
import type { ProjectExportKind } from "@/lib/projectExport"
import type { Project } from "@/types/api"

type ProjectListCardProps = {
  project: Project
  isOwner: boolean
  onExport: (project: Project, kind: ProjectExportKind) => void
  formatUpdated: (iso: string) => string
}

function shortDate(iso: string, locale: string) {
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)
}

export function ProjectListCard({ project, isOwner, onExport, formatUpdated }: ProjectListCardProps) {
  const t = useTranslations("Workspace.projects")
  const locale = useLocale()
  const logoSrc = project.logo ? resolveProjectLogoUrl(project.logo) : null
  const intlLocale = locale === "ar" ? "ar-SA" : "en-US"

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm transition-[border-color,box-shadow] duration-200",
        "hover:border-primary/40 hover:shadow-md",
        isOwner ? "border-border/80" : "border-border/60"
      )}
    >
      <div className="flex min-h-0 gap-0">
        <div
          className={cn(
            "w-1 shrink-0",
            isOwner
              ? "bg-gradient-to-b from-indigo-500 via-primary/85 to-teal-500/70"
              : "bg-gradient-to-b from-muted-foreground/50 to-muted-foreground/25"
          )}
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 px-5 pb-3 pt-5 sm:gap-5 sm:px-6 sm:pb-4 sm:pt-6">
            <div
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-inner ring-2 ring-background",
                logoSrc ? "ring-primary/15" : ""
              )}
            >
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-muted/80 text-xl font-semibold tracking-tight text-muted-foreground">
                  {project.name.trim().charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                      {project.name}
                    </h2>
                    <Badge
                      variant={isOwner ? "default" : "outline"}
                      className={cn(
                        "shrink-0 font-medium",
                        isOwner ? "bg-primary/90 text-primary-foreground hover:bg-primary/90" : ""
                      )}
                    >
                      {isOwner ? t("badgeOwner") : t("badgeShared")}
                    </Badge>
                    {project.collaborators && project.collaborators.length > 0 ? (
                      <Badge variant="secondary" className="font-normal text-muted-foreground">
                        {t("collaboratorsBadge", { count: project.collaborators.length })}
                      </Badge>
                    ) : null}
                    {!project.idea_profile_completed_at ? (
                      <Badge variant="outline" className="border-amber-500/50 text-amber-800 dark:text-amber-300">
                        {t("ideaProfileRequired")}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0 text-foreground dark:text-white" aria-hidden />
                    <span>{t("updated", { relative: formatUpdated(project.updated_at) })}</span>
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  {!project.idea_profile_completed_at ? (
                    <Link
                      href={`/app/projects/${project.id}/idea-profile`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shadow-sm")}
                    >
                      <Lightbulb className="me-1.5 size-3.5 text-foreground dark:text-white" />
                      {t("cardIdeaProfile")}
                    </Link>
                  ) : (
                    <Link
                      href={`/app/projects/${project.id}/progress`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shadow-sm")}
                    >
                      <ListChecks className="me-1.5 size-3.5 text-foreground dark:text-white" />
                      {t("cardFrameworkProgress")}
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon-sm" }),
                        "shrink-0 border-indigo-200/90 bg-gradient-to-br from-indigo-50/95 via-white to-teal-50/90 shadow-sm",
                        "hover:border-indigo-300 hover:shadow-md dark:border-indigo-500/35 dark:from-indigo-950/50 dark:via-background dark:to-teal-950/40"
                      )}
                      aria-label={t("exportMenu")}
                    >
                      <Share2 className="size-4 text-indigo-600 dark:text-indigo-300" aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[240px] max-w-[min(100vw-2rem,320px)] overflow-hidden rounded-xl border-border/70 bg-popover/98 p-1.5 shadow-xl"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer gap-3 rounded-lg py-2.5 focus:bg-violet-500/12 dark:focus:bg-violet-500/20"
                        onClick={() => onExport(project, "pdf")}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
                          <Package className="size-4" aria-hidden />
                        </span>
                        <span className="font-medium leading-snug">{t("exportPdf")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-3 rounded-lg py-2.5 focus:bg-indigo-500/12 dark:focus:bg-indigo-500/20"
                        onClick={() => onExport(project, "plan")}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
                          <FileText className="size-4" aria-hidden />
                        </span>
                        <span className="font-medium leading-snug">{t("exportPlan")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-3 rounded-lg py-2.5 focus:bg-teal-500/12 dark:focus:bg-teal-500/20"
                        onClick={() => onExport(project, "model")}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                          <LayoutGrid className="size-4" aria-hidden />
                        </span>
                        <span className="font-medium leading-snug">{t("exportModel")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link
                    href={`/app/projects/${project.id}/settings`}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "icon-sm" }),
                      "shrink-0 shadow-sm"
                    )}
                    aria-label={t("manageProject")}
                    title={t("manageProject")}
                  >
                    <Settings2 className="size-4 text-foreground dark:text-white" />
                  </Link>
                </div>
              </div>
            </div>
          </CardHeader>

          {project.description ? (
            <CardContent className="border-t border-border/40 bg-muted/20 px-5 py-3 text-sm sm:px-6">
              <p className="line-clamp-2 leading-relaxed text-muted-foreground">{project.description}</p>
            </CardContent>
          ) : null}

          <CardContent className="border-t border-border/40 bg-muted/25 px-5 py-3.5 sm:px-6">
            <div
              className="grid gap-x-4 gap-y-3 text-xs text-muted-foreground"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(9.5rem, 1fr))" }}
            >
              <div className="flex min-w-0 items-start gap-2">
                <Calendar className="mt-0.5 size-3.5 shrink-0 text-foreground dark:text-white" aria-hidden />
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{t("created")}</div>
                  <div className="truncate">{shortDate(project.created_at, intlLocale)}</div>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-2">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-foreground dark:text-white" aria-hidden />
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{t("lastEdited")}</div>
                  <div className="truncate">{formatUpdated(project.updated_at)}</div>
                </div>
              </div>
              {project.last_modified_by ? (
                <div className="flex min-w-0 items-start gap-2">
                  <User className="mt-0.5 size-3.5 shrink-0 text-foreground dark:text-white" aria-hidden />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{t("modifiedBy")}</div>
                    <div className="truncate">{project.last_modified_by.name}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
