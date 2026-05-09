/** Same default base as `lib/api.ts` so `/storage/...` paths resolve when env is unset (local dev). */
function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
  return base.replace(/\/api\/?$/, "")
}

/** Prefix absolute API origin for relative storage paths returned by Laravel. */
export function resolvePublicStorageUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  if (url.startsWith("/")) {
    return `${apiOrigin()}${url}`
  }
  return url
}
