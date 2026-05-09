"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/components/utils"
import type {
  CapExCustomItem,
  FinancialInputs,
  OtherExpense,
  OtherFundSource,
} from "./financialTypes"
import { CURRENCIES, PRODUCT_CATEGORIES } from "./financialTypes"

// ─── Primitives ──────────────────────────────────────────────────────────────

function FieldRow({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  )
}

function NumField({
  value,
  onChange,
  placeholder,
  prefix,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  prefix?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      {prefix ? (
        <span className="shrink-0 text-sm text-muted-foreground">{prefix}</span>
      ) : null}
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Enter value"}
        className="max-w-56"
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="border-b border-border pb-1.5 text-sm font-semibold text-foreground">
      {children}
    </h4>
  )
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Section 1: Basic Info ───────────────────────────────────────────────────

export function BasicInfoSection({
  inputs,
  onChange,
}: {
  inputs: FinancialInputs
  onChange: (patch: Partial<FinancialInputs>) => void
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>General</SectionTitle>
      <FieldRow label="Select Currency">
        <select
          value={inputs.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
          className="h-9 w-full max-w-56 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="What is the product/service you are selling?" hint="Describe what you sell">
        <Input
          value={inputs.productDescription}
          onChange={(e) => onChange({ productDescription: e.target.value })}
          placeholder="e.g. B2B project management SaaS"
          className="max-w-96"
        />
      </FieldRow>

      <FieldRow
        label="What best describes what you sell?"
        hint="Car, Mobile, Software, your deliverable…"
      >
        <select
          value={inputs.productCategory}
          onChange={(e) => onChange({ productCategory: e.target.value })}
          className="h-9 w-full max-w-56 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Select category</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FieldRow>
    </div>
  )
}

// ─── Section 2: Revenue ──────────────────────────────────────────────────────

export function RevenueSection({
  inputs,
  onChange,
}: {
  inputs: FinancialInputs
  onChange: (patch: Partial<FinancialInputs>) => void
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>Revenue</SectionTitle>
      <FieldRow
        label="How many units do you expect to sell annually?"
        hint="The quantity you will be selling over a year"
      >
        <NumField value={inputs.annualUnitsSold} onChange={(v) => onChange({ annualUnitsSold: v })} />
      </FieldRow>
      <FieldRow
        label="What is the selling price per unit?"
        hint="The price of your good or service"
      >
        <NumField
          value={inputs.sellingPricePerUnit}
          onChange={(v) => onChange({ sellingPricePerUnit: v })}
          prefix={inputs.currency}
        />
      </FieldRow>
      <FieldRow
        label="What is your unit cost?"
        hint="The cost you pay your supplier or your production cost"
      >
        <NumField
          value={inputs.unitCost}
          onChange={(v) => onChange({ unitCost: v })}
          prefix={inputs.currency}
        />
      </FieldRow>
      <FieldRow
        label="How many units will be purchased for the year?"
        hint="The quantity you purchase from your supplier or the quantity produced"
      >
        <NumField
          value={inputs.annualUnitsPurchased}
          onChange={(v) => onChange({ annualUnitsPurchased: v })}
        />
      </FieldRow>
    </div>
  )
}

// ─── Section 3: Operating Expenses ──────────────────────────────────────────

export function OperatingExpensesSection({
  inputs,
  onChange,
}: {
  inputs: FinancialInputs
  onChange: (patch: Partial<FinancialInputs>) => void
}) {
  function addOther() {
    onChange({
      otherExpenses: [...inputs.otherExpenses, { id: uid(), description: "", value: "" }],
    })
  }

  function patchOther(id: string, patch: Partial<OtherExpense>) {
    onChange({
      otherExpenses: inputs.otherExpenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })
  }

  function removeOther(id: string) {
    onChange({ otherExpenses: inputs.otherExpenses.filter((e) => e.id !== id) })
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Operating Expenses</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Annual rent" hint="Amount you pay your landlord per year">
          <NumField value={inputs.annualRent} onChange={(v) => onChange({ annualRent: v })} prefix={inputs.currency} />
        </FieldRow>
        <FieldRow label="Annual utilities" hint="Electricity, water, phone, etc.">
          <NumField value={inputs.annualUtilities} onChange={(v) => onChange({ annualUtilities: v })} prefix={inputs.currency} />
        </FieldRow>
        <FieldRow label="Number of employees" hint="People you employ">
          <NumField value={inputs.numEmployees} onChange={(v) => onChange({ numEmployees: v })} />
        </FieldRow>
        <FieldRow label="Annual salary per employee" hint="Average compensation per employee">
          <NumField value={inputs.employeeAnnualSalary} onChange={(v) => onChange({ employeeAnnualSalary: v })} prefix={inputs.currency} />
        </FieldRow>
        <FieldRow label="Number of managers" hint="Number of supervisors">
          <NumField value={inputs.numManagers} onChange={(v) => onChange({ numManagers: v })} />
        </FieldRow>
        <FieldRow label="Manager's annual salary" hint="Average compensation per manager">
          <NumField value={inputs.managerAnnualSalary} onChange={(v) => onChange({ managerAnnualSalary: v })} prefix={inputs.currency} />
        </FieldRow>
        <FieldRow label="Office supplies (annual)" hint="Stationery and office-related expenses">
          <NumField value={inputs.officeSupplies} onChange={(v) => onChange({ officeSupplies: v })} prefix={inputs.currency} />
        </FieldRow>
        <FieldRow label="Advertising spend" hint="Marketing and advertising budget">
          <NumField value={inputs.advertising} onChange={(v) => onChange({ advertising: v })} prefix={inputs.currency} />
        </FieldRow>
        <FieldRow label="Legal & licensing fees">
          <NumField value={inputs.legalFees} onChange={(v) => onChange({ legalFees: v })} prefix={inputs.currency} />
        </FieldRow>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Other expenses</Label>
        {inputs.otherExpenses.map((e) => (
          <div key={e.id} className="flex gap-2">
            <Input
              value={e.description}
              onChange={(ev) => patchOther(e.id, { description: ev.target.value })}
              placeholder="Expense description"
              className="flex-1"
            />
            <Input
              inputMode="decimal"
              value={e.value}
              onChange={(ev) => patchOther(e.id, { value: ev.target.value })}
              placeholder="Value"
              className="w-32"
            />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeOther(e.id)}>
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addOther}>
          <Plus className="size-4" /> Add expense
        </Button>
      </div>
    </div>
  )
}

// ─── Section 4: Capital Expenditures ────────────────────────────────────────

function CapExPair({
  label,
  hint,
  value,
  lifeYears,
  currency,
  onValue,
  onLife,
}: {
  label: string
  hint: string
  value: string
  lifeYears: string
  currency: string
  onValue: (v: string) => void
  onLife: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{currency}</span>
          <Input inputMode="decimal" value={value} onChange={(e) => onValue(e.target.value)} placeholder="Value" className="w-32" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Life (yrs)</span>
          <Input inputMode="decimal" value={lifeYears} onChange={(e) => onLife(e.target.value)} placeholder="Years" className="w-24" />
        </div>
      </div>
    </div>
  )
}

export function CapExSection({
  inputs,
  onChange,
}: {
  inputs: FinancialInputs
  onChange: (patch: Partial<FinancialInputs>) => void
}) {
  function addOther() {
    onChange({
      otherCapEx: [...inputs.otherCapEx, { id: uid(), name: "", value: "", lifeYears: "" }],
    })
  }

  function patchOther(id: string, patch: Partial<CapExCustomItem>) {
    onChange({ otherCapEx: inputs.otherCapEx.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  }

  function removeOther(id: string) {
    onChange({ otherCapEx: inputs.otherCapEx.filter((i) => i.id !== id) })
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Capital Expenditures</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <CapExPair
          label="Computers"
          hint="Value of computers needed"
          value={inputs.computers.value}
          lifeYears={inputs.computers.lifeYears}
          currency={inputs.currency}
          onValue={(v) => onChange({ computers: { ...inputs.computers, value: v } })}
          onLife={(v) => onChange({ computers: { ...inputs.computers, lifeYears: v } })}
        />
        <CapExPair
          label="Furniture"
          hint="Value of furniture needed"
          value={inputs.furniture.value}
          lifeYears={inputs.furniture.lifeYears}
          currency={inputs.currency}
          onValue={(v) => onChange({ furniture: { ...inputs.furniture, value: v } })}
          onLife={(v) => onChange({ furniture: { ...inputs.furniture, lifeYears: v } })}
        />
        <CapExPair
          label="Equipment"
          hint="Value of machinery needed"
          value={inputs.equipment.value}
          lifeYears={inputs.equipment.lifeYears}
          currency={inputs.currency}
          onValue={(v) => onChange({ equipment: { ...inputs.equipment, value: v } })}
          onLife={(v) => onChange({ equipment: { ...inputs.equipment, lifeYears: v } })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Other capital items</Label>
        {inputs.otherCapEx.map((item) => (
          <div key={item.id} className="flex flex-wrap gap-2">
            <Input value={item.name} onChange={(e) => patchOther(item.id, { name: e.target.value })} placeholder="Item name" className="w-36" />
            <Input inputMode="decimal" value={item.value} onChange={(e) => patchOther(item.id, { value: e.target.value })} placeholder="Value" className="w-28" />
            <Input inputMode="decimal" value={item.lifeYears} onChange={(e) => patchOther(item.id, { lifeYears: e.target.value })} placeholder="Life (yrs)" className="w-24" />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeOther(item.id)}>
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addOther}>
          <Plus className="size-4" /> Add item
        </Button>
      </div>
    </div>
  )
}

// ─── Section 5: Sources of Funds ─────────────────────────────────────────────

export function FundsSection({
  inputs,
  onChange,
}: {
  inputs: FinancialInputs
  onChange: (patch: Partial<FinancialInputs>) => void
}) {
  const hasBorrowing = parseFloat(inputs.borrowing) > 0

  function addOther() {
    onChange({ otherFunds: [...inputs.otherFunds, { id: uid(), description: "", value: "" }] })
  }

  function patchOther(id: string, patch: Partial<OtherFundSource>) {
    onChange({ otherFunds: inputs.otherFunds.map((f) => (f.id === id ? { ...f, ...patch } : f)) })
  }

  function removeOther(id: string) {
    onChange({ otherFunds: inputs.otherFunds.filter((f) => f.id !== id) })
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Sources of Funds</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Cash contribution" hint="Your own cash for the startup">
          <NumField value={inputs.cashContribution} onChange={(v) => onChange({ cashContribution: v })} prefix={inputs.currency} />
        </FieldRow>
        <FieldRow label="Borrowing" hint="Cash that will be borrowed">
          <NumField value={inputs.borrowing} onChange={(v) => onChange({ borrowing: v })} prefix={inputs.currency} />
        </FieldRow>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Other sources</Label>
        {inputs.otherFunds.map((f) => (
          <div key={f.id} className="flex gap-2">
            <Input value={f.description} onChange={(e) => patchOther(f.id, { description: e.target.value })} placeholder="Source description" className="flex-1" />
            <Input inputMode="decimal" value={f.value} onChange={(e) => patchOther(f.id, { value: e.target.value })} placeholder="Value" className="w-32" />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeOther(f.id)}>
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addOther}>
          <Plus className="size-4" /> Add source
        </Button>
      </div>

      {hasBorrowing ? (
        <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium">Borrowing details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Interest rate" hint="Annual interest rate on borrowing">
              <NumField value={inputs.interestRate} onChange={(v) => onChange({ interestRate: v })} prefix="%" />
            </FieldRow>
            <FieldRow label="Duration of loan" hint="Years">
              <NumField value={inputs.loanDuration} onChange={(v) => onChange({ loanDuration: v })} placeholder="Years" />
            </FieldRow>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ─── Section 6: Credit Terms ─────────────────────────────────────────────────

export function CreditTermsSection({
  inputs,
  onChange,
}: {
  inputs: FinancialInputs
  onChange: (patch: Partial<FinancialInputs>) => void
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>Credit Terms</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow
          label="Selling on credit?"
          hint="What % of monthly sales is on credit?"
        >
          <NumField
            value={inputs.creditSalesPercent}
            onChange={(v) => onChange({ creditSalesPercent: v })}
            prefix="%"
          />
        </FieldRow>
        <FieldRow
          label="Purchasing stock on credit?"
          hint="What % of monthly purchases is on credit?"
        >
          <NumField
            value={inputs.creditPurchasesPercent}
            onChange={(v) => onChange({ creditPurchasesPercent: v })}
            prefix="%"
          />
        </FieldRow>
      </div>
    </div>
  )
}
