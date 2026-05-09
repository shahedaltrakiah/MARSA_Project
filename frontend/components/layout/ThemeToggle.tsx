"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("Workspace.aria")

  const nextTheme = theme === "midnight" ? "light" : "midnight"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      className="size-8 shrink-0"
      aria-label={t("toggleTheme")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:inline" />
    </Button>
  )
}
