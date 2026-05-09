"use client"

import * as React from "react"
import { Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/components/utils"
import api from "@/lib/api"
import { resolvePublicStorageUrl } from "@/lib/publicStorageUrl"
import type { Project } from "@/types/api"

/** Public helper for displaying project logos elsewhere (e.g. project list cards). */
export function resolveProjectLogoUrl(url: string): string {
  return resolvePublicStorageUrl(url)
}

export type ProjectLogoControlProps = {
  projectId: number
  initialLogo: string | null
  projectName: string
  className?: string
}

export function ProjectLogoControl({
  projectId,
  initialLogo,
  projectName,
  className,
}: ProjectLogoControlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = React.useState<string | null>(initialLogo)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLogoUrl(initialLogo)
  }, [initialLogo])

  async function onFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("logo", file)
      // PHP populates uploaded files only for POST (not true PUT). Use method override.
      formData.append("_method", "PUT")
      const res = await api.post<{ data: Project }>(`/projects/${projectId}`, formData)
      setLogoUrl(res.data.data.logo)
    } catch {
      setError("Could not upload logo.")
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  const resolved = logoUrl ? resolveProjectLogoUrl(logoUrl) : null

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
        {resolved ? (
          // User-uploaded API/storage URLs — avoid coupling next/image to every API host
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolved} alt="" className="size-10 object-cover" />
        ) : (
          <div className="flex size-10 items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
            {projectName.trim().slice(0, 2).toUpperCase() || "?"}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        disabled={uploading}
        aria-label="Upload project logo"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="size-4 text-foreground dark:text-white" />
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}
