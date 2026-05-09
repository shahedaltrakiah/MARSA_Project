import { renderHook, act, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useProjectSection } from '@/hooks/useProjectSection'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(api.get)
const mockPut = jest.mocked(api.put)

beforeEach(() => {
  mockGet.mockReset()
  mockPut.mockReset()
})

describe('useProjectSection', () => {
  it('starts in loading state with empty content', () => {
    mockGet.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useProjectSection(1, 'offering'))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.content).toEqual({})
    expect(result.current.error).toBeNull()
  })

  it('populates content on successful fetch', async () => {
    mockGet.mockResolvedValue({ data: { data: { value_proposition: 'We save time.' } } })
    const { result } = renderHook(() => useProjectSection(1, 'offering'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.content).toEqual({ value_proposition: 'We save time.' })
    expect(result.current.error).toBeNull()
  })

  it('returns empty object when section has no content yet', async () => {
    mockGet.mockResolvedValue({ data: { data: null } })
    const { result } = renderHook(() => useProjectSection(1, 'offering'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.content).toEqual({})
  })

  it('sets error on failed fetch', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useProjectSection(1, 'action'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load section.')
    expect(result.current.content).toEqual({})
  })

  it('calls correct endpoint for section', async () => {
    mockGet.mockResolvedValue({ data: { data: {} } })
    renderHook(() => useProjectSection(42, 'reach'))

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))
    expect(mockGet).toHaveBeenCalledWith('/projects/42/sections/reach')
  })

  it('save() calls PUT and updates content', async () => {
    mockGet.mockResolvedValue({ data: { data: {} } })
    mockPut.mockResolvedValue({ data: { data: { value_proposition: 'New value' } } })

    const { result } = renderHook(() => useProjectSection(1, 'offering'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.save({ value_proposition: 'New value' })
    })

    expect(mockPut).toHaveBeenCalledWith(
      '/projects/1/sections/offering',
      { value_proposition: 'New value' }
    )
    expect(result.current.content).toEqual({ value_proposition: 'New value' })
  })

  it('save() sets isSaving during request', async () => {
    mockGet.mockResolvedValue({ data: { data: {} } })
    let resolvePut!: (v: unknown) => void
    mockPut.mockReturnValue(new Promise((res) => { resolvePut = res }))

    const { result } = renderHook(() => useProjectSection(1, 'offering'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { void result.current.save({ value_proposition: 'x' }) })
    expect(result.current.isSaving).toBe(true)

    act(() => resolvePut({ data: { data: { value_proposition: 'x' } } }))
    await waitFor(() => expect(result.current.isSaving).toBe(false))
  })

  it('save() throws on failure', async () => {
    mockGet.mockResolvedValue({ data: { data: {} } })
    mockPut.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useProjectSection(1, 'offering'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(result.current.save({ value_proposition: 'x' })).rejects.toThrow('Failed to save section.')
    expect(result.current.isSaving).toBe(false)
  })

  it('refetches when projectId changes', async () => {
    mockGet.mockResolvedValue({ data: { data: {} } })

    const { rerender } = renderHook(
      ({ id }: { id: number }) => useProjectSection(id, 'offering'),
      { initialProps: { id: 1 } }
    )
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))

    rerender({ id: 2 })
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2))
    expect(mockGet).toHaveBeenLastCalledWith('/projects/2/sections/offering')
  })
})
