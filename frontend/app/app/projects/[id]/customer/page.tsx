"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { useProjectSection } from "@/hooks/useProjectSection"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type FormState = {
  target_segments: string
  customer_problem: string
  acquisition_channels: string
  retention_strategy: string
}

const EMPTY: FormState = {
  target_segments: "",
  customer_problem: "",
  acquisition_channels: "",
  retention_strategy: "",
}

const textareaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function CustomerPage() {
  const { id } = useParams<{ id: string }>()
  const { content, isLoading, isSaving, error, save } = useProjectSection(Number(id), "customer")

  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setForm({
        target_segments: content.target_segments ?? "",
        customer_problem: content.customer_problem ?? "",
        acquisition_channels: content.acquisition_channels ?? "",
        retention_strategy: content.retention_strategy ?? "",
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
          <CardTitle>Customer</CardTitle>
          <CardDescription>Clarify who you serve and how you reach them.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="target_segments">Target customer segments</Label>
              <textarea
                id="target_segments"
                className={textareaClass}
                value={form.target_segments}
                onChange={(e) => setForm((p) => ({ ...p, target_segments: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_problem">Problem you solve for them</Label>
              <textarea
                id="customer_problem"
                className={textareaClass}
                value={form.customer_problem}
                onChange={(e) => setForm((p) => ({ ...p, customer_problem: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisition_channels">How you reach them</Label>
              <textarea
                id="acquisition_channels"
                className={textareaClass}
                value={form.acquisition_channels}
                onChange={(e) => setForm((p) => ({ ...p, acquisition_channels: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention_strategy">How you retain them</Label>
              <textarea
                id="retention_strategy"
                className={textareaClass}
                value={form.retention_strategy}
                onChange={(e) => setForm((p) => ({ ...p, retention_strategy: e.target.value }))}
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
