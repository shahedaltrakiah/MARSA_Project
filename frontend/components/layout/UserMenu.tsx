"use client"

import Link from "next/link"
import { LayoutDashboard, LogOut, Shield, User } from "lucide-react"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function isStaffRole(role: string | undefined): boolean {
  return role === "admin" || role === "super_admin"
}

export default function UserMenu() {
  const { user, logout } = useAuth()
  const t = useTranslations("Workspace.userMenu")

  if (!user) return null

  const staff = isStaffRole(user.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted focus:outline-none">
        <Avatar size="sm">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {staff ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="flex cursor-pointer items-center gap-2">
                  <LayoutDashboard className="size-4 opacity-70" />
                  {t("adminDashboard")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="flex cursor-pointer items-center gap-2">
                  <Shield className="size-4 opacity-70" />
                  {t("adminAccount")}
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/app/projects" className="flex cursor-pointer items-center gap-2">
                  <LayoutDashboard className="size-4 opacity-70" />
                  {t("workspace")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/profile" className="flex cursor-pointer items-center gap-2">
                  <User className="size-4 opacity-70" />
                  {t("accountSettings")}
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
            <LogOut className="size-4" />
            {t("signOut")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
