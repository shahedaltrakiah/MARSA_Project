"use client"

import * as React from "react"

type ProjectWorkspaceTitleContextValue = {
  projectTitle: string | null
  setProjectTitle: (title: string | null) => void
  /** `null` = not loaded yet for current project route */
  ideaProfileComplete: boolean | null
  setIdeaProfileComplete: (complete: boolean | null) => void
  projectRouteId: string | null
  setProjectRouteId: (id: string | null) => void
}

const ProjectWorkspaceTitleContext = React.createContext<ProjectWorkspaceTitleContextValue | null>(null)

export function ProjectWorkspaceTitleProvider({ children }: { children: React.ReactNode }) {
  const [projectTitle, setProjectTitle] = React.useState<string | null>(null)
  const [ideaProfileComplete, setIdeaProfileComplete] = React.useState<boolean | null>(null)
  const [projectRouteId, setProjectRouteId] = React.useState<string | null>(null)

  const value = React.useMemo(
    () => ({
      projectTitle,
      setProjectTitle,
      ideaProfileComplete,
      setIdeaProfileComplete,
      projectRouteId,
      setProjectRouteId,
    }),
    [projectTitle, ideaProfileComplete, projectRouteId]
  )

  return (
    <ProjectWorkspaceTitleContext.Provider value={value}>{children}</ProjectWorkspaceTitleContext.Provider>
  )
}

export function useOptionalProjectWorkspaceTitle() {
  return React.useContext(ProjectWorkspaceTitleContext)
}

export function useProjectWorkspaceTitle() {
  const ctx = React.useContext(ProjectWorkspaceTitleContext)
  if (!ctx) {
    throw new Error("useProjectWorkspaceTitle must be used within ProjectWorkspaceTitleProvider")
  }
  return ctx
}
