import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useProjects } from '@/hooks/useProjects'
import type { Project } from '@/types/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

const mockGet = jest.mocked(api.get)

const fakeProject: Project = {
  id: 1,
  name: 'Test Project',
  logo: null,
  description: 'A test project',
  owner: { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', created_at: '2024-01-01' },
  last_modified_by: null,
  collaborators: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
}

beforeEach(() => {
  mockGet.mockReset()
})

describe('useProjects', () => {
  it('starts in loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useProjects())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.projects).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('populates projects on successful fetch', async () => {
    mockGet.mockResolvedValue({ data: { data: [fakeProject] } })
    const { result } = renderHook(() => useProjects())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.projects).toEqual([fakeProject])
    expect(result.current.error).toBeNull()
  })

  it('sets error message on failed fetch', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useProjects())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load projects. Please try again.')
    expect(result.current.projects).toEqual([])
  })

  it('refetch triggers another API call', async () => {
    mockGet.mockResolvedValue({ data: { data: [fakeProject] } })
    const { result } = renderHook(() => useProjects())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.refetch()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockGet).toHaveBeenCalledTimes(2)
  })
})
