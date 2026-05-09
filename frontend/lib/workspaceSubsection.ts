import type { WorkspacePoint, WorkspaceSubsectionData } from "@/types/api"

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function emptyWorkspaceSubsection(): WorkspaceSubsectionData {
  return { notes: "<p></p>", points: [] }
}

export function newWorkspacePoint(overrides: Partial<WorkspacePoint> = {}): WorkspacePoint {
  return {
    id: newId(),
    text: "",
    starred: false,
    target_date: null,
    ...overrides,
  }
}

/** Strip HTML tags for “has content” checks. */
export function plainTextFromHtml(html: string): string {
  if (!html.trim()) return ""
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Normalizes API tab payload: workspace JSON, legacy plain string, or legacy record of strings
 * (e.g. old pillar field maps) into `{ notes, points }`.
 */
export function normalizeTabContent(raw: unknown): WorkspaceSubsectionData {
  if (typeof raw === "string" || (raw && typeof raw === "object" && !Array.isArray(raw) && ("points" in raw || "notes" in raw))) {
    return normalizeWorkspaceSubsection(raw)
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyWorkspaceSubsection()
  }
  const o = raw as Record<string, unknown>
  const points: WorkspacePoint[] = []
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string" && v.trim()) {
      const label = k.replace(/_/g, " ")
      points.push(newWorkspacePoint({ text: `${label}: ${v.trim()}` }))
    }
  }
  return { notes: "<p></p>", points }
}

export function normalizeWorkspaceSubsection(raw: unknown): WorkspaceSubsectionData {
  if (typeof raw === "string") {
    const t = raw.trim()
    if (!t) return emptyWorkspaceSubsection()
    return {
      notes: "<p></p>",
      points: [newWorkspacePoint({ text: t })],
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyWorkspaceSubsection()
  }
  const o = raw as Record<string, unknown>
  const notes = typeof o.notes === "string" ? o.notes : "<p></p>"
  const rawPoints = o.points
  const points: WorkspacePoint[] = []
  if (Array.isArray(rawPoints)) {
    for (const p of rawPoints) {
      if (!p || typeof p !== "object" || Array.isArray(p)) continue
      const row = p as Record<string, unknown>
      const id = typeof row.id === "string" && row.id ? row.id : newId()
      const text = typeof row.text === "string" ? row.text : ""
      const starred = Boolean(row.starred)
      const td = row.target_date
      const target_date =
        td === null || td === undefined
          ? null
          : typeof td === "string" && td.trim()
            ? td.trim().slice(0, 32)
            : null
      points.push({ id, text, starred, target_date })
    }
  }
  return { notes: notes || "<p></p>", points }
}

export function subsectionHasMeaningfulContent(raw: unknown): boolean {
  if (typeof raw === "string") return raw.trim().length > 0
  const w = normalizeTabContent(raw)
  if (plainTextFromHtml(w.notes).length > 0) return true
  return w.points.some((p) => p.text.trim().length > 0)
}
