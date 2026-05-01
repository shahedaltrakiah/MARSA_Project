"use client"

import type { ReactNode } from "react"
import { useSelectedLayoutSegments } from "next/navigation"

import Topbar from "@/components/layout/Topbar"

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments()
  const inWorkspace = segments.length > 0 && segments[0] !== "new"

  if (inWorkspace) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main className="mx-auto max-w-[1600px] p-6">{children}</main>
    </div>
  )
}

