import type { ProjectSectionName } from "@/types/api"

/** Distinct accents per framework section (dot, border, soft fill). */
export const frameworkSectionStyle: Record<
  ProjectSectionName,
  { dot: string; border: string; soft: string; ring: string }
> = {
  offering: {
    dot: "bg-sky-500",
    border: "border-sky-500/70",
    soft: "bg-sky-500/12",
    ring: "ring-sky-500/25",
  },
  reach: {
    dot: "bg-violet-500",
    border: "border-violet-500/70",
    soft: "bg-violet-500/12",
    ring: "ring-violet-500/25",
  },
  customer: {
    dot: "bg-amber-500",
    border: "border-amber-500/70",
    soft: "bg-amber-500/12",
    ring: "ring-amber-500/25",
  },
  money: {
    dot: "bg-emerald-500",
    border: "border-emerald-500/70",
    soft: "bg-emerald-500/12",
    ring: "ring-emerald-500/25",
  },
  assets: {
    dot: "bg-orange-500",
    border: "border-orange-500/70",
    soft: "bg-orange-500/12",
    ring: "ring-orange-500/25",
  },
  action: {
    dot: "bg-rose-500",
    border: "border-rose-500/70",
    soft: "bg-rose-500/12",
    ring: "ring-rose-500/25",
  },
  targets: {
    dot: "bg-cyan-500",
    border: "border-cyan-500/70",
    soft: "bg-cyan-500/12",
    ring: "ring-cyan-500/25",
  },
}

export function frameworkDotClass(slug: ProjectSectionName): string {
  return frameworkSectionStyle[slug]?.dot ?? "bg-muted-foreground"
}
