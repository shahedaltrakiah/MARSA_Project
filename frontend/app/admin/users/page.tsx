"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import api from "@/lib/api"
import type { AdminUser } from "@/types/admin"

export default function AdminUsersPage() {
  const { t } = useAdminI18n()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  async function fetchUsers(page = 1) {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users?scope=users&page=${page}`)
      setUsers(res.data.data)
      setMeta(res.data.meta)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers(1)
  }, [])

  const roleBadgeClass = (role: string) => {
    if (role === 'super_admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    if (role === 'admin') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{t.navMemberDirectory}</h1>
      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-left px-4 py-3 font-medium">Projects</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(u.role)}`}>
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
          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <button
                disabled={meta.current_page === 1}
                onClick={() => fetchUsers(meta.current_page - 1)}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => fetchUsers(meta.current_page + 1)}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
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
