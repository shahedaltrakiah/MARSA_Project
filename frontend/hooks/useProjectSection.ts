'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import type { ProjectSectionContent, ProjectSectionName } from '@/types/api'

interface UseProjectSectionResult {
  content: ProjectSectionContent
  isLoading: boolean
  isSaving: boolean
  error: string | null
  save: (data: ProjectSectionContent) => Promise<void>
}

export function useProjectSection(
  projectId: number,
  section: ProjectSectionName
): UseProjectSectionResult {
  const [content, setContent] = useState<ProjectSectionContent>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSection = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ data: ProjectSectionContent }>(
        `/projects/${projectId}/sections/${section}`
      )
      setContent(res.data.data ?? {})
    } catch {
      setError('Failed to load section.')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, section])

  useEffect(() => {
    fetchSection()
  }, [fetchSection])

  const save = useCallback(
    async (data: ProjectSectionContent) => {
      setIsSaving(true)
      setError(null)
      try {
        const res = await api.put<{ data: ProjectSectionContent }>(
          `/projects/${projectId}/sections/${section}`,
          data
        )
        setContent(res.data.data)
      } catch {
        throw new Error('Failed to save section.')
      } finally {
        setIsSaving(false)
      }
    },
    [projectId, section]
  )

  return { content, isLoading, isSaving, error, save }
}
