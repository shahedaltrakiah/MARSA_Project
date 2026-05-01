'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import type { Project } from '@/types/api'

interface UseProjectsResult {
  projects: Project[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ data: Project[] }>('/projects')
      setProjects(res.data.data)
    } catch {
      setError('Failed to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, isLoading, error, refetch: fetchProjects }
}
