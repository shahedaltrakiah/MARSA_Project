"use client"

import * as React from "react"
import { Calendar, Star, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { NotesRichEditor } from "@/components/notes/NotesRichEditor"
import AiSuggestPanel from "@/components/project/AiSuggestPanel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/components/utils"
import type { PointOnTimeline } from "@/contexts/NotesRailContext"
import { useNotesRail } from "@/contexts/NotesRailContext"
import { useProjectSection } from "@/hooks/useProjectSection"
import type { FlatWorkspaceSection } from "@/lib/flatSectionWorkspace"
import {
  emptyWorkspaceSubsection,
  newWorkspacePoint,
  normalizeTabContent,
} from "@/lib/workspaceSubsection"
import type { ProjectSectionContent, WorkspacePoint, WorkspaceSubsectionData } from "@/types/api"

const pointInputClass =
  "min-h-[4.5rem] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-snug outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function collectPointTimelineMeta(
  byTab: Record<string, WorkspaceSubsectionData>,
  tabSlugs: readonly SectionWorkspaceTab[]
): { hints: Record<string, number>; details: Record<string, PointOnTimeline[]> } {
  const hints: Record<string, number> = {}
  const details: Record<string, PointOnTimeline[]> = {}
  const labelBy = new Map(tabSlugs.map((t) => [t.slug, t.label]))
  for (const { slug } of tabSlugs) {
    const tabLabel = labelBy.get(slug) ?? slug
    for (const p of byTab[slug]?.points ?? []) {
      const iso = p.target_date?.trim()
      if (!iso) continue
      hints[iso] = (hints[iso] ?? 0) + 1
      if (!details[iso]) details[iso] = []
      const text = (p.text || "").trim()
      details[iso].push({
        id: p.id,
        text: text.length ? text : "…",
        tabSlug: slug,
        tabLabel,
      })
    }
  }
  return { hints, details }
}

export type SectionWorkspaceTab = { slug: string; label: string }

export type SectionWorkspaceProps = {
  projectId: number
  section: FlatWorkspaceSection
  title: string
  description: string
  tabs: readonly SectionWorkspaceTab[]
  headerActions?: React.ReactNode
}

export function SectionWorkspace({ projectId, section, title, description, tabs, headerActions }: SectionWorkspaceProps) {
  const { collapsed: notesCollapsed, setPointDateHints, setPointDetailsByIso, selectNotesIso } = useNotesRail()
  const t = useTranslations("Workspace.sectionWorkspace")
  const { content, isLoading, isSaving, error, save } = useProjectSection(projectId, section)

  const [active, setActive] = React.useState(tabs[0]?.slug ?? "")
  const [byTab, setByTab] = React.useState<Record<string, WorkspaceSubsectionData>>({})
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [dateMenuPointId, setDateMenuPointId] = React.useState<string | null>(null)
  const datePopoverRef = React.useRef<HTMLDivElement>(null)
  const dateFieldRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const { hints, details } = collectPointTimelineMeta(byTab, tabs)
    setPointDateHints(hints)
    setPointDetailsByIso(details)
  }, [byTab, setPointDateHints, setPointDetailsByIso, tabs])

  React.useEffect(() => {
    return () => {
      setPointDateHints({})
      setPointDetailsByIso({})
    }
  }, [setPointDateHints, setPointDetailsByIso])

  React.useEffect(() => {
    if (!dateMenuPointId) return
    function onPointerDown(e: PointerEvent) {
      const el = datePopoverRef.current
      if (el && !el.contains(e.target as Node)) setDateMenuPointId(null)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [dateMenuPointId])

  React.useLayoutEffect(() => {
    if (!dateMenuPointId) return
    const el = dateFieldRef.current
    el?.focus()
    if (typeof el?.showPicker === "function") {
      try {
        el.showPicker()
      } catch {
        /* Safari / permissions */
      }
    }
  }, [dateMenuPointId])

  React.useEffect(() => {
    if (!tabs.length) return
    if (!tabs.some((x) => x.slug === active)) {
      setActive(tabs[0]!.slug)
    }
  }, [tabs, active])

  React.useEffect(() => {
    if (isLoading) return
    setByTab((prev) => {
      const next = { ...prev }
      for (const { slug } of tabs) {
        next[slug] = normalizeTabContent(content[slug])
      }
      return next
    })
  }, [isLoading, content, tabs])

  const patchPoint = React.useCallback((slug: string, id: string, patch: Partial<WorkspacePoint>) => {
    setByTab((prev) => {
      const cur = prev[slug] ?? emptyWorkspaceSubsection()
      return {
        ...prev,
        [slug]: {
          ...cur,
          points: cur.points.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        },
      }
    })
  }, [])

  const removePoint = React.useCallback((slug: string, id: string) => {
    setByTab((prev) => {
      const cur = prev[slug] ?? emptyWorkspaceSubsection()
      return {
        ...prev,
        [slug]: { ...cur, points: cur.points.filter((p) => p.id !== id) },
      }
    })
  }, [])

  const addPoint = React.useCallback((slug: string) => {
    setByTab((prev) => {
      const cur = prev[slug] ?? emptyWorkspaceSubsection()
      return {
        ...prev,
        [slug]: { ...cur, points: [...cur.points, newWorkspacePoint()] },
      }
    })
  }, [])

  async function onSave() {
    setSaveError(null)
    const payload: ProjectSectionContent = {}
    for (const { slug } of tabs) {
      const block = byTab[slug] ?? emptyWorkspaceSubsection()
      payload[slug] = {
        notes: block.notes,
        points: block.points.map((p) => ({
          id: p.id,
          text: p.text,
          starred: Boolean(p.starred),
          target_date: p.target_date && String(p.target_date).trim() ? p.target_date : null,
        })),
      }
    }
    try {
      await save(payload)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaveError(t("saveFailed"))
    }
  }

  return (
    <div className={cn("mx-auto w-full space-y-6", notesCollapsed ? "max-w-none" : "max-w-6xl")}>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {tabs.length ? (
            <Tabs value={active} onValueChange={setActive}>
              <TabsList variant="line" className="mb-1 w-full flex-wrap justify-start gap-1">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.slug} value={tab.slug} className="shrink-0">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.slug} value={tab.slug} className="mt-4 outline-none">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(380px,40%)] lg:items-start">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{t("pointsTitle")}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{t("pointsHint")}</p>
                      </div>

                      {isLoading ? (
                        <div className="space-y-2" aria-busy="true">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="h-20 animate-pulse rounded-lg border border-border/60 bg-muted/40"
                            />
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {(byTab[tab.slug]?.points ?? []).length === 0 ? (
                            <li className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                              {t("emptyPoints")}
                            </li>
                          ) : null}
                          {(byTab[tab.slug]?.points ?? []).map((pt, idx) => (
                            <li
                              key={pt.id}
                              className="rounded-xl border border-border/70 bg-card/50 p-2 shadow-sm ring-1 ring-border/20 sm:p-2.5"
                            >
                              <div className="flex flex-wrap items-start gap-2">
                                <span className="mt-1.5 w-5 shrink-0 text-center text-[11px] font-medium text-muted-foreground sm:mt-2 sm:w-6 sm:text-xs">
                                  {idx + 1}
                                </span>
                                <textarea
                                  className={cn(pointInputClass, "min-w-0 flex-1")}
                                  rows={3}
                                  value={pt.text}
                                  placeholder={t("pointPlaceholder")}
                                  onChange={(e) => patchPoint(tab.slug, pt.id, { text: e.target.value })}
                                  disabled={isSaving}
                                  aria-label={t("pointPlaceholder")}
                                />
                                <div
                                  ref={dateMenuPointId === pt.id ? datePopoverRef : undefined}
                                  className="flex shrink-0 items-center gap-0.5"
                                >
                                  <Button
                                    type="button"
                                    variant={pt.starred ? "secondary" : "ghost"}
                                    size="icon-sm"
                                    className="size-7 shrink-0"
                                    aria-label={t("markImportant")}
                                    aria-pressed={pt.starred}
                                    onClick={() => patchPoint(tab.slug, pt.id, { starred: !pt.starred })}
                                    disabled={isSaving}
                                  >
                                    <Star
                                      className={cn(
                                        "size-3.5 sm:size-4",
                                        pt.starred
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-muted-foreground"
                                      )}
                                    />
                                  </Button>
                                  <div className="relative">
                                    <Button
                                      type="button"
                                      variant={pt.target_date ? "secondary" : "ghost"}
                                      size="icon-sm"
                                      className="size-7 shrink-0"
                                      aria-label={t("pickTargetDate")}
                                      aria-expanded={dateMenuPointId === pt.id}
                                      onClick={() =>
                                        setDateMenuPointId((open) => (open === pt.id ? null : pt.id))
                                      }
                                      disabled={isSaving}
                                    >
                                      <Calendar className="size-3.5 sm:size-4" />
                                    </Button>
                                    {dateMenuPointId === pt.id ? (
                                      <div
                                        className="absolute end-0 top-full z-40 mt-1 flex min-w-[11rem] flex-col gap-1.5 rounded-lg border border-border bg-popover p-1.5 shadow-md"
                                        role="dialog"
                                        aria-label={t("targetDateLabel")}
                                      >
                                        <span className="sr-only">{t("targetDateLabel")}</span>
                                        <input
                                          ref={dateFieldRef}
                                          type="date"
                                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                                          value={pt.target_date ?? ""}
                                          onChange={(e) => {
                                            const v = e.target.value || null
                                            patchPoint(tab.slug, pt.id, { target_date: v })
                                            if (v) selectNotesIso(v)
                                            setDateMenuPointId(null)
                                          }}
                                          disabled={isSaving}
                                        />
                                        {pt.target_date ? (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                              patchPoint(tab.slug, pt.id, { target_date: null })
                                              setDateMenuPointId(null)
                                            }}
                                            disabled={isSaving}
                                          >
                                            {t("clearTargetDate")}
                                          </Button>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                    aria-label={t("removePoint")}
                                    onClick={() => removePoint(tab.slug, pt.id)}
                                    disabled={isSaving}
                                  >
                                    <Trash2 className="size-3.5 sm:size-4" />
                                  </Button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPoint(tab.slug)}
                        disabled={isLoading || isSaving}
                      >
                        {t("addPoint")}
                      </Button>
                    </div>

                    <div className="flex min-h-0 flex-col gap-2 rounded-xl border border-border/60 bg-muted/10 p-3 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-12rem)]">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{t("notesTitle")}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{t("notesHint")}</p>
                      </div>
                      <div className="min-h-[220px] flex-1">
                        <NotesRichEditor
                          key={tab.slug}
                          content={byTab[tab.slug]?.notes ?? "<p></p>"}
                          onChange={(html) => {
                            setByTab((prev) => ({
                              ...prev,
                              [tab.slug]: {
                                ...(prev[tab.slug] ?? emptyWorkspaceSubsection()),
                                notes: html,
                              },
                            }))
                          }}
                          placeholder={t("notesPlaceholder")}
                          className="h-full min-h-[200px]"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : null}

          <Separator />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
          {saved ? <p className="text-sm text-green-600 dark:text-green-400">{t("savedToast")}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" onClick={() => void onSave()} disabled={isSaving || isLoading}>
              {isSaving ? t("saving") : t("saveWorkspace")}
            </Button>
          </div>

          <AiSuggestPanel projectId={projectId} section={section} />
        </CardContent>
      </Card>
    </div>
  )
}
