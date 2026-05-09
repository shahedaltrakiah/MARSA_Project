"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FinancialStatementModal } from "@/components/project/financial/FinancialStatementModal"
import { SectionWorkspace } from "@/components/project/SectionWorkspace"
import { FLAT_SECTION_TAB_SLUGS } from "@/lib/flatSectionWorkspace"

export default function MoneyPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.sections")
  const tTabs = useTranslations("Workspace.sectionTabs.money")
  const tPage = useTranslations("Workspace.sectionPages.money")
  const tabs = FLAT_SECTION_TAB_SLUGS.money.map((slug) => ({ slug, label: tTabs(slug) }))

  const [financialOpen, setFinancialOpen] = useState(false)

  return (
    <>
      <SectionWorkspace
        projectId={projectId}
        section="money"
        title={t("money")}
        description={tPage("description")}
        tabs={tabs}
        headerActions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFinancialOpen(true)}
          >
            <BarChart3 className="size-4" />
            Financial Statement
          </Button>
        }
      />
      <FinancialStatementModal open={financialOpen} onClose={() => setFinancialOpen(false)} />
    </>
  )
}
