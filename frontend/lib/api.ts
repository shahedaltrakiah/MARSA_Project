import axios, { AxiosError } from 'axios'
import { getToken } from '@/lib/auth'
import type { ValidationErrors } from '@/types/api'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // A global `Content-Type: application/json` breaks FormData: Laravel never sees `logo` as
  // a file and validates it as a string → 422. Let the runtime set multipart + boundary.
  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type")
    } else {
      delete (config.headers as Record<string, unknown>)["Content-Type"]
      delete (config.headers as Record<string, unknown>)["content-type"]
    }
  }
  return config
})

export function isValidationError(
  error: unknown
): error is AxiosError<ValidationErrors> {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 422 &&
    typeof error.response.data?.errors === 'object'
  )
}

export function getFirstError(
  error: unknown,
  field: string
): string | undefined {
  if (isValidationError(error)) {
    return error.response?.data.errors[field]?.[0]
  }
  return undefined
}

export default api
