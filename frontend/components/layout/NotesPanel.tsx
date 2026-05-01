"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export type NotesPanelProps = {
  defaultCollapsed?: boolean
}

export default function NotesPanel({ defaultCollapsed = false }: NotesPanelProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const params = useParams<{ id?: string }>()
  const projectId = params?.id ?? "unknown"
  const storageKey = `marsa_notes_${projectId}`

  const [notes, setNotes] = React.useState(() => {
    try {
      return window.localStorage.getItem(storageKey) ?? ""
    } catch {
      return ""
    }
  })

  // debounced save (800ms)
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, notes)
      } catch {
        // ignore localStorage failures
      }
    }, 800)
    return () => window.clearTimeout(id)
  }, [notes, storageKey])

  return (
    <aside
      className={[
        "relative h-[calc(100vh-3.5rem)] border-l bg-card transition-[width] duration-200",
        collapsed ? "w-12" : "w-[280px]",
      ].join(" ")}
    >
      <div className="flex h-14 items-center justify-between px-3">
        <div className={collapsed ? "sr-only" : "text-sm font-medium"}>Notes</div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand notes panel" : "Collapse notes panel"}
        >
          {collapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>

      <Separator />

      <div className={collapsed ? "hidden" : "p-3"}>
        <div className="space-y-2">
          <div className="rounded-lg border bg-background p-3 text-sm">
            <div className="font-medium">Project notes</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Auto-saved locally for this project. No backend required.
            </div>
            <textarea
              className="mt-3 h-40 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write decisions, next steps, and ideas…"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Saved to <span className="font-mono">{storageKey}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

