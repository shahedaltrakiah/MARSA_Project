"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { SectionWorkspace } from "@/components/project/SectionWorkspace"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"

export default function AssetsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.sections")
  const tTabs = useTranslations("Workspace.sectionTabs.assets")
  const tPage = useTranslations("Workspace.sectionPages.assets")
  const tabs = FLAT_SECTION_TAB_SLUGS.assets.map((slug) => ({ slug, label: tTabs(slug) }))

  return (
    <SectionWorkspace
      projectId={projectId}
      section="assets"
      title={t("assets")}
      description={tPage("description")}
      tabs={tabs}
    />
  )
}
