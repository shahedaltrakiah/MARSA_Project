"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Download, FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculate } from "./financialCalculations"
import { exportToExcel } from "./financialExcelExport"
import { exportToWord } from "./financialWordExport"
import {
  BasicInfoSection,
  CapExSection,
  CreditTermsSection,
  FundsSection,
  OperatingExpensesSection,
  RevenueSection,
} from "./FinancialInputSections"
import {
  BalanceSheetTab,
  CACTab,
  CashFlowTab,
  IncomeStatementTab,
} from "./FinancialResultTabs"
import { EMPTY_FINANCIAL_INPUTS, type FinancialInputs } from "./financialTypes"

// ─── Modal shell ─────────────────────────────────────────────────────────────

type Props = { open: boolean; onClose: () => void }

export function FinancialStatementModal({ open, onClose }: Props) {
  const [inputs, setInputs] = React.useState<FinancialInputs>(EMPTY_FINANCIAL_INPUTS)
  const [activeTab, setActiveTab] = React.useState("input")

  const results = React.useMemo(() => calculate(inputs), [inputs])

  function patch(partial: Partial<FinancialInputs>) {
    setInputs((prev) => ({ ...prev, ...partial }))
  }

  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[900] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 my-4 w-full max-w-4xl rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">Financial Statement</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Fill in the inputs to auto-generate your financial statements
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab !== "input" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void exportToExcel(inputs)}
                >
                  <Download className="size-4" />
                  Export Excel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void exportToWord(inputs)}
                >
                  <FileText className="size-4" />
                  Export Word
                </Button>
              </>
            ) : null}
            <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="line" className="mb-6 w-full flex-wrap justify-start gap-1">
              {[
                { value: "input", label: "Input" },
                { value: "income", label: "Income Statement" },
                { value: "cashflow", label: "Cash Flow" },
                { value: "balance", label: "Balance Sheet" },
                { value: "cac", label: "CAC" },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="input">
              <div className="max-h-[65vh] space-y-8 overflow-y-auto pr-1 [scrollbar-width:thin]">
                <BasicInfoSection inputs={inputs} onChange={patch} />
                <RevenueSection inputs={inputs} onChange={patch} />
                <OperatingExpensesSection inputs={inputs} onChange={patch} />
                <CapExSection inputs={inputs} onChange={patch} />
                <FundsSection inputs={inputs} onChange={patch} />
                <CreditTermsSection inputs={inputs} onChange={patch} />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" onClick={() => setActiveTab("income")}>
                  View Results →
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="income">
              <div className="max-h-[65vh] overflow-y-auto pr-1 [scrollbar-width:thin]">
                <IncomeStatementTab data={results.incomeStatement} currency={inputs.currency} />
              </div>
            </TabsContent>

            <TabsContent value="cashflow">
              <div className="max-h-[65vh] overflow-y-auto pr-1 [scrollbar-width:thin]">
                <CashFlowTab data={results.cashFlow} currency={inputs.currency} />
              </div>
            </TabsContent>

            <TabsContent value="balance">
              <div className="max-h-[65vh] overflow-y-auto pr-1 [scrollbar-width:thin]">
                <BalanceSheetTab data={results.balanceSheet} currency={inputs.currency} />
              </div>
            </TabsContent>

            <TabsContent value="cac">
              <div className="max-h-[65vh] overflow-y-auto pr-1 [scrollbar-width:thin]">
                <CACTab data={results.cac} inputs={inputs} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>,
    document.body
  )
}
