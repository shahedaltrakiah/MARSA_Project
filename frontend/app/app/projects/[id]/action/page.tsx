"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { useProjectSection } from "@/hooks/useProjectSection"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type FormState = {
  current_focus: string
  next_milestone: string
  key_metrics: string
  blockers: string
}

const EMPTY: FormState = {
  current_focus: "",
  next_milestone: "",
  key_metrics: "",
  blockers: "",
}

const textareaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function ActionPage() {
  const { id } = useParams<{ id: string }>()
  const { content, isLoading, isSaving, error, save } = useProjectSection(Number(id), "action")

  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setForm({
        current_focus: content.current_focus ?? "",
        next_milestone: content.next_milestone ?? "",
        key_metrics: content.key_metrics ?? "",
        blockers: content.blockers ?? "",
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
          <CardTitle>Action</CardTitle>
          <CardDescription>Turn strategy into execution and momentum.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current_focus">Current focus / sprint</Label>
              <textarea
                id="current_focus"
                className={textareaClass}
                value={form.current_focus}
                onChange={(e) => setForm((p) => ({ ...p, current_focus: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_milestone">Next major milestone</Label>
              <textarea
                id="next_milestone"
                className={textareaClass}
                value={form.next_milestone}
                onChange={(e) => setForm((p) => ({ ...p, next_milestone: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_metrics">Metrics you&apos;re tracking</Label>
              <textarea
                id="key_metrics"
                className={textareaClass}
                value={form.key_metrics}
                onChange={(e) => setForm((p) => ({ ...p, key_metrics: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockers">Current blockers</Label>
              <textarea
                id="blockers"
                className={textareaClass}
                value={form.blockers}
                onChange={(e) => setForm((p) => ({ ...p, blockers: e.target.value }))}
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
