"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { useProjectSection } from "@/hooks/useProjectSection"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type FormState = {
  key_resources: string
  technology: string
  team_strengths: string
  strategic_advantages: string
}

const EMPTY: FormState = {
  key_resources: "",
  technology: "",
  team_strengths: "",
  strategic_advantages: "",
}

const textareaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function AssetsPage() {
  const { id } = useParams<{ id: string }>()
  const { content, isLoading, isSaving, error, save } = useProjectSection(Number(id), "assets")

  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setForm({
        key_resources: content.key_resources ?? "",
        technology: content.technology ?? "",
        team_strengths: content.team_strengths ?? "",
        strategic_advantages: content.strategic_advantages ?? "",
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
          <CardTitle>Assets</CardTitle>
          <CardDescription>List resources, strengths, and advantages you can leverage.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="key_resources">Key resources</Label>
              <textarea
                id="key_resources"
                className={textareaClass}
                value={form.key_resources}
                onChange={(e) => setForm((p) => ({ ...p, key_resources: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technology">Technology and IP</Label>
              <textarea
                id="technology"
                className={textareaClass}
                value={form.technology}
                onChange={(e) => setForm((p) => ({ ...p, technology: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_strengths">Team strengths</Label>
              <textarea
                id="team_strengths"
                className={textareaClass}
                value={form.team_strengths}
                onChange={(e) => setForm((p) => ({ ...p, team_strengths: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategic_advantages">Unfair advantages</Label>
              <textarea
                id="strategic_advantages"
                className={textareaClass}
                value={form.strategic_advantages}
                onChange={(e) => setForm((p) => ({ ...p, strategic_advantages: e.target.value }))}
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
