"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import type { PointOnTimeline } from "@/contexts/NotesRailContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/utils"

export type NotesTimelineView = "month" | "year"

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function textLen(html: string | undefined) {
  if (!html) return 0
  return stripHtml(html).length
}

function monthLabel(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(d)
}

export type NotesTimelineProps = {
  selectedIso: string
  onSelectIso: (iso: string) => void
  view: NotesTimelineView
  onViewChange: (v: NotesTimelineView) => void
  byDay: Record<string, string>
  /** Workspace points with target_date per day (year view activity dot). */
  pointDateHints?: Record<string, number>
  pointDetailsByIso?: Record<string, PointOnTimeline[]>
}

function dayActivity(noteLen: number, pointCount: number) {
  const p = pointCount > 0 ? Math.min(pointCount, 99) : 0
  if (noteLen > 0) return Math.min(noteLen + p, 99)
  return p
}

export function NotesTimeline({
  selectedIso,
  onSelectIso,
  view,
  onViewChange,
  byDay,
  pointDateHints = {},
  pointDetailsByIso = {},
}: NotesTimelineProps) {
  const t = useTranslations("Workspace.notes")
  const locale = useLocale()
  const intlLocale = locale === "ar" ? "ar-SA" : "en-US"
  const [summaryIso, setSummaryIso] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    if (!summaryIso) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSummaryIso(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [summaryIso])

  React.useEffect(() => {
    if (!summaryIso) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [summaryIso])

  React.useEffect(() => {
    if (!summaryIso) return
    if ((pointDetailsByIso[summaryIso]?.length ?? 0) === 0) setSummaryIso(null)
  }, [summaryIso, pointDetailsByIso])

  const monthRows = React.useMemo(() => {
    const anchor = startOfDay(new Date())
    const rows: { iso: string; date: Date; monthHeading: string | null; dayNum: string }[] = []
    const d = new Date(anchor)
    let prevHeading = ""
    for (let i = 0; i < 42; i++) {
      const iso = toIsoDate(d)
      const heading = monthLabel(d, locale)
      rows.push({
        iso,
        date: new Date(d),
        monthHeading: heading !== prevHeading ? heading : null,
        dayNum: pad2(d.getDate()),
      })
      prevHeading = heading
      d.setDate(d.getDate() - 1)
    }
    return rows
  }, [locale])

  const yearRows = React.useMemo(() => {
    const y = new Date().getFullYear()
    const rows: { key: string; label: string; count: number }[] = []
    for (let m = 11; m >= 0; m--) {
      const first = new Date(y, m, 1)
      const label = new Intl.DateTimeFormat(intlLocale, { month: "short", year: "numeric" }).format(first)
      let count = 0
      const daysInMonth = new Date(y, m + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const iso = `${y}-${pad2(m + 1)}-${pad2(day)}`
        const n = textLen(byDay[iso])
        const p = pointDateHints[iso] ?? 0
        if (dayActivity(n, p) > 0) count += 1
      }
      rows.push({ key: `${y}-${pad2(m + 1)}`, label, count })
    }
    return rows
  }, [byDay, intlLocale, pointDateHints])

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-border/50 pb-3">
      <div className="relative max-h-[200px] overflow-y-auto pe-1 ps-1">
        <div className="absolute start-3 top-0 bottom-0 w-px bg-border" aria-hidden />

        {view === "month" ? (
          <ul className="relative space-y-0">
            {monthRows.map((row) => {
              const selected = row.iso === selectedIso
              const pts = pointDetailsByIso[row.iso] ?? []
              const hasPoints = pts.length > 0
              return (
                <li key={row.iso} className="relative">
                  {row.monthHeading ? (
                    <div className="sticky top-0 z-[1] bg-card/95 py-1.5 ps-8 text-[11px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                      {row.monthHeading}
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      "relative flex w-full items-center gap-1 py-1.5 ps-8 pe-1 text-sm",
                      selected ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute start-1.5 top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-background",
                        selected ? "bg-[#f97084] shadow-[0_0_0_2px_rgba(249,112,132,0.35)]" : "bg-muted-foreground/35"
                      )}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => onSelectIso(row.iso)}
                      className={cn(
                        "min-w-0 flex-1 rounded-md py-0.5 text-start transition-colors",
                        selected ? "text-foreground" : "hover:text-foreground"
                      )}
                    >
                      <span className="inline-block w-7 text-end font-mono text-xs tabular-nums">{row.dayNum}</span>
                    </button>
                    {hasPoints ? (
                      <button
                        type="button"
                        className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-primary px-1.5 text-[10px] font-semibold tabular-nums text-primary-foreground shadow-sm hover:bg-primary/90"
                        aria-label={t("pointCountOnDay", { n: pts.length })}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSummaryIso(row.iso)
                        }}
                      >
                        {pts.length > 99 ? "99+" : String(pts.length)}
                      </button>
                    ) : (
                      <span className="size-7 shrink-0" aria-hidden />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="relative space-y-0">
            {yearRows.map((row) => {
              const selected = selectedIso.slice(0, 7) === row.key
              return (
                <li key={row.key} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectIso(`${row.key}-01`)
                      onViewChange("month")
                    }}
                    className={cn(
                      "relative flex w-full items-center gap-2 py-2 ps-8 pe-1 text-start text-sm transition-colors",
                      selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute start-1.5 top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-background",
                        row.count > 0 ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{row.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {mounted && summaryIso && (pointDetailsByIso[summaryIso]?.length ?? 0) > 0
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[200] bg-black/45 backdrop-blur-[1px]"
                aria-label={t("closeDaySummary")}
                onClick={() => setSummaryIso(null)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="notes-day-summary-title"
                className="fixed start-1/2 top-1/2 z-[201] w-[min(calc(100vw-2rem),22rem)] max-h-[min(70vh,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
                  <h2 id="notes-day-summary-title" className="text-sm font-semibold leading-snug">
                    {new Intl.DateTimeFormat(intlLocale, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(`${summaryIso}T12:00:00`))}
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 shrink-0"
                    onClick={() => setSummaryIso(null)}
                    aria-label={t("closeDaySummary")}
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
                <div className="max-h-[calc(min(70vh,28rem)-3.5rem)] overflow-y-auto px-4 py-3 text-sm">
                  <ul className="space-y-2">
                    {(pointDetailsByIso[summaryIso] ?? []).map((p) => (
                      <li
                        key={`${p.tabSlug}-${p.id}`}
                        className="rounded-lg border border-border/50 bg-background/80 px-3 py-2"
                      >
                        <p className="text-[11px] font-medium text-primary">{p.tabLabel}</p>
                        <p className="mt-1 line-clamp-6 text-xs leading-snug text-foreground">{p.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>,
            document.body
          )
        : null}

      <div className="flex rounded-full border border-border/60 bg-muted/30 p-0.5">
        <Button
          type="button"
          variant={view === "month" ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-8 flex-1 rounded-full text-xs font-medium",
            view === "month" ? "bg-[#f97084] text-white hover:bg-[#f97084] hover:text-white" : ""
          )}
          onClick={() => onViewChange("month")}
        >
          {t("timelineMonth")}
        </Button>
        <Button
          type="button"
          variant={view === "year" ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-8 flex-1 rounded-full text-xs font-medium",
            view === "year" ? "bg-[#f97084] text-white hover:bg-[#f97084] hover:text-white" : ""
          )}
          onClick={() => onViewChange("year")}
        >
          {t("timelineYear")}
        </Button>
      </div>
    </div>
  )
}
