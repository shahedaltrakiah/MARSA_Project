import Cookies from 'js-cookie'
import {
  clearToken,
  getStoredUser,
  getToken,
  setToken,
  storeUser,
} from '@/lib/auth'

jest.mock('js-cookie')

const mockCookies = Cookies as jest.Mocked<typeof Cookies>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getToken', () => {
  it('returns null when cookie is absent', () => {
    mockCookies.get.mockReturnValue(undefined)
    expect(getToken()).toBeNull()
  })

  it('returns token string when cookie exists', () => {
    mockCookies.get.mockReturnValue('my-token')
    expect(getToken()).toBe('my-token')
  })
})

describe('setToken', () => {
  it('calls Cookies.set with the correct key and value', () => {
    setToken('abc123')
    expect(mockCookies.set).toHaveBeenCalledWith(
      'marsa_token',
      'abc123',
      expect.objectContaining({ expires: 30, sameSite: 'lax' })
    )
  })
})

describe('clearToken', () => {
  it('removes both token and user cookies', () => {
    clearToken()
    expect(mockCookies.remove).toHaveBeenCalledWith('marsa_token')
    expect(mockCookies.remove).toHaveBeenCalledWith('marsa_user')
  })
})

describe('getStoredUser', () => {
  it('returns null when user cookie is absent', () => {
    mockCookies.get.mockReturnValue(undefined)
    expect(getStoredUser()).toBeNull()
  })

  it('parses and returns the stored user object', () => {
    const user = { id: 1, name: 'Alice', email: 'alice@example.com', created_at: '2024-01-01' }
    mockCookies.get.mockReturnValue(JSON.stringify(user))
    expect(getStoredUser()).toEqual(user)
  })

  it('returns null when cookie value is not valid JSON', () => {
    mockCookies.get.mockReturnValue('not-json{')
    expect(getStoredUser()).toBeNull()
  })
})

describe('storeUser', () => {
  it('serialises user to JSON and calls Cookies.set', () => {
    const user = { id: 2, name: 'Bob', email: 'bob@example.com' }
    storeUser(user)
    expect(mockCookies.set).toHaveBeenCalledWith(
      'marsa_user',
      JSON.stringify(user),
      expect.objectContaining({ expires: 30, sameSite: 'lax' })
    )
  })
})
