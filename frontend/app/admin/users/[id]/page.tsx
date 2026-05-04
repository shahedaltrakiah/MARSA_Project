'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthContext } from '@/contexts/AuthContext'
import type { AdminUserDetail, AdminRole } from '@/types/admin'

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuthContext()
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<AdminRole>('user')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then((res) => {
        setDetail(res.data.data)
        setSelectedRole(res.data.data.role)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSaveRole() {
    if (!detail) return
    setSaving(true)
    setSaveMsg('')
    try {
      await api.patch(`/admin/users/${detail.id}/role`, { role: selectedRole })
      setDetail((d) => d ? { ...d, role: selectedRole } : d)
      setSaveMsg('Role updated.')
    } catch {
      setSaveMsg('Failed to update role.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading…</div>
  if (!detail) return <div className="text-muted-foreground">User not found.</div>

  return (
    <div className="max-w-2xl space-y-8">
      <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to users
      </Link>

      {/* User card */}
      <div className="rounded-lg border p-6 space-y-2">
        <h1 className="text-xl font-semibold">{detail.name}</h1>
        <p className="text-muted-foreground">{detail.email}</p>
        <p className="text-sm text-muted-foreground">
          Joined {new Date(detail.created_at).toLocaleDateString()}
        </p>

        {/* Role selector — super_admin only */}
        {currentUser?.role === 'super_admin' && (
          <div className="flex items-center gap-3 pt-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <button
              onClick={handleSaveRole}
              disabled={saving}
              className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save role'}
            </button>
            {saveMsg && <span className="text-sm text-muted-foreground">{saveMsg}</span>}
          </div>
        )}
      </div>

      {/* Startup profile */}
      {detail.startup_profile && (
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Startup Profile</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(detail.startup_profile)
              .filter(([, v]) => v !== null && v !== '')
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {/* Projects */}
      <div className="rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Projects ({detail.projects.length})</h2>
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
