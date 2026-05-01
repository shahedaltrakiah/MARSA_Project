"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import api from "@/lib/api"
import type { ApiResponse, Project } from "@/types/api"

import NotesPanel from "@/components/layout/NotesPanel"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

export default function ProjectWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const [projectName, setProjectName] = React.useState<string>("Loading…")

  React.useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get<ApiResponse<Project>>(`/projects/${id}`)
        if (!mounted) return
        setProjectName(res.data.data.name)
      } catch {
        if (!mounted) return
        setProjectName("Project")
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [id])

  return (
    <div className="min-h-screen bg-background">
      <Topbar projectName={projectName} />
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar projectId={id} />
        <main className="min-w-0 flex-1 bg-background">
          <div className="h-[calc(100vh-3.5rem)] overflow-auto p-6">{children}</div>
        </main>
        <NotesPanel />
      </div>
    </div>
  )
}

