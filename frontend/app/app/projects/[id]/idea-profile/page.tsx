"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeft, Upload } from "lucide-react"

import api, { isValidationError } from "@/lib/api"
import { resolvePublicStorageUrl } from "@/lib/publicStorageUrl"
import { useNotesRail } from "@/contexts/NotesRailContext"
import { useProjectWorkspaceTitle } from "@/contexts/ProjectWorkspaceTitleContext"
import type { ApiResponse, Project, ProjectIdeaProfileData, StartupStage } from "@/types/api"
import { useAuth } from "@/hooks/useAuth"
import { useProject } from "@/hooks/useProject"

import { cn } from "@/components/utils"
import { IdeaProfileCategoryCombobox } from "@/components/project/IdeaProfileCategoryCombobox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const STAGES: StartupStage[] = ["idea", "validation", "mvp", "early_traction", "scaling"]

const STAGE_MSG_KEYS: Record<StartupStage, string> = {
  idea: "stageIdea",
  validation: "stageValidation",
  mvp: "stageMvp",
  early_traction: "stageEarlyTraction",
  scaling: "stageScaling",
}

function emptyProfile(): ProjectIdeaProfileData {
  return {
    business_category: "",
    business_audience: "",
    stage: "",
    core_idea: "",
    problem: "",
    solution: "",
    customer_market: "",
    team: "",
    traction: "",
    current_challenge: "",
    goal_3m: "",
    files: [],
  }
}

export default function ProjectIdeaProfilePage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const router = useRouter()
  const t = useTranslations("Workspace.ideaProfile")
  const tCommon = useTranslations("Workspace.common")
  const tProject = useTranslations("Workspace.project")
  const { user } = useAuth()
  const { collapsed: notesCollapsed } = useNotesRail()
  const { setIdeaProfileComplete } = useProjectWorkspaceTitle()
  const { project, isLoading, error, refetch } = useProject(projectId)

  const [form, setForm] = React.useState<ProjectIdeaProfileData>(emptyProfile())
  const [saving, setSaving] = React.useState(false)
  const [completing, setCompleting] = React.useState(false)
  const [msg, setMsg] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const isOwner = Boolean(user && project && project.owner.id === user.id)

  React.useEffect(() => {
    if (!project?.idea_profile) {
      setForm(emptyProfile())
      return
    }
    setForm({
      ...emptyProfile(),
      ...project.idea_profile,
      files: project.idea_profile.files ?? [],
    })
  }, [project])

  async function saveDraft() {
    if (!isOwner) return
    setErr(null)
    setMsg(null)
    setSaving(true)
    try {
      await api.put<ApiResponse<Project>>(`/projects/${projectId}/idea-profile`, {
        idea_profile: { ...form, files: form.files ?? [] },
        mark_complete: false,
      })
      await refetch()
      setMsg(t("savedDraft"))
    } catch (e) {
      setErr(isValidationError(e) ? tCommon("genericError") : tCommon("genericError"))
    } finally {
      setSaving(false)
    }
  }

  async function markComplete() {
    if (!isOwner) return
    setErr(null)
    setMsg(null)
    setCompleting(true)
    try {
      await api.put<ApiResponse<Project>>(`/projects/${projectId}/idea-profile`, {
        idea_profile: { ...form, files: form.files ?? [] },
        mark_complete: true,
      })
      await refetch()
      setIdeaProfileComplete(true)
      setMsg(t("markedComplete"))
      router.push(`/app/projects/${id}/progress`)
    } catch (e) {
      if (isValidationError(e)) {
        const errors = e.response?.data?.errors
        const first = errors ? (Object.values(errors).flat()[0] as string) : undefined
        setErr(first ?? t("completeFailed"))
      } else {
        setErr(t("completeFailed"))
      }
    } finally {
      setCompleting(false)
    }
  }

  async function onUpload(f: File | undefined) {
    if (!f || !isOwner) return
    setErr(null)
    const fd = new FormData()
    fd.append("file", f)
    try {
      const res = await api.post<{ data: { url: string; original_name: string } }>(
        `/projects/${projectId}/idea-profile/files`,
        fd,
      )
      const row = res.data.data
      setForm((p) => ({
        ...p,
        files: [...(p.files ?? []), { url: row.url, original_name: row.original_name }],
      }))
      if (fileRef.current) fileRef.current.value = ""
    } catch {
      setErr(t("uploadFailed"))
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">{tProject("loading")}</div>
  }

  if (error || !project) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        {error ?? tProject("notFound")}
      </div>
    )
  }

  const locked = !isOwner

  return (
    <div
      className={cn(
        "mx-auto w-full space-y-5 pb-6 sm:space-y-6 sm:pb-8",
        notesCollapsed ? "max-w-none" : "max-w-3xl"
      )}
    >
      <div>
        <Link
          href="/app/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 shrink-0" /> {tProject("projectsBreadcrumb")}
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t("subtitle")}</p>
        {locked ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{t("readOnlyHint")}</p>
        ) : null}
        {project.idea_profile_completed_at ? (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">{t("alreadyComplete")}</p>
        ) : null}
      </div>

      {msg ? <p className="text-sm text-green-700 dark:text-green-400">{msg}</p> : null}
      {err ? <p className="text-sm text-destructive">{err}</p> : null}

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>{t("sectionBusiness")}</CardTitle>
          <CardDescription>{t("sectionBusinessDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <IdeaProfileCategoryCombobox
              id="business_category"
              label={t("businessCategory")}
              value={form.business_category ?? ""}
              disabled={locked}
              onChange={(next) => setForm((p) => ({ ...p, business_category: next }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_audience">{t("businessAudience")}</Label>
            <select
              id="business_audience"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:h-9 sm:text-sm"
              value={form.business_audience ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, business_audience: e.target.value }))}
            >
              <option value="">{t("businessAudiencePlaceholder")}</option>
              <option value="b2b">{t("businessAudienceB2b")}</option>
              <option value="b2c">{t("businessAudienceB2c")}</option>
              <option value="both">{t("businessAudienceBoth")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stage">{t("stage")}</Label>
            <select
              id="stage"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:h-9 sm:text-sm"
              value={form.stage ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
            >
              <option value="">{t("stagePlaceholder")}</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {t(STAGE_MSG_KEYS[s])}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sectionIdea")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="core_idea">{t("coreIdea")}</Label>
            <textarea
              id="core_idea"
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.core_idea ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, core_idea: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem">{t("problem")}</Label>
            <textarea
              id="problem"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.problem ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, problem: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution">{t("solution")}</Label>
            <textarea
              id="solution"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.solution ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, solution: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sectionMarket")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_market">{t("customerMarket")}</Label>
            <textarea
              id="customer_market"
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.customer_market ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, customer_market: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">{t("team")}</Label>
            <textarea
              id="team"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.team ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traction">{t("traction")}</Label>
            <textarea
              id="traction"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.traction ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, traction: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sectionGoals")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_challenge">{t("currentChallenge")}</Label>
            <textarea
              id="current_challenge"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.current_challenge ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, current_challenge: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal_3m">{t("goal3m")}</Label>
            <textarea
              id="goal_3m"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              value={form.goal_3m ?? ""}
              disabled={locked}
              onChange={(e) => setForm((p) => ({ ...p, goal_3m: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sectionFiles")}</CardTitle>
          <CardDescription>{t("sectionFilesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            onChange={(e) => void onUpload(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" size="sm" disabled={locked} onClick={() => fileRef.current?.click()}>
            <Upload className="me-2 size-3.5" />
            {t("uploadFile")}
          </Button>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {(form.files ?? []).map((f, i) => (
              <li key={`${f.url}-${i}`}>
                <a
                  href={resolvePublicStorageUrl(f.url)}
                  className="text-primary underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {f.original_name}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {!locked ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={saving || completing}
            onClick={() => void saveDraft()}
          >
            {saving ? tCommon("saving") : t("saveDraft")}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={completing || saving || Boolean(project.idea_profile_completed_at)}
            onClick={() => void markComplete()}
          >
            {completing ? tCommon("saving") : t("finishAndContinue")}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
