export type RedirectHop = {
  url: string
  status: number
  ms: number
  location: string | null
  redirected: boolean
  error: string | null
}

export type RedirectCheckResult = {
  startUrl: string
  finalUrl: string
  hopCount: number
  totalMs: number
  redirected: boolean
  hops: RedirectHop[]
}

export const MAX_REDIRECT_HOPS = 15
export const REDIRECT_HOP_TIMEOUT_MS = 12_000

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

export function isRedirectStatus(status: number): boolean {
  return REDIRECT_STATUSES.has(status)
}

export function resolveRedirectLocation(
  currentUrl: string,
  location: string | null,
): string | null {
  if (!location?.trim()) return null
  try {
    return new URL(location.trim(), currentUrl).toString()
  } catch {
    return null
  }
}
