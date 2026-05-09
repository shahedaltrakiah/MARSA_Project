"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Copy, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"
import CollaboratorsPanel from "@/components/project/CollaboratorsPanel"
import { ProjectLogoControl } from "@/components/project/ProjectLogoControl"
import { useProject } from "@/hooks/useProject"

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const t = useTranslations("Workspace.project")
  const tCommon = useTranslations("Workspace.common")
  const { project, isLoading, error, update, remove, clone, inviteCollaborator, removeCollaborator } =
    useProject(projectId)

  const [isEditing, setIsEditing] = React.useState(false)
  const [editName, setEditName] = React.useState("")
  const [editDesc, setEditDesc] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isCloning, setIsCloning] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  function startEdit() {
    if (!project) return
    setEditName(project.name)
    setEditDesc(project.description ?? "")
    setSaveError(null)
    setIsEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setIsSaving(true)
    try {
      await update({ name: editName, description: editDesc || null })
      setIsEditing(false)
    } catch {
      setSaveError(t("saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await remove()
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleClone() {
    setIsCloning(true)
    try {
      await clone()
    } finally {
      setIsCloning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">{t("loading")}</div>
    )
  }

  if (error || !project) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-destructive">{error ?? t("notFound")}</p>
        <Link href="/app/projects" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}>
          {t("backToProjects")}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      <div>
        <Link
          href="/app/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 text-foreground dark:text-white" /> {t("projectsBreadcrumb")}
        </Link>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-sm ring-1 ring-border/30">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/15 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4">
            <ProjectLogoControl
              projectId={projectId}
              initialLogo={project.logo}
              projectName={project.name}
            />
            <CardTitle className="min-w-0 flex-1 truncate text-lg font-semibold">
              {isEditing ? editName || project.name : project.name}
            </CardTitle>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              {tCommon("edit")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-5 py-4 sm:px-6 sm:py-5">
          {isEditing ? (
            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="proj-name">{tCommon("name")}</Label>
                  <Input
                    id="proj-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-desc">{tCommon("description")}</Label>
                <textarea
                  id="proj-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  disabled={isSaving}
                  className="min-h-24 w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isSaving}>
                  {isSaving ? tCommon("saving") : tCommon("save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm">
              {project.description ? (
                <p className="leading-relaxed text-muted-foreground">{project.description}</p>
              ) : (
                <p className="italic text-muted-foreground">{t("noDescription")}</p>
              )}
              <div className="text-xs text-muted-foreground">
                {t("owner")}: {project.owner.name}
                {project.last_modified_by
                  ? ` · ${t("lastModifiedBy", { name: project.last_modified_by.name })}`
                  : ""}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-sm ring-1 ring-border/30">
        <CardHeader className="border-b border-border/40 bg-muted/10 px-5 py-4 sm:px-6">
          <CardTitle className="text-base font-semibold">{t("collaborators")}</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4 sm:px-6 sm:py-5">
          <CollaboratorsPanel
            collaborators={project.collaborators ?? []}
            owner={project.owner}
            onInvite={inviteCollaborator}
            onRemove={removeCollaborator}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border border-destructive/35 bg-destructive/[0.03] shadow-sm ring-1 ring-destructive/20">
        <CardHeader className="border-b border-destructive/20 bg-destructive/5 px-5 py-4 sm:px-6">
          <CardTitle className="text-base font-semibold text-destructive">{t("dangerZone")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{t("cloneTitle")}</div>
              <div className="text-xs text-muted-foreground">{t("cloneDesc")}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-border/80"
              disabled={isCloning}
              onClick={() => void handleClone()}
            >
              <Copy className="me-2 size-3.5 text-foreground dark:text-white" />
              {isCloning ? t("cloning") : t("clone")}
            </Button>
          </div>

          <Separator className="bg-destructive/15" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">{t("deleteTitle")}</div>
              <div className="text-xs text-muted-foreground">{t("deleteDesc")}</div>
            </div>
            {confirmDelete ? (
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => void handleDelete()}
                >
                  {isDeleting ? t("deleting") : t("confirmDelete")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                  {tCommon("cancel")}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="me-2 size-3.5 text-foreground dark:text-white" />
                {tCommon("delete")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
