"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

import { useAdminI18n } from "@/components/admin/AdminI18nContext"

export function AdminThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useAdminI18n()
  const nextTheme = theme === "midnight" ? "light" : "midnight"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      className="size-8 shrink-0"
      aria-label={t.themeAria}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:inline" />
    </Button>
  )
}
