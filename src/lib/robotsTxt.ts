export type RobotsRule = {
  userAgent: string
  allows: string[]
  disallows: string[]
}

export type RobotsParseResult = {
  rules: RobotsRule[]
  sitemaps: string[]
  raw: string
}

export type PathCheck = {
  path: string
  allowed: boolean
  matchedBy: string | null
  userAgent: string
}

function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** Minimal robots.txt path match (prefix + * and $). */
export function pathMatches(pattern: string, path: string): boolean {
  if (pattern === '') return false
  if (pattern === '/') return true

  let regex = '^'
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]
    if (ch === '*') regex += '.*'
    else if (ch === '$') regex += '$'
    else if (/[.+?^${}()|[\]\\]/.test(ch)) regex += `\\${ch}`
    else regex += ch
  }
  if (!pattern.endsWith('$') && !pattern.endsWith('*')) {
    // prefix match unless ended with $
  }
  try {
    return new RegExp(regex).test(path)
  } catch {
    return path.startsWith(pattern)
  }
}

export function parseRobotsTxt(raw: string): RobotsParseResult {
  const lines = raw.split(/\r?\n/)
  const rules: RobotsRule[] = []
  const sitemaps: string[] = []
  let current: RobotsRule | null = null

  for (const line of lines) {
    const cleaned = line.replace(/#.*$/, '').trim()
    if (!cleaned) continue
    const colon = cleaned.indexOf(':')
    if (colon === -1) continue
    const key = cleaned.slice(0, colon).trim().toLowerCase()
    const value = cleaned.slice(colon + 1).trim()

    if (key === 'user-agent') {
      current = { userAgent: value, allows: [], disallows: [] }
      rules.push(current)
    } else if (key === 'allow' && current) {
      current.allows.push(value)
    } else if (key === 'disallow' && current) {
      current.disallows.push(value)
    } else if (key === 'sitemap') {
      sitemaps.push(value)
    }
  }

  return { rules, sitemaps, raw }
}

function pickRule(
  rules: RobotsRule[],
  userAgent: string,
): RobotsRule | null {
  const ua = userAgent.toLowerCase()
  const specific = rules.find((r) => r.userAgent.toLowerCase() === ua)
  if (specific) return specific
  const star = rules.find((r) => r.userAgent === '*')
  return star ?? null
}

/**
 * Longest matching Allow/Disallow wins (Google-ish). Empty Disallow = allow all.
 */
export function isPathAllowed(
  rules: RobotsRule[],
  path: string,
  userAgent = '*',
): PathCheck {
  const normalized = normalizePath(path)
  const rule = pickRule(rules, userAgent)
  if (!rule) {
    return {
      path: normalized,
      allowed: true,
      matchedBy: null,
      userAgent,
    }
  }

  type Hit = { kind: 'allow' | 'disallow'; pattern: string; len: number }
  const hits: Hit[] = []

  for (const pattern of rule.allows) {
    if (pathMatches(pattern, normalized)) {
      hits.push({ kind: 'allow', pattern, len: pattern.length })
    }
  }
  for (const pattern of rule.disallows) {
    if (pattern === '') continue
    if (pathMatches(pattern, normalized)) {
      hits.push({ kind: 'disallow', pattern, len: pattern.length })
    }
  }

  if (hits.length === 0) {
    return {
      path: normalized,
      allowed: true,
      matchedBy: null,
      userAgent: rule.userAgent,
    }
  }

  hits.sort((a, b) => b.len - a.len)
  const best = hits[0]
  return {
    path: normalized,
    allowed: best.kind === 'allow',
    matchedBy: `${best.kind}: ${best.pattern}`,
    userAgent: rule.userAgent,
  }
}

export function checkPaths(
  parsed: RobotsParseResult,
  paths: string[],
  userAgent = '*',
): PathCheck[] {
  return paths
    .map((p) => p.trim())
    .filter(Boolean)
    .map((path) => isPathAllowed(parsed.rules, path, userAgent))
}

export function robotsUrlFromPage(url: string): string {
  const parsed = new URL(url.includes('://') ? url : `https://${url}`)
  return `${parsed.origin}/robots.txt`
}

export const SAMPLE_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /private/
Disallow: /*.json$

User-agent: Googlebot
Allow: /
Disallow: /nogoogle

Sitemap: https://example.com/sitemap.xml
`
