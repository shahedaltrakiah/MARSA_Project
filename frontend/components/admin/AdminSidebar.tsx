"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BadgeDollarSign,
  LayoutDashboard,
  LayoutGrid,
  Palette,
  Rocket,
  Type,
  UserCog,
  Users,
} from "lucide-react"

import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle"
import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import { useAuthContext } from "@/contexts/AuthContext"
import type { AdminSiteSection } from "@/types/api"
import { cn } from "@/components/utils"
import { Button } from "@/components/ui/button"

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

type SiteNavItem = NavItem & { section: AdminSiteSection }

const overviewNavItems = (t: { navDashboard: string }): NavItem[] => [
  {
    label: t.navDashboard,
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="size-4 shrink-0" />,
  },
]

const memberNavItems = (t: {
  navEntrepreneurs: string
  navMemberDirectory: string
  navStaff: string
}): NavItem[] => [
  {
    label: t.navEntrepreneurs,
    href: "/admin/entrepreneurs",
    icon: <Rocket className="size-4 shrink-0" />,
  },
  {
    label: t.navMemberDirectory,
    href: "/admin/users",
    icon: <Users className="size-4 shrink-0" />,
  },
  {
    label: t.navStaff,
    href: "/admin/admins",
    icon: <UserCog className="size-4 shrink-0" />,
  },
]

const siteNavItems = (t: {
  siteBranding: string
  siteHero: string
  siteFeatures: string
  sitePricing: string
}): SiteNavItem[] => [
  {
    label: t.siteBranding,
    href: "/admin/site/branding",
    section: "branding",
    icon: <Palette className="size-4 shrink-0" />,
  },
  {
    label: t.siteHero,
    href: "/admin/site/hero",
    section: "hero",
    icon: <Type className="size-4 shrink-0" />,
  },
  {
    label: t.siteFeatures,
    href: "/admin/site/features",
    section: "features",
    icon: <LayoutGrid className="size-4 shrink-0" />,
  },
  {
    label: t.sitePricing,
    href: "/admin/site/pricing",
    section: "pricing",
    icon: <BadgeDollarSign className="size-4 shrink-0" />,
  },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 rounded-lg border-s-[3px] border-transparent px-3 py-2 text-sm transition-colors",
        active
          ? "border-primary bg-gradient-to-r from-primary/12 to-transparent font-semibold text-primary shadow-sm"
          : "text-muted-foreground hover:border-border hover:bg-muted/80 hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      {item.icon}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  )
}

function canSeeSiteSection(
  isSuperAdmin: boolean,
  role: string | undefined,
  perms: AdminSiteSection[] | null | undefined,
  section: AdminSiteSection
): boolean {
  if (isSuperAdmin) return true
  if (role !== "admin") return false
  return Boolean(perms?.includes(section))
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout, isLoading: authLoading } = useAuthContext()
  const { locale, setLocale, t } = useAdminI18n()

  const isSuperAdmin = user?.role === "super_admin"
  const role = user?.role
  const perms = user?.admin_site_permissions
  const siteItems = siteNavItems(t)
  const visibleSiteItems = siteItems.filter((item) =>
    canSeeSiteSection(isSuperAdmin, role, perms, item.section)
  )

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-border/80 bg-gradient-to-b from-card via-card to-muted/30">
      <div className="border-b border-border/80 bg-gradient-to-r from-primary/[0.08] via-transparent to-teal-500/[0.06] px-4 py-5">
        <p className="text-lg font-semibold tracking-tight text-foreground">{t.title}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.sectionOverview}
        </div>
        {overviewNavItems(t).map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          />
        ))}

        <div className="px-3 pb-2 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.sectionUsers}
        </div>
        {memberNavItems(t).map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          />
        ))}

        {!authLoading && visibleSiteItems.length > 0 ? (
          <>
            <div className="px-3 pb-2 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.sectionSite}
            </div>
            {visibleSiteItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </>
        ) : null}
      </nav>

      <div className="space-y-3 border-t p-3">
        <div className="flex flex-wrap items-center gap-2">
          <AdminThemeToggle />
          <div className="flex gap-1">
            <Button
              type="button"
              variant={locale === "en" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setLocale("en")}
            >
              {t.localeEn}
            </Button>
            <Button
              type="button"
              variant={locale === "ar" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setLocale("ar")}
            >
              {t.localeAr}
            </Button>
          </div>
        </div>
        <Link
          href="/admin/profile"
          className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {t.adminProfile}
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center"
          onClick={() => void logout({ redirectTo: "/admin/login" })}
        >
          {t.logOut}
        </Button>
      </div>
    </aside>
  )
}
