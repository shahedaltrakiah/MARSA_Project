"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

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
  { value: "idea", label: "Idea" },
  { value: "validation", label: "Validation" },
  { value: "mvp", label: "MVP" },
  { value: "early_traction", label: "Early Traction" },
  { value: "scaling", label: "Scaling" },
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
  const t = useTranslations("Workspace.onboarding")
  const tCommon = useTranslations("Workspace.common")

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
        setError(tCommon("genericError"))
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [tCommon])

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
      setError(tCommon("genericError"))
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
      const res = await api.post<ApiResponse<ProfileFile>>("/profile/files", formData)
      const created = res.data.data
      setFiles((prev) => [created, ...prev])
    } catch {
      setUploadError(t("uploadFailed"))
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
      setUploadError(t("deleteFailed"))
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
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* toast-style success message */}
          {success ? (
            <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
              <div className="rounded-full border bg-background/90 px-4 py-2 text-sm shadow-sm backdrop-blur">
                {t("savedToast")}
              </div>
            </div>
          ) : null}

          <form onSubmit={onSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="idea">{t("idea")}</Label>
                <textarea
                  id="idea"
                  className={textareaClass}
                  value={form.idea}
                  onChange={(e) => setForm((p) => ({ ...p, idea: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="problem">{t("problem")}</Label>
                <textarea
                  id="problem"
                  className={textareaClass}
                  value={form.problem}
                  onChange={(e) => setForm((p) => ({ ...p, problem: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="solution">{t("solution")}</Label>
                <textarea
                  id="solution"
                  className={textareaClass}
                  value={form.solution}
                  onChange={(e) => setForm((p) => ({ ...p, solution: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customer">{t("customer")}</Label>
                <textarea
                  id="customer"
                  className={textareaClass}
                  value={form.customer}
                  onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="traction">{t("traction")}</Label>
                <textarea
                  id="traction"
                  className={textareaClass}
                  value={form.traction}
                  onChange={(e) => setForm((p) => ({ ...p, traction: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="challenges">{t("challenges")}</Label>
                <textarea
                  id="challenges"
                  className={textareaClass}
                  value={form.challenges}
                  onChange={(e) => setForm((p) => ({ ...p, challenges: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="goals">{t("goals")}</Label>
                <textarea
                  id="goals"
                  className={textareaClass}
                  value={form.goals}
                  onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">{t("team")}</Label>
                <Input
                  id="team"
                  value={form.team}
                  onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))}
                  placeholder={t("teamPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">{t("stage")}</Label>
                <select
                  id="stage"
                  value={form.stage}
                  onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value as StartupStage | "" }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">{t("selectStage")}</option>
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
                <div className="text-sm font-medium">{t("documents")}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t("documentsHint")}</div>
              </div>

              <div className="space-y-2">
                {files.length === 0 ? (
                  <div className="rounded-xl border bg-card/40 p-4 text-sm text-muted-foreground">
                    {t("emptyFiles")}
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
                <Label className="text-sm">{t("uploadLabel")}</Label>
                <label className="group relative flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed bg-card/40 px-4 py-4 transition hover:bg-card/60">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-xl border bg-background/70">
                      <UploadCloud className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{t("chooseFile")}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {isUploading ? t("uploading") : t("uploadHint")}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">{t("browse")}</div>

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
                {isSaving ? tCommon("saving") : t("saveProfile")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

