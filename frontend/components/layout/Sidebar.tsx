"use client"

import * as React from "react"
import {
  Activity,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  CircleUserRound,
  CreditCard,
  LayoutGrid,
  Target,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"

type NavItem = {
  label: string
  slug: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const frameworkBase: Omit<NavItem, "href">[] = [
  { label: "Offering", slug: "offering", icon: <BriefcaseBusiness className="size-4" /> },
  { label: "Business Model", slug: "business-model", icon: <LayoutGrid className="size-4" /> },
  { label: "Customer", slug: "customer", icon: <Target className="size-4" /> },
  { label: "Money", slug: "money", icon: <Banknote className="size-4" /> },
  { label: "Assets", slug: "assets", icon: <Boxes className="size-4" /> },
  { label: "Action", slug: "action", icon: <Activity className="size-4" />, badge: "New" },
]

export type SidebarProps = {
  projectId?: string
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const className = [
    "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
    active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ")

  const content = (
    <>
      <span className="text-muted-foreground group-hover:text-foreground">{item.icon}</span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      ) : null}
    </>
  )

  if (item.href === "#") {
    return (
      <span className={className} aria-current={active ? "page" : undefined}>
        {content}
      </span>
    )
  }

  return (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  )
}

export default function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname()

  const frameworkItems: NavItem[] = frameworkBase.map((item) => ({
    ...item,
    href: projectId ? `/app/projects/${projectId}/${item.slug}` : "#",
  }))

  const { user, isLoading: authLoading } = useAuth()

  const name = user?.name
  const initials = (() => {
    if (!name?.trim()) return "?"
    const parts = name.trim().split(/\s+/).filter(Boolean)
    const s = parts
      .slice(0, 3)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2)
    return s || "?"
  })()

  const accountItems: NavItem[] = [
    {
      label: "Startup Profile",
      slug: "onboarding",
      href: "/app/onboarding",
      icon: <CircleUserRound className="size-4" />,
    },
    { label: "Account", slug: "profile", href: "/app/profile", icon: <CreditCard className="size-4" /> },
  ]

  return (
    <aside className="flex h-[calc(100vh-3.5rem)] w-[240px] flex-col border-r bg-card">
      <div className="flex items-start gap-3 p-4">
        <div className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5">
          <Avatar className="size-9">
            <AvatarFallback className="bg-[linear-gradient(135deg,var(--secondary),var(--primary))] text-xs font-semibold text-primary-foreground">
              {authLoading ? "…" : initials}
            </AvatarFallback>
          </Avatar>
          <p className="w-full truncate text-center text-[11px] font-medium leading-tight text-foreground sm:text-xs">
            {authLoading ? "…" : user?.name ?? "Account"}
          </p>
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <div className="truncate text-xs text-muted-foreground">Starter workspace</div>
        </div>
        <Button variant="outline" size="icon-sm" className="shrink-0 self-start" aria-label="Quick actions">
          <span className="text-xs font-semibold">+</span>
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 overflow-auto p-3">
        <div className="px-3 pb-2 pt-1 text-xs font-medium tracking-wide text-muted-foreground">
          Framework
        </div>
        {frameworkItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={Boolean(pathname && pathname.includes(`/${item.slug}`))}
          />
        ))}

        <Separator className="my-3" />

        <div className="px-3 pb-2 pt-1 text-xs font-medium tracking-wide text-muted-foreground">
          Account
        </div>
        {accountItems.map((item) => (
          <NavLink key={item.label} item={item} active={Boolean(pathname && pathname.includes(item.href))} />
        ))}
      </nav>

      <div className="border-t p-3">
        <Link
          href="/app/projects"
          className="block rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted"
        >
          <div className="font-medium">Projects</div>
          <div className="text-xs text-muted-foreground">View all workspaces</div>
        </Link>
      </div>
    </aside>
  )
}

