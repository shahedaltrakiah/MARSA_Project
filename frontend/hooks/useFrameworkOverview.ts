"use client"

import { useCallback, useEffect, useState } from "react"

import api from "@/lib/api"
import type { Project, ProjectSectionContent, ProjectSectionName } from "@/types/api"

type FrameworkOverviewResponse = {
  data: {
    project: Project
    sections: Record<ProjectSectionName, ProjectSectionContent>
  }
}

export function useFrameworkOverview(projectId: number) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [sections, setSections] = useState<
    Partial<Record<ProjectSectionName, ProjectSectionContent>>
  >({})

  const load = useCallback(async () => {
    if (!Number.isFinite(projectId) || projectId <= 0) {
      setLoading(false)
      setError(null)
      setProject(null)
      setSections({})
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<FrameworkOverviewResponse>(`/projects/${projectId}/framework-overview`)
      setProject(res.data.data.project)
      setSections(res.data.data.sections ?? {})
    } catch {
      setError("Failed to load framework overview.")
      setProject(null)
      setSections({})
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  return { loading, error, project, sections, reload: load }
}
