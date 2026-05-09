"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { NotesRichEditor } from "@/components/notes/NotesRichEditor"
import { NotesTimeline, type NotesTimelineView } from "@/components/notes/NotesTimeline"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useNotesRail } from "@/contexts/NotesRailContext"

export type NotesPanelProps = {
  defaultCollapsed?: boolean
}

type NotesStore = {
  byDay: Record<string, string>
  view: NotesTimelineView
}

function todayIso() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function loadStore(projectId: string, legacyKey: string, v2Key: string): NotesStore {
  try {
    const raw = window.localStorage.getItem(v2Key)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NotesStore>
      return {
        byDay: typeof parsed.byDay === "object" && parsed.byDay !== null ? parsed.byDay : {},
        view: parsed.view === "year" ? "year" : "month",
      }
    }
    const legacy = window.localStorage.getItem(legacyKey)
    const byDay: Record<string, string> = {}
    if (legacy && legacy.trim()) {
      const esc = legacy
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      byDay[todayIso()] = `<p>${esc.replace(/\n/g, "<br />")}</p>`
    }
    return { byDay, view: "month" }
  } catch {
    return { byDay: {}, view: "month" }
  }
}

export default function NotesPanel(_props: NotesPanelProps) {
  const { collapsed, setCollapsed, pointDateHints, pointDetailsByIso, registerSelectNotesIso } = useNotesRail()
  const t = useTranslations("Workspace.notes")
  const params = useParams<{ id?: string }>()
  const projectId = params?.id ?? "unknown"
  const legacyKey = `marsa_notes_${projectId}`
  const storageKey = `marsa_notes_v2_${projectId}`

  const [store, setStore] = React.useState<NotesStore>(() => ({
    byDay: {},
    view: "month",
  }))
  const [selectedIso, setSelectedIso] = React.useState(todayIso)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setStore(loadStore(projectId, legacyKey, storageKey))
    setSelectedIso(todayIso())
    setHydrated(true)
  }, [legacyKey, projectId, storageKey])

  React.useLayoutEffect(() => {
    registerSelectNotesIso((iso) => {
      setSelectedIso(iso)
    })
    return () => registerSelectNotesIso(null)
  }, [registerSelectNotesIso])

  React.useEffect(() => {
    if (!hydrated) return
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(store))
      } catch {
        // ignore
      }
    }, 800)
    return () => window.clearTimeout(id)
  }, [hydrated, storageKey, store])

  const editorHtml = store.byDay[selectedIso] ?? "<p></p>"

  const onEditorChange = React.useCallback((html: string) => {
    setStore((s) => ({
      ...s,
      byDay: { ...s.byDay, [selectedIso]: html },
    }))
  }, [selectedIso])

  return (
    <aside
      className={[
        "relative hidden h-full min-h-0 shrink-0 border-l bg-card transition-[width] duration-200 md:flex md:flex-col",
        collapsed ? "w-12" : "w-[min(100%,420px)] sm:w-[400px]",
      ].join(" ")}
    >
      <div className="flex h-11 min-h-11 items-center justify-between px-2 sm:px-3">
        <div className={collapsed ? "sr-only" : "text-sm font-medium"}>{t("title")}</div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? t("expand") : t("collapse")}
        >
          {collapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>

      <Separator />

      <div className={collapsed ? "hidden" : "flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"}>
        <div className="shrink-0 px-3 pt-3">
          <NotesTimeline
            selectedIso={selectedIso}
            onSelectIso={setSelectedIso}
            view={store.view}
            onViewChange={(view) => setStore((s) => ({ ...s, view }))}
            byDay={store.byDay}
            pointDateHints={pointDateHints}
            pointDetailsByIso={pointDetailsByIso}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3 pt-1">
          <div className="text-xs font-medium text-foreground">{t("projectNotes")}</div>
          <p className="text-[11px] leading-snug text-muted-foreground">{t("hintRich")}</p>
          <NotesRichEditor
            key={selectedIso}
            content={editorHtml}
            onChange={onEditorChange}
            placeholder={t("placeholder")}
            className="min-h-0 flex-1"
          />
          <div className="shrink-0 text-[11px] text-muted-foreground">
            {t("savedTo")} <span className="font-mono">{storageKey}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
