"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ImageIcon, Upload } from "lucide-react"

import api, { isValidationError } from "@/lib/api"
import type { ApiResponse, Project } from "@/types/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"

const LOGO_MAX_BYTES = 2 * 1024 * 1024

type FormState = {
  name: string
  description: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const t = useTranslations("Workspace.newProject")
  const tCommon = useTranslations("Workspace.common")
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const [form, setForm] = React.useState<FormState>({ name: "", description: "" })
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null)
      return
    }
    const url = URL.createObjectURL(logoFile)
    setLogoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [logoFile])

  function onPickLogo(file: File | undefined) {
    if (!file) return
    if (file.size > LOGO_MAX_BYTES) {
      setError(t("logoTooLarge"))
      return
    }
    if (!file.type.startsWith("image/")) {
      setError(t("logoInvalidType"))
      return
    }
    setError(null)
    setLogoFile(file)
  }

  function clearLogo() {
    setLogoFile(null)
    setError(null)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name.trim())
      if (form.description.trim()) {
        formData.append("description", form.description.trim())
      }
      if (logoFile) {
        formData.append("logo", logoFile)
      }
      const res = await api.post<ApiResponse<Project>>("/projects", formData)
      const created = res.data.data
      router.push(`/app/projects/${created.id}/idea-profile`)
    } catch (e) {
      if (isValidationError(e)) {
        const first = e.response?.data?.errors
          ? (Object.values(e.response.data.errors).flat()[0] as string | undefined)
          : undefined
        setError(first ?? tCommon("genericError"))
      } else {
        setError(tCommon("genericError"))
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-3">
        <Link href="/app/projects" className="text-sm text-muted-foreground hover:text-foreground">
          {t("back")}
        </Link>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-sm ring-1 ring-border/40">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Logo + name on one row (stacks on very narrow screens) */}
            <div className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <div className="flex min-w-0 flex-1 items-end gap-3">
                  <div
                    className={cn(
                      "relative size-14 shrink-0 overflow-hidden rounded-2xl border bg-muted/40 sm:size-16",
                      logoPreview ? "border-border" : "border-dashed border-border/80"
                    )}
                  >
                    {logoPreview ? (
                      <Image src={logoPreview} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <ImageIcon className="size-7 text-foreground/50 dark:text-white/50" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Label htmlFor="name">{t("nameLabel")}</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder={t("namePlaceholder")}
                      required
                    />
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-0.5">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    aria-describedby="logo-hint"
                    onChange={(e) => {
                      onPickLogo(e.target.files?.[0])
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="size-3.5 text-foreground dark:text-white" />
                    {logoFile ? t("logoChange") : t("logoChoose")}
                  </Button>
                  {logoFile ? (
                    <Button type="button" variant="ghost" size="sm" onClick={clearLogo}>
                      {t("logoRemove")}
                    </Button>
                  ) : null}
                </div>
              </div>
              <p id="logo-hint" className="text-xs text-muted-foreground">
                {t("logoHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{tCommon("description")}</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={t("descriptionPlaceholder")}
                className="min-h-24 w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <Separator />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? tCommon("saving") : t("create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
