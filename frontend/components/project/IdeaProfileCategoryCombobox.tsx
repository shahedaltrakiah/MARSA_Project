"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronsUpDown } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/components/utils"

const LS_KEY = "marsa_idea_category_suggestions_v1"

const DEFAULT_CATEGORIES = [
  "SaaS",
  "FinTech",
  "HealthTech",
  "EdTech",
  "E-commerce",
  "Marketplace",
  "Agency / professional services",
  "Hardware / IoT",
  "Consumer mobile app",
  "B2B software",
  "Logistics / supply chain",
  "Food & beverage",
  "Real estate / PropTech",
  "Media / content",
  "Climate / sustainability",
  "Non-profit / social impact",
  "Other",
] as const

function readStoredCategories(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
  } catch {
    return []
  }
}

function persistCategory(label: string) {
  const t = label.trim()
  if (t.length < 2) return
  const lower = t.toLowerCase()
  const fromDefaults = DEFAULT_CATEGORIES.some((c) => c.toLowerCase() === lower)
  if (fromDefaults) return
  const stored = readStoredCategories()
  if (stored.some((c) => c.toLowerCase() === lower)) return
  const next = [t, ...stored].slice(0, 48)
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(next))
  } catch {
    // ignore quota
  }
}

export type IdeaProfileCategoryComboboxProps = {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}

type ListCoords = { top: number; left: number; width: number; maxH: number }

export function IdeaProfileCategoryCombobox({
  id,
  label,
  value,
  onChange,
  disabled,
}: IdeaProfileCategoryComboboxProps) {
  const t = useTranslations("Workspace.ideaProfile")
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [stored, setStored] = React.useState<string[]>([])
  const [coords, setCoords] = React.useState<ListCoords | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listPortalRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setStored(readStoredCategories())
  }, [])

  const allOptions = React.useMemo(() => {
    const merged = [...DEFAULT_CATEGORIES, ...stored]
    const seen = new Set<string>()
    const out: string[] = []
    for (const c of merged) {
      const k = c.trim().toLowerCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(c.trim())
    }
    return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
  }, [stored])

  const filtered = React.useMemo(() => {
    const q = draft.trim().toLowerCase()
    if (!q) return allOptions
    return allOptions.filter((c) => c.toLowerCase().includes(q))
  }, [allOptions, draft])

  const draftTrim = draft.trim()
  const canAddNew =
    draftTrim.length >= 2 &&
    !allOptions.some((c) => c.toLowerCase() === draftTrim.toLowerCase())

  const measure = React.useCallback(() => {
    if (!open || !rootRef.current) {
      setCoords(null)
      return
    }
    const r = rootRef.current.getBoundingClientRect()
    const maxH = Math.min(280, Math.max(100, window.innerHeight - r.bottom - 12))
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width, maxH })
  }, [open])

  React.useLayoutEffect(() => {
    measure()
  }, [open, measure, draft, filtered.length, value])

  React.useEffect(() => {
    if (!open) return
    window.addEventListener("scroll", measure, true)
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("scroll", measure, true)
      window.removeEventListener("resize", measure)
    }
  }, [open, measure])

  const closeList = React.useCallback(() => {
    setOpen(false)
    setDraft("")
    setCoords(null)
  }, [])

  React.useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const node = e.target as Node
      if (rootRef.current?.contains(node) || listPortalRef.current?.contains(node)) return
      closeList()
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open, closeList])

  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeList()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeList])

  function pick(option: string) {
    onChange(option)
    persistCategory(option)
    setStored(readStoredCategories())
    closeList()
  }

  function addNew() {
    if (!canAddNew || disabled) return
    persistCategory(draftTrim)
    setStored(readStoredCategories())
    onChange(draftTrim)
    closeList()
  }

  const listContent =
    open && !disabled && coords ? (
      <div
        ref={listPortalRef}
        id={`${id}-listbox`}
        role="listbox"
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          width: coords.width,
          maxHeight: coords.maxH,
          zIndex: 500,
        }}
        className="overflow-y-auto overscroll-contain rounded-md border bg-popover py-1 text-sm text-popover-foreground shadow-lg [scrollbar-width:thin]"
      >
        {canAddNew ? (
          <button
            type="button"
            role="option"
            aria-selected={false}
            className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-accent"
            onMouseDown={(e) => {
              e.preventDefault()
              addNew()
            }}
          >
            <span className="text-primary">{t("categoryAddNew", { value: draftTrim })}</span>
          </button>
        ) : null}
        {filtered.length === 0 && !canAddNew ? (
          <div className="px-3 py-2 text-muted-foreground">{t("categoryNoMatches")}</div>
        ) : null}
        {filtered.map((opt) => {
          const selected = opt.toLowerCase() === value.trim().toLowerCase()
          return (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-accent",
                selected && "bg-muted/80"
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(opt)
              }}
            >
              <Check className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")} aria-hidden />
              <span className="min-w-0 truncate">{opt}</span>
            </button>
          )
        })}
      </div>
    ) : null

  return (
    <div ref={rootRef} className="relative space-y-2">
      <Label htmlFor={`${id}-input`}>{label}</Label>
      <div className="flex min-w-0 gap-2">
        <Input
          id={`${id}-input`}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          disabled={disabled}
          value={open ? draft : value}
          placeholder={t("categorySearchPlaceholder")}
          onChange={(e) => {
            const v = e.target.value
            if (open) {
              setDraft(v)
            } else {
              onChange(v)
            }
          }}
          onFocus={() => {
            if (disabled) return
            setOpen(true)
            setDraft(value)
          }}
          onBlur={() => {
            window.setTimeout(() => closeList(), 150)
          }}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          disabled={disabled}
          aria-label={t("categoryOpenList")}
          onMouseDown={(e) => {
            e.preventDefault()
            if (open) {
              closeList()
            } else {
              setOpen(true)
              setDraft(value)
            }
          }}
        >
          <ChevronsUpDown className="size-4 opacity-60" />
        </Button>
      </div>

      {typeof document !== "undefined" && listContent ? createPortal(listContent, document.body) : null}
    </div>
  )
}
