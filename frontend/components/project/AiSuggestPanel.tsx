"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/components/utils"
import api from "@/lib/api"

export type AiSuggestPanelProps = {
  projectId: number
  section: string
  pillar?: string
}

export default function AiSuggestPanel({ projectId, section, pillar }: AiSuggestPanelProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [suggestion, setSuggestion] = React.useState<string | null>(null)
  const [visible, setVisible] = React.useState(false)

  async function handleClick() {
    setError(null)
    setLoading(true)
    try {
      const body: { section: string; pillar?: string } = { section }
      if (pillar !== undefined && pillar !== "") {
        body.pillar = pillar
      }
      const res = await api.post<{ suggestion: string }>(`/projects/${projectId}/ai-suggest`, body)
      setSuggestion(res.data.suggestion ?? "")
      setVisible(true)
    } catch {
      setError("Could not get suggestions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 space-y-3 border-t border-border pt-6">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => void handleClick()}
        className="gap-2"
      >
        <Sparkles className="size-4 shrink-0 text-secondary" aria-hidden />
        {loading ? "Thinking…" : "Get AI Suggestions"}
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {visible && suggestion !== null ? (
        <div
          className={cn(
            "rounded-lg border border-primary/20 bg-indigo-500/10 px-4 py-3 text-sm dark:bg-indigo-950/40",
            "border-indigo-500/25 dark:border-indigo-400/20"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="flex-1 whitespace-pre-wrap text-foreground/90">{suggestion}</p>
            <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => setVisible(false)}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
