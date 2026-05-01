"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { LaptopMinimal, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export type TopbarProps = {
  projectName?: string
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const nextTheme = theme === "midnight" ? "light" : "midnight"

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(nextTheme)}
      className="h-8"
      aria-label="Toggle theme"
    >
      <span className="inline-flex items-center gap-2">
        <span className="hidden sm:inline">Theme</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:inline" />
          <LaptopMinimal className="hidden" />
        </span>
      </span>
    </Button>
  )
}

export default function Topbar({ projectName = "Workspace" }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold tracking-wide hover:bg-muted"
          aria-label="MARSA home"
        >
          <span
            className="inline-flex size-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--marsa-accent-violet),var(--marsa-accent-teal))] text-primary-foreground"
            aria-hidden
          >
            M
          </span>
          <span>MARSA</span>
        </Link>

        <Separator orientation="vertical" className="h-6" />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{projectName}</div>
          <div className="truncate text-xs text-muted-foreground">
            Structured workspace for entrepreneurs
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}

