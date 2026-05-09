"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/components/utils"

export type Scenario = {
  monthly_revenue: string
  monthly_costs: string
  funding_available: string
}

export type ScenariosState = {
  base: Scenario
  optimistic: Scenario
  pessimistic: Scenario
}

export const EMPTY_SCENARIO: Scenario = {
  monthly_revenue: "",
  monthly_costs: "",
  funding_available: "",
}

export const EMPTY_SCENARIOS: ScenariosState = {
  base: { ...EMPTY_SCENARIO },
  optimistic: { ...EMPTY_SCENARIO },
  pessimistic: { ...EMPTY_SCENARIO },
}

function parseNum(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

function burnRate(s: Scenario): number {
  return parseNum(s.monthly_costs) - parseNum(s.monthly_revenue)
}

function runwayLabel(s: Scenario): string {
  const burn = burnRate(s)
  const fund = parseNum(s.funding_available)
  if (burn <= 0) return "∞"
  const months = fund / burn
  if (!Number.isFinite(months) || months < 0) return "—"
  return months.toFixed(1)
}

type Props = {
  scenarios: ScenariosState
  onChange: (next: ScenariosState) => void
  disabled?: boolean
}

export function FinancialScenariosWizard({ scenarios, onChange, disabled }: Props) {
  function update(key: keyof ScenariosState, field: keyof Scenario, value: string) {
    onChange({
      ...scenarios,
      [key]: { ...scenarios[key], [field]: value },
    })
  }

  const cols: { id: keyof ScenariosState; title: string; headerClass: string }[] = [
    { id: "base", title: "Base", headerClass: "bg-muted text-foreground" },
    {
      id: "optimistic",
      title: "Optimistic",
      headerClass: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-100",
    },
    {
      id: "pessimistic",
      title: "Pessimistic",
      headerClass: "bg-orange-500/15 text-orange-900 dark:text-orange-100",
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Financial Scenarios</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((col) => {
          const s = scenarios[col.id]
          const burn = burnRate(s)
          return (
            <div
              key={col.id}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className={cn("px-3 py-2 text-center text-sm font-semibold", col.headerClass)}>
                {col.title}
              </div>
              <div className="space-y-3 p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Monthly Revenue</Label>
                  <Input
                    inputMode="decimal"
                    value={s.monthly_revenue}
                    onChange={(e) => update(col.id, "monthly_revenue", e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Monthly Costs</Label>
                  <Input
                    inputMode="decimal"
                    value={s.monthly_costs}
                    onChange={(e) => update(col.id, "monthly_costs", e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Burn Rate</Label>
                  <Input
                    readOnly
                    value={Number.isFinite(burn) ? String(burn) : ""}
                    className="bg-muted/60"
                    disabled
                  />
                  <p className="text-[11px] text-muted-foreground">Costs − revenue</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Runway (months)</Label>
                  <Input readOnly value={runwayLabel(s)} className="bg-muted/60" disabled />
                  <p className="text-[11px] text-muted-foreground">
                    Funding ÷ burn (if burn &gt; 0, else ∞)
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Funding Available</Label>
                  <Input
                    inputMode="decimal"
                    value={s.funding_available}
                    onChange={(e) => update(col.id, "funding_available", e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
