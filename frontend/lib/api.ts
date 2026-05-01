import axios, { AxiosError } from 'axios'
import { getToken } from '@/lib/auth'
import type { ValidationErrors } from '@/types/api'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
