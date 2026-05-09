import axios from "axios"

import api from "@/lib/api"

export type ProjectExportKind = "pdf" | "plan" | "model"

const EXPORT_PATHS: Record<ProjectExportKind, string> = {
  pdf: "export/all",
  plan: "export/plan",
  model: "export/canvas",
}

function slugifyProjectName(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return s || "project"
}

function parseFilenameFromContentDisposition(cd: string | undefined): string | null {
  if (!cd) return null
  const utf8 = /filename\*=UTF-8''([^;\s]+)/i.exec(cd)
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1])
    } catch {
      /* ignore */
    }
  }
  const quoted = /filename\s*=\s*"([^"]+)"/i.exec(cd)
  if (quoted?.[1]) return quoted[1]
  const unquoted = /filename\s*=\s*([^;\s]+)/i.exec(cd)
  return unquoted?.[1]?.replace(/^"|"$/g, "") ?? null
}

function fallbackFilename(kind: ProjectExportKind, projectName: string): string {
  const slug = slugifyProjectName(projectName)
  if (kind === "pdf") return `project-export-${slug}.zip`
  if (kind === "plan") return `business-plan-${slug}.pdf`
  return `canvas-${slug}.pdf`
}

/**
 * Triggers a browser download for the given export (authenticated via shared api client).
 */
export async function downloadProjectExport(
  projectId: number,
  kind: ProjectExportKind,
  projectName: string
): Promise<void> {
  const path = EXPORT_PATHS[kind]
  try {
    const response = await api.get<Blob>(`/projects/${projectId}/${path}`, {
      responseType: "blob",
      headers: { Accept: "*/*" },
    })

    const blob = response.data
    const cd = response.headers["content-disposition"] as string | undefined
    const filename =
      parseFilenameFromContentDisposition(cd) ?? fallbackFilename(kind, projectName)

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
      const text = await err.response.data.text()
      try {
        const body = JSON.parse(text) as { message?: string }
        throw new Error(body.message ?? "Export failed")
      } catch (e) {
        if (e instanceof SyntaxError) {
          throw err
        }
        throw e
      }
    }
    throw err
  }
}

export function isExportForbidden(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false
  const s = err.response?.status

  return s === 403 || s === 401
}
