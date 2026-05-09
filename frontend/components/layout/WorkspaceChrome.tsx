"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import NotesPanel from "@/components/layout/NotesPanel"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { NotesRailProvider } from "@/contexts/NotesRailContext"
import { ProjectWorkspaceTitleProvider } from "@/contexts/ProjectWorkspaceTitleContext"
import { cn } from "@/components/utils"

export default function WorkspaceChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ""
  const tAria = useTranslations("Workspace.aria")
  const projectMatch = pathname.match(/^\/app\/projects\/(\d+)/)
  const projectId = projectMatch?.[1]
  const showNotes = Boolean(projectId)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = React.useState(false)
  const [desktopSidebarHydrated, setDesktopSidebarHydrated] = React.useState(false)
  const showWorkspaceMobileNav = pathname.startsWith("/app")

  React.useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  React.useEffect(() => {
    try {
      setDesktopSidebarCollapsed(window.localStorage.getItem("marsa_workspace_sidebar_collapsed") === "1")
    } finally {
      setDesktopSidebarHydrated(true)
    }
  }, [])

  React.useEffect(() => {
    if (!desktopSidebarHydrated) return
    window.localStorage.setItem(
      "marsa_workspace_sidebar_collapsed",
      desktopSidebarCollapsed ? "1" : "0"
    )
  }, [desktopSidebarCollapsed, desktopSidebarHydrated])

  return (
    <ProjectWorkspaceTitleProvider>
      <NotesRailProvider>
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
          <Topbar
            showMobileWorkspaceNav={showWorkspaceMobileNav}
            onMobileWorkspaceNavClick={() => setMobileSidebarOpen((open) => !open)}
            desktopSidebarCollapsed={desktopSidebarCollapsed}
            onDesktopSidebarToggle={() => setDesktopSidebarCollapsed((c) => !c)}
          />
          {mobileSidebarOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-[65] bg-black/50 md:hidden"
              aria-label={tAria("closeWorkspaceMenu")}
              onClick={() => setMobileSidebarOpen(false)}
            />
          ) : null}
          <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden">
            <Sidebar
              projectId={projectId}
              mobileOpen={mobileSidebarOpen}
              desktopCollapsed={desktopSidebarCollapsed}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <main
              className={cn(
                "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-background",
                showNotes ? "px-3 py-4 pe-2 ps-3 sm:px-5 sm:py-6 sm:pe-4 sm:ps-5" : "px-3 py-4 sm:px-6 sm:py-6"
              )}
            >
              {children}
            </main>
            {showNotes ? <NotesPanel /> : null}
          </div>
        </div>
      </NotesRailProvider>
    </ProjectWorkspaceTitleProvider>
  )
}
