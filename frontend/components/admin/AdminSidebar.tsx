'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  BadgeDollarSign,
  LayoutGrid,
  Palette,
  Type,
  Users,
} from 'lucide-react'

import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/components/utils'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

const usersNavItems: NavItem[] = [
  {
    label: 'Users',
    href: '/admin/users',
    icon: <Users className="size-4" />,
  },
]

const siteNavItems: NavItem[] = [
  {
    label: 'Branding',
    href: '/admin/site/branding',
    icon: <Palette className="size-4" />,
  },
  {
    label: 'Hero',
    href: '/admin/site/hero',
    icon: <Type className="size-4" />,
  },
  {
    label: 'Features',
    href: '/admin/site/features',
    icon: <LayoutGrid className="size-4" />,
  },
  {
    label: 'Pricing',
    href: '/admin/site/pricing',
    icon: <BadgeDollarSign className="size-4" />,
  },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      aria-current={active ? 'page' : undefined}
    >
      {item.icon}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const isSuperAdmin = user?.role === 'super_admin'

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card min-h-screen">
      <div className="border-b px-4 py-5">
        <p className="text-lg font-semibold tracking-tight">MARSA Admin</p>
        <Link
          href="/app/projects"
          className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to app
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="px-3 pb-2 pt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Users
        </div>
        {usersNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname.startsWith(item.href)}
          />
        ))}

        {isSuperAdmin ? (
          <>
            <div className="px-3 pb-2 pt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Site
            </div>
            {siteNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </>
        ) : null}
      </nav>
    </aside>
  )
}
