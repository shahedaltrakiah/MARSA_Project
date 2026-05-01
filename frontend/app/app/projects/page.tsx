"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"
import { useProjects } from "@/hooks/useProjects"

function formatUpdated(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso))
}

export default function ProjectsPage() {
  const { projects, isLoading, error, refetch } = useProjects()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your startup workspaces, all in one place.
          </p>
        </div>
        <Link
          href="/app/projects/new"
          className={cn(buttonVariants({ variant: "secondary" }), "sm:w-auto")}
        >
          New project
        </Link>
      </div>

      <Separator className="my-6" />

      {isLoading && (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading projects…</div>
      )}

      {error && !isLoading && (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No projects yet.{" "}
          <Link href="/app/projects/new" className="font-medium text-foreground hover:underline">
            Create your first one.
          </Link>
        </div>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="bg-card/80 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{project.name}</CardTitle>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Updated {formatUpdated(project.updated_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {project.collaborators && project.collaborators.length > 0 && (
                    <Badge variant="secondary">
                      {project.collaborators.length} collaborator
                      {project.collaborators.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  <Link
                    href={`/app/projects/${project.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Open <ArrowRight className="ml-2 size-4" />
                  </Link>
                </div>
              </CardHeader>
              {project.description && (
                <CardContent className="text-sm text-muted-foreground">
                  <p className="line-clamp-2">{project.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
