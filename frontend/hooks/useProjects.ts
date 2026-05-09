"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import type { Project } from "@/types/api"

interface UseProjectsResult {
  projects: Project[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProjects(): UseProjectsResult {
  const t = useTranslations("Workspace.projects")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ data: Project[] }>("/projects")
      setProjects(res.data.data)
    } catch {
      setError(t("loadError"))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, isLoading, error, refetch: fetchProjects }
}
