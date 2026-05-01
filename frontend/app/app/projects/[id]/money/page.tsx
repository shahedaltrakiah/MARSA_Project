"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { useProjectSection } from "@/hooks/useProjectSection"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type FormState = {
  monthly_revenue: string
  burn_rate: string
  runway: string
  funding_target: string
  financial_notes: string
}

const EMPTY: FormState = {
  monthly_revenue: "",
  burn_rate: "",
  runway: "",
  funding_target: "",
  financial_notes: "",
}

const textareaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function MoneyPage() {
  const { id } = useParams<{ id: string }>()
  const { content, isLoading, isSaving, error, save } = useProjectSection(Number(id), "money")

  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setForm({
        monthly_revenue: content.monthly_revenue ?? "",
        burn_rate: content.burn_rate ?? "",
        runway: content.runway ?? "",
        funding_target: content.funding_target ?? "",
        financial_notes: content.financial_notes ?? "",
      })
    }
  }, [isLoading, content])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaveError(null)
    try {
      await save(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaveError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Money</CardTitle>
          <CardDescription>Track the key numbers and financial assumptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthly_revenue">Monthly revenue (current)</Label>
                <Input
                  id="monthly_revenue"
                  value={form.monthly_revenue}
                  onChange={(e) => setForm((p) => ({ ...p, monthly_revenue: e.target.value }))}
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burn_rate">Monthly burn rate</Label>
                <Input
                  id="burn_rate"
                  value={form.burn_rate}
                  onChange={(e) => setForm((p) => ({ ...p, burn_rate: e.target.value }))}
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runway">Runway (months)</Label>
                <Input
                  id="runway"
                  value={form.runway}
                  onChange={(e) => setForm((p) => ({ ...p, runway: e.target.value }))}
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funding_target">Funding target (if raising)</Label>
                <Input
                  id="funding_target"
                  value={form.funding_target}
                  onChange={(e) => setForm((p) => ({ ...p, funding_target: e.target.value }))}
                  disabled={isLoading || isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financial_notes">Additional notes</Label>
              <textarea
                id="financial_notes"
                className={textareaClass}
                value={form.financial_notes}
                onChange={(e) => setForm((p) => ({ ...p, financial_notes: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <Separator />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
            {saved ? <p className="text-sm text-green-600">Saved successfully.</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
