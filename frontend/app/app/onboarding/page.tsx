"use client"

import * as React from "react"

import api from "@/lib/api"
import type { ApiResponse, StartupProfile, StartupStage } from "@/types/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type ProfileForm = {
  idea: string
  problem: string
  solution: string
  customer: string
  traction: string
  challenges: string
  goals: string
  team: string
  stage: StartupStage | ""
}

const stages: { value: StartupStage; label: string }[] = [
  { value: "idea", label: "idea" },
  { value: "validation", label: "validation" },
  { value: "mvp", label: "mvp" },
  { value: "early_traction", label: "early_traction" },
  { value: "scaling", label: "scaling" },
]

function toForm(profile: StartupProfile): ProfileForm {
  return {
    idea: profile.idea ?? "",
    problem: profile.problem ?? "",
    solution: profile.solution ?? "",
    customer: profile.customer ?? "",
    traction: profile.traction ?? "",
    challenges: profile.challenges ?? "",
    goals: profile.goals ?? "",
    team: profile.team ?? "",
    stage: profile.stage ?? "",
  }
}

export default function OnboardingPage() {
  const [form, setForm] = React.useState<ProfileForm>({
    idea: "",
    problem: "",
    solution: "",
    customer: "",
    traction: "",
    challenges: "",
    goals: "",
    team: "",
    stage: "",
  })

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setError(null)
      try {
        const res = await api.get<ApiResponse<StartupProfile>>("/profile")
        if (!mounted) return
        setForm(toForm(res.data.data))
      } catch {
        if (!mounted) return
        setError("Something went wrong.")
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!success) return
    const id = window.setTimeout(() => setSuccess(false), 3000)
    return () => window.clearTimeout(id)
  }, [success])

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      const res = await api.put<ApiResponse<StartupProfile>>("/profile", {
        idea: form.idea || null,
        problem: form.problem || null,
        solution: form.solution || null,
        customer: form.customer || null,
        traction: form.traction || null,
        challenges: form.challenges || null,
        goals: form.goals || null,
        team: form.team || null,
        stage: form.stage || null,
      })
      setForm(toForm(res.data.data))
      setSuccess(true)
    } catch {
      setError("Something went wrong.")
    } finally {
      setIsSaving(false)
    }
  }

  const textareaClass =
    "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Startup profile</CardTitle>
          <CardDescription>Tell MARSA about your startup. You can change this anytime.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="idea">What&apos;s your idea?</Label>
                <textarea
                  id="idea"
                  className={textareaClass}
                  value={form.idea}
                  onChange={(e) => setForm((p) => ({ ...p, idea: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="problem">What problem does it solve?</Label>
                <textarea
                  id="problem"
                  className={textareaClass}
                  value={form.problem}
                  onChange={(e) => setForm((p) => ({ ...p, problem: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="solution">How do you solve it?</Label>
                <textarea
                  id="solution"
                  className={textareaClass}
                  value={form.solution}
                  onChange={(e) => setForm((p) => ({ ...p, solution: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customer">Who is your target customer?</Label>
                <textarea
                  id="customer"
                  className={textareaClass}
                  value={form.customer}
                  onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="traction">Current traction</Label>
                <textarea
                  id="traction"
                  className={textareaClass}
                  value={form.traction}
                  onChange={(e) => setForm((p) => ({ ...p, traction: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="challenges">Biggest challenges</Label>
                <textarea
                  id="challenges"
                  className={textareaClass}
                  value={form.challenges}
                  onChange={(e) => setForm((p) => ({ ...p, challenges: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="goals">90-day goals</Label>
                <textarea
                  id="goals"
                  className={textareaClass}
                  value={form.goals}
                  onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  value={form.team}
                  onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))}
                  placeholder="Co-founder, 2 engineers, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <select
                  id="stage"
                  value={form.stage}
                  onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value as StartupStage | "" }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select stage</option>
                  {stages.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Separator />

            {success ? <p className="text-sm text-foreground">Profile saved.</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

