import type { ReactNode } from "react"

import NotesPanel from "@/components/layout/NotesPanel"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar projectName="Marsa Project" />
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar activeLabel="Offering" />
        <main className="min-w-0 flex-1 bg-background">
          <div className="h-[calc(100vh-3.5rem)] overflow-auto p-6">{children}</div>
        </main>
        <NotesPanel />
      </div>
    </div>
  )
}

