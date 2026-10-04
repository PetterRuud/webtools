export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export type SitemapEntryOptions = {
  lastmod?: string | null
  changefreq?: ChangeFreq | '' | null
  priority?: string | null
}

export type ParsedUrlLine = {
  raw: string
  loc: string | null
  error: string | null
}

export const CHANGE_FREQS: ChangeFreq[] = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
]

export const PRIORITIES = [
  '1.0',
  '0.9',
  '0.8',
  '0.7',
  '0.6',
  '0.5',
  '0.4',
  '0.3',
  '0.2',
  '0.1',
  '0.0',
] as const

const SAMPLE_URLS = [
  'https://example.com/',
  'https://example.com/about',
  'https://example.com/blog',
  'https://example.com/blog/hello-world',
  'https://example.com/contact',
]

export function sampleSitemapUrls(): string {
  return SAMPLE_URLS.join('\n')
}

export function splitUrlLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function isHttpUrl(value: URL): boolean {
  return value.protocol === 'http:' || value.protocol === 'https:'
}

export function normalizeBaseUrl(base: string): string | null {
  const trimmed = base.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (!isHttpUrl(url)) return null
    return url.href
  } catch {
    return null
  }
}

export function resolveSitemapLoc(
  raw: string,
  baseUrl: string | null,
): { loc: string | null; error: string | null } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { loc: null, error: 'Empty line' }
  }

  try {
    const absolute = new URL(trimmed)
    if (!isHttpUrl(absolute)) {
      return { loc: null, error: 'Only http(s) URLs are allowed' }
    }
    return { loc: absolute.href, error: null }
  } catch {
    // relative / path-like — needs base
  }

  if (!baseUrl) {
    return {
      loc: null,
      error: 'Relative path needs a base URL',
    }
  }

  try {
    const resolved = new URL(trimmed, baseUrl)
    if (!isHttpUrl(resolved)) {
      return { loc: null, error: 'Only http(s) URLs are allowed' }
    }
    return { loc: resolved.href, error: null }
  } catch {
    return { loc: null, error: 'Invalid URL' }
  }
}

export function parseUrlLines(
  input: string,
  baseUrlRaw: string,
): {
  lines: ParsedUrlLine[]
  locs: string[]
  errors: string[]
  baseError: string | null
} {
  const baseTrimmed = baseUrlRaw.trim()
  let baseUrl: string | null = null
  let baseError: string | null = null

  if (baseTrimmed) {
    baseUrl = normalizeBaseUrl(baseTrimmed)
    if (!baseUrl) {
      baseError = 'Base URL must be a valid http(s) URL'
    }
  }

  const rawLines = splitUrlLines(input)
  const seen = new Set<string>()
  const lines: ParsedUrlLine[] = []
  const locs: string[] = []
  const errors: string[] = []

  for (const raw of rawLines) {
    const resolved = resolveSitemapLoc(raw, baseError ? null : baseUrl)
    if (resolved.error || !resolved.loc) {
      const message = resolved.error ?? 'Invalid URL'
      lines.push({ raw, loc: null, error: message })
      errors.push(`${raw}: ${message}`)
      continue
    }

    if (seen.has(resolved.loc)) {
      lines.push({ raw, loc: resolved.loc, error: 'Duplicate (skipped)' })
      continue
    }

    seen.add(resolved.loc)
    lines.push({ raw, loc: resolved.loc, error: null })
    locs.push(resolved.loc)
  }

  return { lines, locs, errors, baseError }
}

function isValidLastmod(value: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime())
  }
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export function todayLastmod(): string {
  return new Date().toISOString().slice(0, 10)
}

export function buildSitemapXml(
  locs: string[],
  options: SitemapEntryOptions = {},
): string {
  const lastmod =
    options.lastmod && options.lastmod.trim()
      ? options.lastmod.trim()
      : null
  const changefreq = options.changefreq ? options.changefreq : null
  const priority =
    options.priority && options.priority.trim()
      ? options.priority.trim()
      : null

  if (lastmod && !isValidLastmod(lastmod)) {
    throw new Error('lastmod must be YYYY-MM-DD or a valid datetime')
  }

  if (priority !== null) {
    const n = Number(priority)
    if (Number.isNaN(n) || n < 0 || n > 1) {
      throw new Error('priority must be between 0.0 and 1.0')
    }
  }

  const body = locs
    .map((loc) => {
      const parts = [`    <loc>${escapeXml(loc)}</loc>`]
      if (lastmod) parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`)
      if (changefreq) {
        parts.push(`    <changefreq>${changefreq}</changefreq>`)
      }
      if (priority !== null) {
        parts.push(`    <priority>${escapeXml(priority)}</priority>`)
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n')
}

export function downloadSitemapXml(xml: string, fileName = 'sitemap.xml') {
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
