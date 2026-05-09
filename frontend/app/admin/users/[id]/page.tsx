"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import api from "@/lib/api"
import { useAuthContext } from "@/contexts/AuthContext"
import type { AdminMsg } from "@/components/admin/admin-messages"
import type { User, AdminSiteSection } from "@/types/api"
import type { AdminRole, AdminUserDetail } from "@/types/admin"

const SITE_PERM_OPTIONS: { key: AdminSiteSection; label: (m: AdminMsg) => string }[] = [
  { key: "branding", label: (m) => m.permBranding },
  { key: "hero", label: (m) => m.permHero },
  { key: "features", label: (m) => m.permFeatures },
  { key: "pricing", label: (m) => m.permPricing },
]

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useAdminI18n()
  const { user: currentUser, updateUser } = useAuthContext()
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<AdminRole>("user")
  const [permSelection, setPermSelection] = useState<AdminSiteSection[]>([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then((res) => {
        const d = res.data.data as AdminUserDetail
        setDetail(d)
        setSelectedRole(d.role)
        setPermSelection((d.admin_site_permissions as AdminSiteSection[] | null) ?? [])
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSaveRole() {
    if (!detail) return
    setSaving(true)
    setSaveMsg("")
    try {
      const body: { role: AdminRole; admin_site_permissions?: AdminSiteSection[] } = {
        role: selectedRole,
      }
      if (selectedRole === "admin") {
        body.admin_site_permissions = permSelection
      }

      const res = await api.patch<{ data: User }>(`/admin/users/${detail.id}/role`, body)
      const u = res.data.data
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              role: u.role as AdminRole,
              admin_site_permissions:
                u.role === "admin" ? (u.admin_site_permissions as string[] | null) ?? [] : null,
            }
          : prev
      )
      setSelectedRole(u.role as AdminRole)
      if (u.role === "admin") {
        setPermSelection((u.admin_site_permissions as AdminSiteSection[] | undefined) ?? [])
      } else {
        setPermSelection([])
      }

      if (currentUser?.id === detail.id) {
        updateUser(u)
      }

      setSaveMsg("Saved.")
    } catch {
      setSaveMsg("Failed to update.")
    } finally {
      setSaving(false)
    }
  }

  function togglePerm(key: AdminSiteSection) {
    setPermSelection((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  if (loading) return <div className="text-muted-foreground">Loading…</div>
  if (!detail) return <div className="text-muted-foreground">User not found.</div>

  const listHref = detail.role === "user" ? "/admin/users" : "/admin/admins"
  const listLabel = detail.role === "user" ? t.navMemberDirectory : t.navStaff

  return (
    <div className="max-w-2xl space-y-8">
      <Link href={listHref} className="text-sm text-muted-foreground hover:text-foreground">
        ← {listLabel}
      </Link>

      <div className="space-y-2 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">{detail.name}</h1>
        <p className="text-muted-foreground">{detail.email}</p>
        <p className="text-sm text-muted-foreground">
          Joined {new Date(detail.created_at).toLocaleDateString()}
        </p>

        {currentUser?.role === "super_admin" && (
          <div className="space-y-4 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                className="rounded border bg-background px-2 py-1 text-sm"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
              <button
                type="button"
                onClick={() => void handleSaveRole()}
                disabled={saving}
                className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save role"}
              </button>
              {saveMsg ? <span className="text-sm text-muted-foreground">{saveMsg}</span> : null}
            </div>

            {selectedRole === "admin" && (
              <div className="rounded-md border bg-muted/30 p-4">
                <p className="mb-3 text-sm text-muted-foreground">{t.siteAccessHint}</p>
                <ul className="space-y-2">
                  {SITE_PERM_OPTIONS.map(({ key, label }) => (
                    <li key={key}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={permSelection.includes(key)}
                          onChange={() => togglePerm(key)}
                          className="rounded border-input"
                        />
                        {label(t)}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {detail.startup_profile && (
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">Startup Profile</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(detail.startup_profile)
              .filter(([, v]) => v !== null && v !== "")
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 font-semibold">Projects ({detail.projects.length})</h2>
        {detail.projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {detail.projects.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
