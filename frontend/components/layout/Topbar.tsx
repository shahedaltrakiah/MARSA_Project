"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, PanelLeft, PanelLeftClose } from "lucide-react"
import { useTranslations } from "next-intl"

import ThemeToggle from "@/components/layout/ThemeToggle"
import UserMenu from "@/components/layout/UserMenu"
import WorkspaceLocaleSwitcher from "@/components/layout/WorkspaceLocaleSwitcher"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useOptionalProjectWorkspaceTitle } from "@/contexts/ProjectWorkspaceTitleContext"

export type TopbarProps = {
  projectName?: string
  /** Show hamburger (narrow screens) to open workspace sidebar drawer */
  showMobileWorkspaceNav?: boolean
  onMobileWorkspaceNavClick?: () => void
  /** md and up: sidebar narrow icon rail vs full labels */
  desktopSidebarCollapsed?: boolean
  onDesktopSidebarToggle?: () => void
}

export default function Topbar({
  projectName,
  showMobileWorkspaceNav,
  onMobileWorkspaceNavClick,
  desktopSidebarCollapsed,
  onDesktopSidebarToggle,
}: TopbarProps) {
  const t = useTranslations("Workspace.topbar")
  const tAria = useTranslations("Workspace.aria")
  const titleCtx = useOptionalProjectWorkspaceTitle()
  const title = projectName ?? titleCtx?.projectTitle ?? t("defaultTitle")

  return (
    <header className="sticky top-0 z-[100] w-full shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex min-h-24 max-w-[1600px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        {showMobileWorkspaceNav && onMobileWorkspaceNavClick ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label={tAria("openWorkspaceMenu")}
            onClick={onMobileWorkspaceNavClick}
          >
            <Menu className="size-5" />
          </Button>
        ) : null}
        {showMobileWorkspaceNav && onDesktopSidebarToggle ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden shrink-0 md:inline-flex"
            aria-label={
              desktopSidebarCollapsed ? tAria("expandWorkspaceSidebar") : tAria("collapseWorkspaceSidebar")
            }
            onClick={onDesktopSidebarToggle}
          >
            {desktopSidebarCollapsed ? (
              <PanelLeft className="size-5 rtl:rotate-180" aria-hidden />
            ) : (
              <PanelLeftClose className="size-5 rtl:rotate-180" aria-hidden />
            )}
          </Button>
        ) : null}
        <Link
          href="/"
          className="inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 hover:bg-muted"
          aria-label="MARSA home"
        >
          <Image
            src="/brand/marsa-logo-blue.png"
            alt="MARSA logo"
            width={720}
            height={192}
            sizes="(max-width: 640px) 220px, (max-width: 1024px) 280px, 320px"
            className="h-14 w-auto object-contain object-start dark:hidden sm:h-16 md:h-[4.5rem] lg:h-20"
            priority
          />
          <Image
            src="/brand/marsa-logo-blue-white.png"
            alt="MARSA logo"
            width={720}
            height={192}
            sizes="(max-width: 640px) 220px, (max-width: 1024px) 280px, 320px"
            className="hidden h-14 w-auto object-contain object-start dark:block sm:h-16 md:h-[4.5rem] lg:h-20"
            priority
          />
        </Link>

        <Separator orientation="vertical" className="h-12 sm:h-14 md:h-16" />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="truncate text-xs text-muted-foreground">{t("subtitle")}</div>
        </div>

        <WorkspaceLocaleSwitcher />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}

