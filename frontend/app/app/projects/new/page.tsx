"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import api from "@/lib/api"
import type { ApiResponse, Project } from "@/types/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type FormState = {
  name: string
  description: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [form, setForm] = React.useState<FormState>({ name: "", description: "" })
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      await api.post<ApiResponse<Project>>("/projects", {
        name: form.name,
        description: form.description ? form.description : null,
      })
      router.push("/app/projects")
    } catch {
      setError("Something went wrong.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <Link href="/app/projects" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Projects
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Set up a new startup workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
                className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <Separator />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Create project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

