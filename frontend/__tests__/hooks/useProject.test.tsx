import { renderHook, act, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import type { Project, User } from '@/types/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), delete: jest.fn(), post: jest.fn() },
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Import after mocks are set up
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useProject } = require('@/hooks/useProject') as typeof import('@/hooks/useProject')

const mockGet = jest.mocked(api.get)
const mockPut = jest.mocked(api.put)
const mockDelete = jest.mocked(api.delete)
const mockPost = jest.mocked(api.post)

const fakeOwner: User = { id: 1, name: 'Alice', email: 'alice@test.com', created_at: '2024-01-01' }

const fakeProject: Project = {
  id: 10,
  name: 'My Startup',
  logo: null,
  description: 'A great idea',
  owner: fakeOwner,
  last_modified_by: null,
  collaborators: [{ id: 2, name: 'Bob', email: 'bob@test.com', role: 'editor' }],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
}

beforeEach(() => {
  mockGet.mockReset()
  mockPut.mockReset()
  mockDelete.mockReset()
  mockPost.mockReset()
  mockPush.mockReset()
})

describe('useProject', () => {
  it('starts in loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useProject(10))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.project).toBeNull()
  })

  it('fetches project on mount', async () => {
    mockGet.mockResolvedValue({ data: { data: fakeProject } })
    const { result } = renderHook(() => useProject(10))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.project).toEqual(fakeProject)
    expect(mockGet).toHaveBeenCalledWith('/projects/10')
  })

  it('sets error on failed fetch', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useProject(10))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load project.')
    expect(result.current.project).toBeNull()
  })

  it('update() PUTs and refreshes project', async () => {
    mockGet.mockResolvedValue({ data: { data: fakeProject } })
    const updated = { ...fakeProject, name: 'Renamed' }
    mockPut.mockResolvedValue({ data: { data: updated } })

    const { result } = renderHook(() => useProject(10))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update({ name: 'Renamed', description: null })
    })

    expect(mockPut).toHaveBeenCalledWith('/projects/10', { name: 'Renamed', description: null })
    expect(result.current.project?.name).toBe('Renamed')
  })

  it('remove() DELETEs and redirects to /app/projects', async () => {
    mockGet.mockResolvedValue({ data: { data: fakeProject } })
    mockDelete.mockResolvedValue({})

    const { result } = renderHook(() => useProject(10))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.remove() })

    expect(mockDelete).toHaveBeenCalledWith('/projects/10')
    expect(mockPush).toHaveBeenCalledWith('/app/projects')
  })

  it('clone() POSTs to clone endpoint and redirects', async () => {
    mockGet.mockResolvedValue({ data: { data: fakeProject } })
    mockPost.mockResolvedValue({})

    const { result } = renderHook(() => useProject(10))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.clone() })

    expect(mockPost).toHaveBeenCalledWith('/projects/10/clone')
    expect(mockPush).toHaveBeenCalledWith('/app/projects')
  })

  it('inviteCollaborator() POSTs and updates project', async () => {
    mockGet.mockResolvedValue({ data: { data: fakeProject } })
    const withNewCollab = {
      ...fakeProject,
      collaborators: [
        ...fakeProject.collaborators!,
        { id: 3, name: 'Carol', email: 'carol@test.com', role: 'viewer' as const },
      ],
    }
    mockPost.mockResolvedValue({ data: { data: withNewCollab } })

    const { result } = renderHook(() => useProject(10))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.inviteCollaborator('carol@test.com', 'viewer')
    })

    expect(mockPost).toHaveBeenCalledWith('/projects/10/collaborators', {
      email: 'carol@test.com',
      role: 'viewer',
    })
    expect(result.current.project?.collaborators).toHaveLength(2)
  })

  it('removeCollaborator() DELETEs and removes from local state', async () => {
    mockGet.mockResolvedValue({ data: { data: fakeProject } })
    mockDelete.mockResolvedValue({})

    const { result } = renderHook(() => useProject(10))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.project?.collaborators).toHaveLength(1)

    await act(async () => { await result.current.removeCollaborator(2) })

    expect(mockDelete).toHaveBeenCalledWith('/projects/10/collaborators/2')
    expect(result.current.project?.collaborators).toHaveLength(0)
  })
})
