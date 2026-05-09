"use client"

import * as React from "react"
import { cn } from "@/components/utils"
import type {
  BalanceSheet,
  CACAnalysis,
  CashFlowStatement,
  FinancialInputs,
  IncomeStatement,
} from "./financialTypes"

// ─── Shared primitives ───────────────────────────────────────────────────────

export function fmt(currency: string, value: number) {
  return `${currency} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pct(value: number) {
  return `${value.toFixed(1)}%`
}

function Row({
  label,
  value,
  bold,
  indent,
  highlight,
}: {
  label: string
  value: string
  bold?: boolean
  indent?: boolean
  highlight?: "positive" | "negative" | "neutral"
}) {
  const valueColor =
    highlight === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : highlight === "negative"
        ? "text-destructive"
        : ""

  return (
    <tr className={cn("border-b border-border/40 last:border-0", bold && "font-semibold")}>
      <td className={cn("py-2 pr-4 text-sm text-foreground", indent && "pl-4 text-muted-foreground")}>
        {label}
      </td>
      <td className={cn("py-2 text-right text-sm tabular-nums", valueColor)}>{value}</td>
    </tr>
  )
}

function TableSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <tr>
        <td colSpan={2} className="pb-1 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </td>
      </tr>
      {children}
    </>
  )
}

function ResultTable({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full border-collapse">
      <tbody>{children}</tbody>
    </table>
  )
}

// ─── Income Statement ────────────────────────────────────────────────────────

export function IncomeStatementTab({
  data,
  currency,
}: {
  data: IncomeStatement
  currency: string
}) {
  const f = (v: number) => fmt(currency, v)

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Annual figures (Year 1)</p>
      <ResultTable>
        <TableSection title="Revenue">
          <Row label="Revenue" value={f(data.revenue)} bold />
          <Row label="Cost of Goods Sold (COGS)" value={f(data.cogs)} indent />
          <Row label="Gross Profit" value={f(data.grossProfit)} bold highlight={data.grossProfit >= 0 ? "positive" : "negative"} />
          <Row label="Gross Margin" value={pct(data.grossMarginPct)} indent />
        </TableSection>

        <TableSection title="Operating Expenses">
          <Row label="Rent" value={f(data.rent)} indent />
          <Row label="Utilities" value={f(data.utilities)} indent />
          <Row label="Salaries & Wages" value={f(data.salaries)} indent />
          <Row label="Office Supplies" value={f(data.officeSupplies)} indent />
          <Row label="Advertising" value={f(data.advertising)} indent />
          <Row label="Legal & Licensing" value={f(data.legalFees)} indent />
          <Row label="Depreciation" value={f(data.depreciation)} indent />
          <Row label="Other Expenses" value={f(data.otherExpenses)} indent />
          <Row label="Total Operating Expenses" value={f(data.totalOpEx)} bold />
        </TableSection>

        <TableSection title="Profit">
          <Row label="EBIT (Operating Income)" value={f(data.ebit)} bold highlight={data.ebit >= 0 ? "positive" : "negative"} />
          <Row label="Interest Expense" value={f(data.interestExpense)} indent />
          <Row label="Net Income" value={f(data.netIncome)} bold highlight={data.netIncome >= 0 ? "positive" : "negative"} />
        </TableSection>
      </ResultTable>
    </div>
  )
}

// ─── Cash Flow Statement ─────────────────────────────────────────────────────

export function CashFlowTab({
  data,
  currency,
}: {
  data: CashFlowStatement
  currency: string
}) {
  const f = (v: number) => fmt(currency, v)

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Annual cash flow (Year 1)</p>
      <ResultTable>
        <TableSection title="Operating Activities">
          <Row label="Net Income" value={f(data.netIncome)} />
          <Row label="Add: Depreciation" value={f(data.depreciation)} indent />
          <Row label="Change in Accounts Receivable" value={f(data.changeInAR)} indent />
          <Row label="Change in Accounts Payable" value={f(data.changeInAP)} indent />
          <Row label="Net Cash from Operations" value={f(data.netOperatingCF)} bold highlight={data.netOperatingCF >= 0 ? "positive" : "negative"} />
        </TableSection>

        <TableSection title="Investing Activities">
          <Row label="Capital Expenditures" value={f(data.capEx)} indent />
          <Row label="Net Cash from Investing" value={f(data.netInvestingCF)} bold highlight={data.netInvestingCF >= 0 ? "positive" : "negative"} />
        </TableSection>

        <TableSection title="Financing Activities">
          <Row label="Owner Equity Contribution" value={f(data.cashContribution)} indent />
          <Row label="Borrowing Received" value={f(data.borrowingReceived)} indent />
          <Row label="Loan Principal Repayment" value={f(data.loanRepayment)} indent />
          <Row label="Net Cash from Financing" value={f(data.netFinancingCF)} bold highlight={data.netFinancingCF >= 0 ? "positive" : "negative"} />
        </TableSection>

        <TableSection title="Summary">
          <Row label="Beginning Cash" value={f(data.beginningCash)} />
          <Row label="Net Change in Cash" value={f(data.netChangeCash)} />
          <Row label="Ending Cash" value={f(data.endingCash)} bold highlight={data.endingCash >= 0 ? "positive" : "negative"} />
        </TableSection>
      </ResultTable>
    </div>
  )
}

// ─── Balance Sheet ───────────────────────────────────────────────────────────

export function BalanceSheetTab({
  data,
  currency,
}: {
  data: BalanceSheet
  currency: string
}) {
  const f = (v: number) => fmt(currency, v)

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Year-end balance sheet (Year 1)</p>
      <ResultTable>
        <TableSection title="Assets">
          <Row label="Cash & Cash Equivalents" value={f(data.cash)} indent />
          <Row label="Accounts Receivable" value={f(data.accountsReceivable)} indent />
          <Row label="Total Current Assets" value={f(data.totalCurrentAssets)} bold />
          <Row label="Gross Fixed Assets" value={f(data.grossFixedAssets)} indent />
          <Row label="Less: Accumulated Depreciation" value={f(-data.accumulatedDepreciation)} indent />
          <Row label="Net Fixed Assets" value={f(data.netFixedAssets)} bold />
          <Row label="Total Assets" value={f(data.totalAssets)} bold highlight="neutral" />
        </TableSection>

        <TableSection title="Liabilities">
          <Row label="Accounts Payable" value={f(data.accountsPayable)} indent />
          <Row label="Loan Balance" value={f(data.loanBalance)} indent />
          <Row label="Total Liabilities" value={f(data.totalLiabilities)} bold />
        </TableSection>

        <TableSection title="Owner's Equity">
          <Row label="Owner Equity Contribution" value={f(data.ownerEquity)} indent />
          <Row label="Retained Earnings (Net Income)" value={f(data.retainedEarnings)} indent />
          <Row label="Total Equity" value={f(data.totalEquity)} bold />
          <Row label="Total Liabilities + Equity" value={f(data.totalLiabilitiesAndEquity)} bold highlight="neutral" />
        </TableSection>
      </ResultTable>
    </div>
  )
}

// ─── CAC Analysis ────────────────────────────────────────────────────────────

export function CACTab({
  data,
  inputs,
}: {
  data: CACAnalysis
  inputs: FinancialInputs
}) {
  const f = (v: number) => fmt(inputs.currency, v)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Customer acquisition & unit economics</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Marketing Spend", value: f(data.totalMarketingSpend), hint: "Annual advertising budget" },
          { label: "Units Sold", value: data.unitsSold.toLocaleString(), hint: "Annual units" },
          { label: "CAC per Unit", value: f(data.cacPerUnit), hint: "Marketing spend ÷ units sold" },
          { label: "Gross Profit per Unit", value: f(data.grossProfitPerUnit), hint: "(Revenue − COGS) ÷ units sold" },
          { label: "LTV (Gross Profit per Sale)", value: f(data.ltv), hint: "Lifetime value proxy" },
          {
            label: "LTV : CAC Ratio",
            value: data.cacPerUnit > 0 ? `${data.ltvToCacRatio.toFixed(2)}×` : "—",
            hint: "Above 3× is healthy",
          },
          {
            label: "Payback Period",
            value: data.paybackPeriodMonths > 0 ? `${data.paybackPeriodMonths.toFixed(1)} months` : "—",
            hint: "Months to recover CAC",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <span className="text-xs text-muted-foreground">{card.label}</span>
            <span className="text-lg font-semibold tabular-nums">{card.value}</span>
            <span className="text-xs text-muted-foreground">{card.hint}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
