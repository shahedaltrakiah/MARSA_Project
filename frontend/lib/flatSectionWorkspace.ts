import type { ProjectSectionName } from "@/types/api"

/** Framework sections that use the tabbed workspace (Reach, Targets, etc.). */
export type FlatWorkspaceSection = ProjectSectionName

/** Backend `ProjectSectionController::FLAT_SECTIONS` keys per section — keep in sync. */
export const FLAT_SECTION_TAB_SLUGS: Record<FlatWorkspaceSection, readonly string[]> = {
  offering: ["value_proposition", "swot", "solution", "future_growth"],
  reach: ["business_model", "branding", "marketing", "sales"],
  customer: ["segments", "profile", "market", "journey"],
  money: ["investment", "revenue", "cac_clv", "cashflow"],
  assets: ["team", "partners", "setup", "technology"],
  action: ["tasks", "research", "validation", "kpis"],
  targets: ["cash", "position", "awareness", "value"],
}
