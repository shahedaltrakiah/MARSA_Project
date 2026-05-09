'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { CollaboratorRole, Project } from '@/types/api'

interface UseProjectResult {
  project: Project | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  update: (data: { name: string; description: string | null }) => Promise<void>
  remove: () => Promise<void>
  clone: () => Promise<void>
  inviteCollaborator: (email: string, role: CollaboratorRole) => Promise<void>
  removeCollaborator: (userId: number) => Promise<void>
}

export function useProject(id: number): UseProjectResult {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    if (!Number.isFinite(id) || id < 1) {
      setProject(null)
      setError('Failed to load project.')
      setIsLoading(false)
      return
    }
    try {
      const res = await api.get<{ data: Project }>(`/projects/${id}`)
      setProject(res.data.data)
    } catch {
      setError('Failed to load project.')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const refetch = useCallback(async () => {
    setError(null)
    if (!Number.isFinite(id) || id < 1) {
      setProject(null)
      setError('Failed to load project.')
      return
    }
    try {
      const res = await api.get<{ data: Project }>(`/projects/${id}`)
      setProject(res.data.data)
    } catch {
      setError('Failed to load project.')
    }
  }, [id])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const update = useCallback(
    async (data: { name: string; description: string | null }) => {
      const res = await api.put<{ data: Project }>(`/projects/${id}`, data)
      setProject(res.data.data)
    },
    [id]
  )

  const remove = useCallback(async () => {
    await api.delete(`/projects/${id}`)
    router.push('/app/projects')
  }, [id, router])

  const clone = useCallback(async () => {
    await api.post(`/projects/${id}/clone`)
    router.push('/app/projects')
  }, [id, router])

  const inviteCollaborator = useCallback(
    async (email: string, role: CollaboratorRole) => {
      const res = await api.post<{ data: Project }>(`/projects/${id}/collaborators`, {
        email,
        role,
      })
      if (res.data?.data) {
        setProject(res.data.data)
      } else {
        await refetch()
      }
    },
    [id, refetch]
  )

  const removeCollaborator = useCallback(
    async (userId: number) => {
      const res = await api.delete<{ data: Project }>(`/projects/${id}/collaborators/${userId}`)
      if (res.data?.data) {
        setProject(res.data.data)
      } else {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                collaborators: prev.collaborators?.filter((c) => c.id !== userId),
              }
            : prev
        )
      }
    },
    [id]
  )

  return { project, isLoading, error, refetch, update, remove, clone, inviteCollaborator, removeCollaborator }
}
