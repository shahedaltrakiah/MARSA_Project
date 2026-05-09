"use client"

import * as React from "react"
import {
  Activity,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  Crosshair,
  Folders,
  Info,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Megaphone,
  Settings2,
  Target,
  UserCog,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useOptionalProjectWorkspaceTitle } from "@/contexts/ProjectWorkspaceTitleContext"
import { cn } from "@/components/utils"
import { frameworkDotClass } from "@/lib/frameworkSectionStyle"
import type { ProjectSectionName } from "@/types/api"

type SectionSlug = "offering" | "reach" | "customer" | "money" | "assets" | "action" | "targets"

type NavItem = {
  label: string
  slug: string
  href: string
  icon: React.ReactNode
  /** Lucide-only (or simple) icon for md+ narrow rail — skips framework dot */
  railIcon?: React.ReactNode
  badge?: string
  title?: string
}

type FrameworkDef = {
  slug: SectionSlug
  icon: React.ReactNode
  badge?: boolean
}

const frameworkDefs: FrameworkDef[] = [
  { slug: "offering", icon: <BriefcaseBusiness className="size-4" /> },
  { slug: "reach", icon: <Megaphone className="size-4" /> },
  { slug: "customer", icon: <Target className="size-4" /> },
  { slug: "money", icon: <Banknote className="size-4" /> },
  { slug: "assets", icon: <Boxes className="size-4" /> },
  { slug: "action", icon: <Activity className="size-4" /> },
  { slug: "targets", icon: <Crosshair className="size-4" /> },
]

export type SidebarProps = {
  projectId?: string
  /** When false on narrow screens, drawer is off-canvas */
  mobileOpen?: boolean
  /** md and up: narrow icon rail instead of full labels (mobile drawer unchanged) */
  desktopCollapsed?: boolean
  /** Called after navigating (closes mobile drawer) */
  onNavigate?: () => void
}

function NavLink({
  item,
  active,
  disabled,
  narrowRail,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  disabled?: boolean
  /** md+: icon-only row; labels via tooltip + screen readers */
  narrowRail?: boolean
  onNavigate?: () => void
}) {
  const tooltip = disabled ? item.title : item.label
  const displayIcon = narrowRail && item.railIcon ? item.railIcon : item.icon

  const className = cn(
    "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
    narrowRail && "md:justify-center md:gap-0 md:px-2 md:py-2.5",
    active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    disabled && "pointer-events-none cursor-not-allowed opacity-55 hover:bg-transparent"
  )

  const content = (
    <>
      <span className={cn("text-muted-foreground", !disabled && "group-hover:text-foreground", narrowRail && "md:shrink-0")}>
        {displayIcon}
      </span>
      <span className={cn("min-w-0 flex-1 truncate", narrowRail && "md:sr-only")}>{item.label}</span>
      {item.badge ? (
        <Badge variant="secondary" className={cn("ml-auto", narrowRail && "md:hidden")}>
          {item.badge}
        </Badge>
      ) : null}
    </>
  )

  if (item.href === "#" || disabled) {
    return (
      <span
        className={className}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled ? true : undefined}
        title={narrowRail ? (tooltip ?? item.label) : disabled ? item.title : undefined}
      >
        {content}
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? "page" : undefined}
      title={narrowRail ? item.label : item.title}
      onClick={() => onNavigate?.()}
    >
      {content}
    </Link>
  )
}

export default function Sidebar({
  projectId,
  mobileOpen = false,
  desktopCollapsed = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname()
  const tSections = useTranslations("Workspace.sections")
  const tSidebar = useTranslations("Workspace.sidebar")
  const titleCtx = useOptionalProjectWorkspaceTitle()
  const showFramework = Boolean(projectId)
  const frameworkNavLocked =
    Boolean(projectId) &&
    titleCtx?.projectRouteId === projectId &&
    titleCtx?.ideaProfileComplete === false
  const lockHint = tSidebar("frameworkLockedHint")

  const frameworkItems: NavItem[] = frameworkDefs.map((item) => ({
    slug: item.slug,
    label: tSections(item.slug),
    railIcon: item.icon,
    icon: (
      <span className="flex items-center gap-2">
        <span
          className={cn("size-2 shrink-0 rounded-full", frameworkDotClass(item.slug as ProjectSectionName))}
          aria-hidden
        />
        {item.icon}
      </span>
    ),
    badge: item.badge ? tSidebar("badgeNew") : undefined,
    href: projectId ? `/app/projects/${projectId}/${item.slug}` : "#",
    title: frameworkNavLocked ? lockHint : undefined,
  }))

  const projectsNavActive =
    pathname === "/app/projects" || pathname === "/app/projects/new"

  const accountItems: NavItem[] = [
    {
      label: tSidebar("account"),
      slug: "profile",
      href: "/app/profile",
      icon: <UserCog className="size-4" />,
    },
  ]

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-[240px] shrink-0 flex-col border-e bg-card",
        "transition-[width] duration-200 ease-out",
        desktopCollapsed ? "md:w-14 md:min-w-14" : "md:w-[240px]",
        "max-md:fixed max-md:bottom-0 max-md:start-0 max-md:top-24 max-md:z-[70] max-md:h-[calc(100dvh-6rem)] max-md:w-[min(88vw,280px)] max-md:max-w-[92vw] max-md:shadow-2xl max-md:transition-transform max-md:duration-200 max-md:ease-out",
        mobileOpen
          ? "max-md:translate-x-0 max-md:pointer-events-auto"
          : "max-md:pointer-events-none max-md:ltr:-translate-x-full max-md:rtl:translate-x-full"
      )}
    >
      <Separator />

      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3",
          desktopCollapsed && "md:space-y-0.5 md:p-2 md:px-1.5"
        )}
      >
        <div
          className={cn(
            "px-3 pb-2 pt-1 text-xs font-medium tracking-wide text-muted-foreground",
            desktopCollapsed && "md:sr-only"
          )}
        >
          {tSidebar("workspaceSection")}
        </div>
        <NavLink
          item={{
            label: tSidebar("dashboard"),
            slug: "dashboard-home",
            href: "/app/dashboard",
            icon: <LayoutDashboard className="size-4" />,
            railIcon: <LayoutDashboard className="size-4" />,
          }}
          active={Boolean(pathname === "/app/dashboard")}
          narrowRail={desktopCollapsed}
          onNavigate={onNavigate}
        />
        <NavLink
          item={{
            label: tSidebar("projects"),
            slug: "projects-list",
            href: "/app/projects",
            icon: <Folders className="size-4" />,
            railIcon: <Folders className="size-4" />,
          }}
          active={projectsNavActive}
          narrowRail={desktopCollapsed}
          onNavigate={onNavigate}
        />

        {showFramework ? (
          <>
            <div
              className={cn(
                "px-3 pb-2 pt-3 text-xs font-medium tracking-wide text-muted-foreground",
                desktopCollapsed && "md:sr-only"
              )}
            >
              {tSidebar("framework")}
            </div>
            {frameworkNavLocked ? (
              <Alert
                variant="default"
                className={cn(
                  "mx-0 mb-2 border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs",
                  desktopCollapsed && "md:hidden"
                )}
              >
                <Info className="size-4 text-amber-700 dark:text-amber-400" aria-hidden />
                <AlertDescription className="text-amber-950 dark:text-amber-100">
                  {lockHint}
                </AlertDescription>
              </Alert>
            ) : null}
            <NavLink
              item={{
                label: tSidebar("ideaProfileNav"),
                slug: "idea-profile",
                href: `/app/projects/${projectId}/idea-profile`,
                icon: <Lightbulb className="size-4" />,
                railIcon: <Lightbulb className="size-4" />,
              }}
              active={Boolean(pathname?.includes(`/app/projects/${projectId}/idea-profile`))}
              narrowRail={desktopCollapsed}
              onNavigate={onNavigate}
            />
            <NavLink
              item={{
                label: tSidebar("projectSettings"),
                slug: "project-settings",
                href: `/app/projects/${projectId}/settings`,
                icon: <Settings2 className="size-4" />,
                railIcon: <Settings2 className="size-4" />,
              }}
              active={Boolean(pathname?.includes(`/app/projects/${projectId}/settings`))}
              narrowRail={desktopCollapsed}
              onNavigate={onNavigate}
            />
            <NavLink
              item={{
                label: tSidebar("frameworkProgressNav"),
                slug: "framework-progress",
                href: `/app/projects/${projectId}/progress`,
                icon: <ListChecks className="size-4" />,
                railIcon: <ListChecks className="size-4" />,
                title: frameworkNavLocked ? lockHint : undefined,
              }}
              active={Boolean(pathname?.includes(`/app/projects/${projectId}/progress`))}
              disabled={frameworkNavLocked}
              narrowRail={desktopCollapsed}
              onNavigate={onNavigate}
            />
            {frameworkItems.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={Boolean(
                  pathname &&
                  projectId &&
                  new RegExp(`^/app/projects/${projectId}/${item.slug}(/|$)`).test(pathname)
                )}
                disabled={frameworkNavLocked}
                narrowRail={desktopCollapsed}
                onNavigate={onNavigate}
              />
            ))}
          </>
        ) : null}

        {!showFramework ? (
          <>
            <Separator className={cn("my-3", desktopCollapsed && "md:my-2")} />

            <div
              className={cn(
                "px-3 pb-2 pt-1 text-xs font-medium tracking-wide text-muted-foreground",
                desktopCollapsed && "md:sr-only"
              )}
            >
              {tSidebar("accountNav")}
            </div>
            {accountItems.map((item) => (
              <NavLink
                key={item.label}
                item={{
                  ...item,
                  railIcon: <UserCog className="size-4" />,
                }}
                active={Boolean(pathname && pathname.includes(item.href))}
                narrowRail={desktopCollapsed}
                onNavigate={onNavigate}
              />
            ))}
          </>
        ) : null}
      </nav>
    </aside>
  )
}

