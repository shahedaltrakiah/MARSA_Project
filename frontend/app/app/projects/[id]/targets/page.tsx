"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { SectionWorkspace } from "@/components/project/SectionWorkspace"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"

export default function TargetsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.sections")
  const tTabs = useTranslations("Workspace.sectionTabs.targets")
  const tPage = useTranslations("Workspace.sectionPages.targets")
  const tabs = FLAT_SECTION_TAB_SLUGS.targets.map((slug) => ({ slug, label: tTabs(slug) }))

  return (
    <SectionWorkspace
      projectId={projectId}
      section="targets"
      title={t("targets")}
      description={tPage("description")}
      tabs={tabs}
    />
  )
}
