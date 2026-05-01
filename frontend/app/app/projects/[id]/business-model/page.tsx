"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { useProjectSection } from "@/hooks/useProjectSection"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type FormState = {
  revenue_streams: string
  pricing_model: string
  cost_structure: string
  key_activities: string
}

const EMPTY: FormState = {
  revenue_streams: "",
  pricing_model: "",
  cost_structure: "",
  key_activities: "",
}

const textareaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function BusinessModelPage() {
  const { id } = useParams<{ id: string }>()
  const { content, isLoading, isSaving, error, save } = useProjectSection(Number(id), "business-model")

  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setForm({
        revenue_streams: content.revenue_streams ?? "",
        pricing_model: content.pricing_model ?? "",
        cost_structure: content.cost_structure ?? "",
        key_activities: content.key_activities ?? "",
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
          <CardTitle>Business Model</CardTitle>
          <CardDescription>Map how the business works end-to-end.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="revenue_streams">Revenue streams</Label>
              <textarea
                id="revenue_streams"
                className={textareaClass}
                value={form.revenue_streams}
                onChange={(e) => setForm((p) => ({ ...p, revenue_streams: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing_model">Pricing model</Label>
              <textarea
                id="pricing_model"
                className={textareaClass}
                value={form.pricing_model}
                onChange={(e) => setForm((p) => ({ ...p, pricing_model: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_structure">Cost structure</Label>
              <textarea
                id="cost_structure"
                className={textareaClass}
                value={form.cost_structure}
                onChange={(e) => setForm((p) => ({ ...p, cost_structure: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_activities">Key activities</Label>
              <textarea
                id="key_activities"
                className={textareaClass}
                value={form.key_activities}
                onChange={(e) => setForm((p) => ({ ...p, key_activities: e.target.value }))}
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
