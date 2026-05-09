"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { SectionWorkspace } from "@/components/project/SectionWorkspace"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"

export default function ActionPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.sections")
  const tTabs = useTranslations("Workspace.sectionTabs.action")
  const tPage = useTranslations("Workspace.sectionPages.action")
  const tabs = FLAT_SECTION_TAB_SLUGS.action.map((slug) => ({ slug, label: tTabs(slug) }))

  return (
    <SectionWorkspace
      projectId={projectId}
      section="action"
      title={t("action")}
      description={tPage("description")}
      tabs={tabs}
    />
  )
}
