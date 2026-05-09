"use client"

import * as React from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import api from "@/lib/api"
import { useProjectWorkspaceTitle } from "@/contexts/ProjectWorkspaceTitleContext"
import type { ApiResponse, Project } from "@/types/api"

/** Idea profile + project settings are reachable before the framework is unlocked. */
function isAllowedPathWhenIdeaIncomplete(pathname: string | null, projectId: string): boolean {
  if (!pathname) return false
  if (pathname.includes(`/app/projects/${projectId}/idea-profile`)) return true
  return new RegExp(`^/app/projects/${projectId}/settings(/|$)`).test(pathname)
}

export default function ProjectWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    if (!/^\d+$/.test(id)) {
      router.replace("/app/projects")
    }
  }, [id, router])
  const {
    setProjectTitle,
    ideaProfileComplete,
    setIdeaProfileComplete,
    setProjectRouteId,
  } = useProjectWorkspaceTitle()
  const tLayout = useTranslations("Workspace.layout")
  const tProject = useTranslations("Workspace.project")

  React.useEffect(() => {
    let mounted = true
    setProjectTitle(tLayout("loadingProject"))
    setIdeaProfileComplete(null)
    setProjectRouteId(id)

    async function load() {
      if (!/^\d+$/.test(id)) {
        if (!mounted) return
        setProjectTitle(tProject("fallbackName"))
        setIdeaProfileComplete(null)
        return
      }
      try {
        const res = await api.get<ApiResponse<Project>>(`/projects/${id}`)
        if (!mounted) return
        const p = res.data.data
        setProjectTitle(p.name)
        setIdeaProfileComplete(Boolean(p.idea_profile_completed_at))
      } catch {
        if (!mounted) return
        setProjectTitle(tProject("fallbackName"))
        setIdeaProfileComplete(null)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [id, setIdeaProfileComplete, setProjectRouteId, setProjectTitle, tLayout, tProject])

  React.useEffect(() => {
    if (ideaProfileComplete !== false) return
    if (isAllowedPathWhenIdeaIncomplete(pathname, id)) return
    router.replace(`/app/projects/${id}/idea-profile`)
  }, [ideaProfileComplete, id, pathname, router])

  React.useEffect(() => {
    return () => {
      setProjectTitle(null)
      setIdeaProfileComplete(null)
      setProjectRouteId(null)
    }
  }, [id, setIdeaProfileComplete, setProjectRouteId, setProjectTitle])

  return <>{children}</>
}
