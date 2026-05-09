"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import { useAuthContext } from "@/contexts/AuthContext"
import api from "@/lib/api"
import type { AdminUser, CreateUserPayload } from "@/types/admin"
import type { AdminSiteSection } from "@/types/api"

const SITE_SECTIONS: AdminSiteSection[] = ["branding", "hero", "features", "pricing"]

function CreateStaffModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (user: AdminUser) => void
}) {
  const { t } = useAdminI18n()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "super_admin">("admin")
  const [perms, setPerms] = useState<AdminSiteSection[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function togglePerm(s: AdminSiteSection) {
    setPerms((prev) => (prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload: CreateUserPayload = { name, email, password, role }
      if (role === "admin") payload.admin_site_permissions = perms
      const res = await api.post<{ data: AdminUser }>("/admin/users", payload)
      onCreated(res.data.data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const msg = axiosErr?.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors).flat().join(" ")
        : "Failed to create account."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold">{t.createStaffTitle}</h2>
        <p className="mb-5 text-sm text-muted-foreground">{t.createStaffHint}</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldEmail}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldPassword}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldRole}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "super_admin")}
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            >
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </div>

          {role === "admin" && (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="mb-2 text-xs text-muted-foreground">{t.siteAccessHint}</p>
              <div className="space-y-1.5">
                {SITE_SECTIONS.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={perms.includes(s)}
                      onChange={() => togglePerm(s)}
                      disabled={saving}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Creating…" : t.createStaffSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminStaffPage() {
  const { t } = useAdminI18n()
  const { user: currentUser } = useAuthContext()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const router = useRouter()

  async function fetchAdmins(page = 1) {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users?scope=admins&page=${page}`)
      setUsers(res.data.data)
      setMeta(res.data.meta)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAdmins(1)
  }, [])

  function handleCreated(user: AdminUser) {
    setShowCreate(false)
    setSuccessMsg(t.createStaffSuccess)
    setUsers((prev) => [user, ...prev])
    setTimeout(() => setSuccessMsg(""), 4000)
  }

  const roleBadgeClass = (role: string) => {
    if (role === "super_admin")
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    if (role === "admin") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  const isSuperAdmin = currentUser?.role === "super_admin"

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t.navStaff}</h1>
          {successMsg ? (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">{successMsg}</p>
          ) : null}
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t.createStaffBtn}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-left font-medium">Projects</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="cursor-pointer border-t transition-colors hover:bg-muted/30"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{u.project_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.last_page > 1 && (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                disabled={meta.current_page === 1}
                onClick={() => void fetchAdmins(meta.current_page - 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                type="button"
                disabled={meta.current_page === meta.last_page}
                onClick={() => void fetchAdmins(meta.current_page + 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateStaffModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
