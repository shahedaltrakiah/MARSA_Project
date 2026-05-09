import { REACH_TABS } from "@/components/project/pillar-section-fields"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"
import { subsectionHasMeaningfulContent } from "@/lib/workspaceSubsection"
import type { ProjectSectionContent, ProjectSectionName } from "@/types/api"

function countWorkspaceTabs(content: ProjectSectionContent, keys: readonly string[]): { filled: number; total: number } {
  let filled = 0
  for (const k of keys) {
    if (subsectionHasMeaningfulContent(content[k])) filled++
  }
  return { filled, total: keys.length }
}

function countPillarTotal(
  content: ProjectSectionContent,
  tabs: { pillar: string; fields: { key: string }[] }[]
): { filled: number; total: number } {
  let filled = 0
  let total = 0
  for (const tab of tabs) {
    const raw = content[tab.pillar]
    const obj =
      raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, string>) : {}
    for (const f of tab.fields) {
      total++
      if (typeof obj[f.key] === "string" && obj[f.key].trim().length > 0) filled++
    }
  }
  return { filled, total }
}

export function completionForSection(
  section: ProjectSectionName,
  content: ProjectSectionContent
): { filled: number; total: number; pct: number } {
  let filled = 0
  let total = 0

  switch (section) {
    case "offering": {
      const r = countWorkspaceTabs(content, FLAT_SECTION_TAB_SLUGS.offering)
      filled = r.filled
      total = r.total
      break
    }
    case "customer": {
      const r = countWorkspaceTabs(content, FLAT_SECTION_TAB_SLUGS.customer)
      filled = r.filled
      total = r.total
      break
    }
    case "money": {
      const r = countWorkspaceTabs(content, FLAT_SECTION_TAB_SLUGS.money)
      filled = r.filled
      total = r.total
      break
    }
    case "assets": {
      const r = countWorkspaceTabs(content, FLAT_SECTION_TAB_SLUGS.assets)
      filled = r.filled
      total = r.total
      break
    }
    case "action": {
      const r = countWorkspaceTabs(content, FLAT_SECTION_TAB_SLUGS.action)
      filled = r.filled
      total = r.total
      break
    }
    case "reach": {
      const r = countPillarTotal(content, REACH_TABS)
      filled = r.filled
      total = r.total
      break
    }
    case "targets": {
      const r = countWorkspaceTabs(content, FLAT_SECTION_TAB_SLUGS.targets)
      filled = r.filled
      total = r.total
      break
    }
  }

  const pct = total === 0 ? 0 : Math.round((filled / total) * 100)
  return { filled, total, pct }
}

export const DASHBOARD_SECTIONS: { key: ProjectSectionName; slug: string }[] = [
  { key: "offering", slug: "offering" },
  { key: "reach", slug: "reach" },
  { key: "customer", slug: "customer" },
  { key: "money", slug: "money" },
  { key: "assets", slug: "assets" },
  { key: "action", slug: "action" },
  { key: "targets", slug: "targets" },
]
