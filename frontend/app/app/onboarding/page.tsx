"use client"

import * as React from "react"

import api from "@/lib/api"
import type { ApiResponse, ProfileFile, StartupProfile, StartupStage } from "@/types/api"

import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react"

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

  const [files, setFiles] = React.useState<ProfileFile[]>([])
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [deletingIds, setDeletingIds] = React.useState<Set<number>>(() => new Set())

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setError(null)
      try {
        const res = await api.get<ApiResponse<StartupProfile>>("/profile")
        if (!mounted) return
        const profile = res.data.data
        setForm(toForm(profile))
        setFiles(profile.files ?? [])
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
        stage: form.stage || null,
        team: form.team || null,
        traction: form.traction || null,
        challenges: form.challenges || null,
        goals: form.goals || null,
      })
      setForm(toForm(res.data.data))
      setFiles(res.data.data.files ?? [])
      setSuccess(true)
    } catch {
      setError("Something went wrong.")
    } finally {
      setIsSaving(false)
    }
  }

  async function onUpload(file: File) {
    setUploadError(null)
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await api.post<ApiResponse<ProfileFile>>("/profile/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const created = res.data.data
      setFiles((prev) => [created, ...prev])
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  async function onDeleteFile(file: ProfileFile) {
    setUploadError(null)
    setDeletingIds((prev) => new Set(prev).add(file.id))
    setFiles((prev) => prev.filter((f) => f.id !== file.id))
    try {
      await api.delete(`/profile/files/${file.id}`)
    } catch {
      setUploadError("Delete failed. Please try again.")
      setFiles((prev) => [file, ...prev])
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(file.id)
        return next
      })
    }
  }

  function formatKb(bytes: number) {
    const kb = Math.max(1, Math.round(bytes / 1024))
    return `${kb} KB`
  }

  const textareaClass =
    "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded-md bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Startup profile</CardTitle>
          <CardDescription>Tell MARSA about your startup. You can change this anytime.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* toast-style success message */}
          {success ? (
            <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
              <div className="rounded-full border bg-background/90 px-4 py-2 text-sm shadow-sm backdrop-blur">
                Profile saved.
              </div>
            </div>
          ) : null}

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

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {/* Documents */}
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">Documents</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Upload files like pitch decks, contracts, or research docs.
                </div>
              </div>

              <div className="space-y-2">
                {files.length === 0 ? (
                  <div className="rounded-xl border bg-card/40 p-4 text-sm text-muted-foreground">
                    No documents uploaded yet.
                  </div>
                ) : (
                  <div className="rounded-xl border bg-card/40">
                    <ul className="divide-y">
                      {files.map((f) => {
                        const isDeleting = deletingIds.has(f.id)
                        return (
                          <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="inline-flex size-9 items-center justify-center rounded-lg border bg-background/70">
                                <FileText className="size-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{f.original_name}</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">{formatKb(f.size)}</div>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={isDeleting}
                              onClick={() => void onDeleteFile(f)}
                              aria-label={`Delete ${f.original_name}`}
                            >
                              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            </Button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Upload</Label>
                <label className="group relative flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed bg-card/40 px-4 py-4 transition hover:bg-card/60">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-xl border bg-background/70">
                      <UploadCloud className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Choose a file</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {isUploading ? "Uploading…" : "Any file type supported."}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">Browse</div>

                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      void onUpload(file)
                      e.currentTarget.value = ""
                    }}
                  />
                </label>

                {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
              </div>
            </div>

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

