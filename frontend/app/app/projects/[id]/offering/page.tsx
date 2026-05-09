"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { SectionWorkspace } from "@/components/project/SectionWorkspace"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"

export default function OfferingPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.sections")
  const tTabs = useTranslations("Workspace.sectionTabs.offering")
  const tPage = useTranslations("Workspace.sectionPages.offering")
  const tabs = FLAT_SECTION_TAB_SLUGS.offering.map((slug) => ({ slug, label: tTabs(slug) }))

  return (
    <SectionWorkspace
      projectId={projectId}
      section="offering"
      title={t("offering")}
      description={tPage("description")}
      tabs={tabs}
    />
  )
}
