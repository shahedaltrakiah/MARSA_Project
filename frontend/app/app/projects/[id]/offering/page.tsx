"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { useProjectSection } from "@/hooks/useProjectSection"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type FormState = {
  value_proposition: string
  product_description: string
  key_features: string
  differentiation: string
}

const EMPTY: FormState = {
  value_proposition: "",
  product_description: "",
  key_features: "",
  differentiation: "",
}

const textareaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function OfferingPage() {
  const { id } = useParams<{ id: string }>()
  const { content, isLoading, isSaving, error, save } = useProjectSection(Number(id), "offering")

  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setForm({
        value_proposition: content.value_proposition ?? "",
        product_description: content.product_description ?? "",
        key_features: content.key_features ?? "",
        differentiation: content.differentiation ?? "",
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
          <CardTitle>Offering</CardTitle>
          <CardDescription>Define what you&apos;re building and why it matters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="value_proposition">Value proposition</Label>
              <textarea
                id="value_proposition"
                className={textareaClass}
                value={form.value_proposition}
                onChange={(e) => setForm((p) => ({ ...p, value_proposition: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_description">Product / service description</Label>
              <textarea
                id="product_description"
                className={textareaClass}
                value={form.product_description}
                onChange={(e) => setForm((p) => ({ ...p, product_description: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_features">Key features</Label>
              <textarea
                id="key_features"
                className={textareaClass}
                value={form.key_features}
                onChange={(e) => setForm((p) => ({ ...p, key_features: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="differentiation">What makes you unique?</Label>
              <textarea
                id="differentiation"
                className={textareaClass}
                value={form.differentiation}
                onChange={(e) => setForm((p) => ({ ...p, differentiation: e.target.value }))}
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
