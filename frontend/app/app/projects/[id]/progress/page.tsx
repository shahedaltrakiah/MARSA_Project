"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

import { ProjectFrameworkMetricsDashboard } from "@/components/project/ProjectFrameworkMetricsDashboard"
import { useFrameworkOverview } from "@/hooks/useFrameworkOverview"

export default function ProjectFrameworkProgressPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const tProject = useTranslations("Workspace.project")
  const { loading, error, project, sections } = useFrameworkOverview(projectId)

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/app/projects/${id}/settings`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 text-foreground dark:text-white" /> {tProject("backToSettings")}
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <ProjectFrameworkMetricsDashboard
        projectId={projectId}
        project={project}
        sections={sections}
        loading={loading}
      />
    </div>
  )
}
