import Cookies from 'js-cookie'
import {
  clearToken,
  getStoredUser,
  getToken,
  setToken,
  storeUser,
} from '@/lib/auth'

jest.mock('js-cookie')

// Cookies.get has overloaded signatures; cast to jest.Mock to avoid TS overload conflicts.
const mockGet = Cookies.get as jest.Mock
const mockSet = Cookies.set as jest.Mock
const mockRemove = Cookies.remove as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getToken', () => {
  it('returns null when cookie is absent', () => {
    mockGet.mockImplementation(() => undefined)
    expect(getToken()).toBeNull()
  })

  it('returns token string when cookie exists', () => {
    mockGet.mockImplementation(() => 'my-token')
    expect(getToken()).toBe('my-token')
  })
})

describe('setToken', () => {
  it('calls Cookies.set with the correct key and value', () => {
    setToken('abc123')
    expect(mockSet).toHaveBeenCalledWith(
      'marsa_token',
      'abc123',
      expect.objectContaining({ expires: 30, sameSite: 'lax' })
    )
  })
})

describe('clearToken', () => {
  it('removes both token and user cookies', () => {
    clearToken()
    expect(mockRemove).toHaveBeenCalledWith('marsa_token')
    expect(mockRemove).toHaveBeenCalledWith('marsa_user')
  })
})

describe('getStoredUser', () => {
  it('returns null when user cookie is absent', () => {
    mockGet.mockImplementation(() => undefined)
    expect(getStoredUser()).toBeNull()
  })

  it('parses and returns the stored user object', () => {
    const user = { id: 1, name: 'Alice', email: 'alice@example.com', created_at: '2024-01-01' }
    mockGet.mockImplementation(() => JSON.stringify(user))
    expect(getStoredUser()).toEqual(user)
  })

  it('returns null when cookie value is not valid JSON', () => {
    mockGet.mockImplementation(() => 'not-json{')
    expect(getStoredUser()).toBeNull()
  })
})

describe('storeUser', () => {
  it('serialises user to JSON and calls Cookies.set', () => {
    const user = { id: 2, name: 'Bob', email: 'bob@example.com' }
    storeUser(user)
    expect(mockSet).toHaveBeenCalledWith(
      'marsa_user',
      JSON.stringify(user),
      expect.objectContaining({ expires: 30, sameSite: 'lax' })
    )
  })
})
