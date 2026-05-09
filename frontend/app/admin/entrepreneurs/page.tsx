"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import api from "@/lib/api"
import type { AdminEntrepreneurRow } from "@/types/admin"

export default function AdminEntrepreneursPage() {
  const { t } = useAdminI18n()
  const router = useRouter()
  const [rows, setRows] = useState<AdminEntrepreneurRow[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)

  async function fetchPage(page = 1) {
    setLoading(true)
    try {
      const res = await api.get(`/admin/entrepreneurs?page=${page}`)
      setRows(res.data.data)
      setMeta(res.data.meta)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPage(1)
  }, [])

  function excerpt(text: unknown): string {
    if (typeof text !== "string" || !text.trim()) return "—"
    const s = text.trim()
    return s.length > 120 ? `${s.slice(0, 117)}…` : s
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">{t.navEntrepreneurs}</h1>
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {t.entrepreneursIntro}
      </p>

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t.registeredLabel}</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">{t.completionLabel}</th>
                  <th className="px-4 py-3 text-left font-medium">Idea (preview)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t transition-colors hover:bg-muted/30"
                    onClick={() => router.push(`/admin/users/${row.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(row.registered_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                    <td className="px-4 py-3 tabular-nums">{row.profile_completion_pct}%</td>
                    <td className="max-w-md px-4 py-3 text-muted-foreground">
                      {excerpt(row.startup_profile?.idea)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            <Link href="/admin/dashboard" className="text-primary hover:underline">
              ← {t.navDashboard}
            </Link>
          </p>

          {meta.last_page > 1 && (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                disabled={meta.current_page === 1}
                onClick={() => fetchPage(meta.current_page - 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </span>
              <button
                type="button"
                disabled={meta.current_page === meta.last_page}
                onClick={() => fetchPage(meta.current_page + 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
