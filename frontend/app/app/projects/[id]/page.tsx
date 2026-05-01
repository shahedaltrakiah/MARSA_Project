"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Copy, Trash2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"
import CollaboratorsPanel from "@/components/project/CollaboratorsPanel"
import { useProject } from "@/hooks/useProject"

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
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
      setSaveError("Could not save changes.")
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
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading project…</div>
  }

  if (error || !project) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-destructive">{error ?? "Project not found."}</p>
        <Link href="/app/projects" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}>
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/app/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Projects
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Offering", "Business Model", "Customer", "Money", "Assets", "Action"].map((s) => (
          <Link
            key={s}
            href={`/app/projects/${id}/${s.toLowerCase().replace(" ", "-")}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Project details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proj-name">Name</Label>
                <Input
                  id="proj-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-desc">Description</Label>
                <textarea
                  id="proj-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  disabled={isSaving}
                  className="min-h-20 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm">
              {project.description ? (
                <p className="text-muted-foreground">{project.description}</p>
              ) : (
                <p className="italic text-muted-foreground">No description yet.</p>
              )}
              <div className="text-xs text-muted-foreground">
                Owner: {project.owner.name}
                {project.last_modified_by && ` · Last modified by ${project.last_modified_by.name}`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          <CollaboratorsPanel
            collaborators={project.collaborators ?? []}
            owner={project.owner}
            onInvite={inviteCollaborator}
            onRemove={removeCollaborator}
          />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Clone project</div>
              <div className="text-xs text-muted-foreground">
                Creates a copy with no collaborators.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isCloning}
              onClick={() => void handleClone()}
            >
              <Copy className="mr-2 size-3.5" />
              {isCloning ? "Cloning…" : "Clone"}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Delete project</div>
              <div className="text-xs text-muted-foreground">
                This action cannot be undone.
              </div>
            </div>
            {confirmDelete ? (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => void handleDelete()}
                >
                  {isDeleting ? "Deleting…" : "Confirm delete"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
