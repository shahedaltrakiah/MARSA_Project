"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { SectionWorkspace } from "@/components/project/SectionWorkspace"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"

export default function CustomerPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.sections")
  const tTabs = useTranslations("Workspace.sectionTabs.customer")
  const tPage = useTranslations("Workspace.sectionPages.customer")
  const tabs = FLAT_SECTION_TAB_SLUGS.customer.map((slug) => ({ slug, label: tTabs(slug) }))

  return (
    <SectionWorkspace
      projectId={projectId}
      section="customer"
      title={t("customer")}
      description={tPage("description")}
      tabs={tabs}
    />
  )
}
