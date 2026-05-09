"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { SectionWorkspace } from "@/components/project/SectionWorkspace"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"

export default function ReachPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.sections")
  const tTabs = useTranslations("Workspace.sectionTabs.reach")
  const tPage = useTranslations("Workspace.sectionPages.reach")
  const tabs = FLAT_SECTION_TAB_SLUGS.reach.map((slug) => ({ slug, label: tTabs(slug) }))

  return (
    <SectionWorkspace
      projectId={projectId}
      section="reach"
      title={t("reach")}
      description={tPage("description")}
      tabs={tabs}
    />
  )
}
