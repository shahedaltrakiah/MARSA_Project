import type { ProjectSectionContent } from "@/types/api"

/** Read a top-level string field; ignores nested pillar objects. */
export function readFlatString(c: ProjectSectionContent, key: string): string {
  const v = c[key]
  return typeof v === "string" ? v : ""
}
