import type { HeadingItem, LinkItem, ViewSnapshot } from './types.ts'

const HTML_PREVIEW_LIMIT = 8_000
const TEXT_SNAPSHOT_LIMIT = 8_000
const MAX_HEADINGS = 80
const MAX_LINKS = 40

/** Decode common HTML entities used in titles/text. */
function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number(n)
      return Number.isFinite(code) ? String.fromCodePoint(code) : _
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : _
    })
}

function stripBlocks(html: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')
  return html.replace(re, ' ')
}

function cleanText(raw: string): string {
  return decodeEntities(raw.replace(/\s+/g, ' ').trim())
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i',
  )
  const m = tag.match(re)
  if (!m) return null
  return m[1] ?? m[2] ?? m[3] ?? null
}

/** Visible-ish text a naive crawler would index from raw HTML. */
export function extractTextFromHtml(html: string): string {
  let s = html
  s = stripBlocks(s, 'script')
  s = stripBlocks(s, 'style')
  s = stripBlocks(s, 'noscript')
  s = stripBlocks(s, 'svg')
  s = stripBlocks(s, 'template')
  s = stripBlocks(s, 'head')
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
  s = s.replace(/<[^>]+>/g, ' ')
  s = decodeEntities(s)
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length > TEXT_SNAPSHOT_LIMIT) {
    return `${s.slice(0, TEXT_SNAPSHOT_LIMIT)}…`
  }
  return s
}

export function extractTitle(html: string): string {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return ''
  return cleanText(match[1])
}

export function extractMetaDescription(html: string): string {
  const re =
    /<meta\b[^>]*\bname\s*=\s*(["'])description\1[^>]*>|<meta\b[^>]*\bcontent\s*=\s*(["'])[^"']*\2[^>]*\bname\s*=\s*(["'])description\3[^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const content = attr(match[0], 'content')
    if (content) return cleanText(content)
  }
  return ''
}

export function extractCanonical(html: string): string {
  const re = /<link\b[^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const tag = match[0]
    const rel = attr(tag, 'rel')
    if (!rel) continue
    if (
      rel
        .toLowerCase()
        .split(/\s+/)
        .includes('canonical')
    ) {
      const href = attr(tag, 'href')
      if (href) return cleanText(href)
    }
  }
  return ''
}

export function extractRobots(html: string): string {
  const re = /<meta\b[^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const tag = match[0]
    const name = attr(tag, 'name')?.toLowerCase()
    if (name === 'robots' || name === 'googlebot') {
      const content = attr(tag, 'content')
      if (content) return cleanText(content)
    }
  }
  return ''
}

export function extractOgTags(html: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /<meta\b[^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const tag = match[0]
    const property = attr(tag, 'property') ?? attr(tag, 'name')
    const content = attr(tag, 'content')
    if (!property || content == null) continue
    const key = property.trim().toLowerCase()
    if (
      key.startsWith('og:') ||
      key.startsWith('twitter:') ||
      key === 'twitter:card' ||
      key === 'twitter:title' ||
      key === 'twitter:description' ||
      key === 'twitter:image'
    ) {
      if (!(key in out)) out[key] = cleanText(content)
    }
  }
  return out
}

export function extractHeadings(html: string): HeadingItem[] {
  let body = stripBlocks(html, 'script')
  body = stripBlocks(body, 'style')
  body = stripBlocks(body, 'noscript')
  body = stripBlocks(body, 'svg')
  const re = /<(h([1-6]))\b[^>]*>([\s\S]*?)<\/\1>/gi
  const items: HeadingItem[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(body)) !== null) {
    const level = Number(match[2])
    const text = cleanText(match[3].replace(/<[^>]+>/g, ' '))
    if (!text) continue
    items.push({ level, text })
    if (items.length >= MAX_HEADINGS) break
  }
  return items
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

function resolveHref(
  href: string,
  baseUrl: string,
): { href: string; external: boolean } | null {
  const raw = href.trim()
  if (
    !raw ||
    raw.startsWith('#') ||
    raw.startsWith('javascript:') ||
    raw.startsWith('mailto:') ||
    raw.startsWith('tel:') ||
    raw.startsWith('data:')
  ) {
    return null
  }
  try {
    const resolved = new URL(raw, baseUrl)
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      return null
    }
    const base = new URL(baseUrl)
    const external = resolved.hostname !== base.hostname
    return { href: resolved.toString(), external }
  } catch {
    return null
  }
}

export function extractLinks(
  html: string,
  baseUrl: string,
  options?: { maxLinks?: number },
): {
  linkCount: number
  internalLinks: number
  externalLinks: number
  links: LinkItem[]
} {
  const maxLinks = options?.maxLinks ?? MAX_LINKS
  let body = stripBlocks(html, 'script')
  body = stripBlocks(body, 'style')
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  let internalLinks = 0
  let externalLinks = 0
  let linkCount = 0
  const links: LinkItem[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(body)) !== null) {
    const href = attr(`<a ${match[1]}>`, 'href')
    if (!href) continue
    const resolved = resolveHref(href, baseUrl)
    if (!resolved) continue
    linkCount += 1
    if (resolved.external) externalLinks += 1
    else internalLinks += 1
    if (links.length < maxLinks) {
      const text = cleanText(match[2].replace(/<[^>]+>/g, ' '))
      links.push({
        href: resolved.href,
        text: text || resolved.href,
        external: resolved.external,
      })
    }
  }
  return { linkCount, internalLinks, externalLinks, links }
}

export type ImageItem = {
  src: string
  alt: string | null
  missingAlt: boolean
}

const MAX_IMAGES = 80

/** Collect <img> tags; missingAlt when alt attribute is absent (empty alt is ok). */
export function extractImages(
  html: string,
  baseUrl: string,
): ImageItem[] {
  let body = stripBlocks(html, 'script')
  body = stripBlocks(body, 'style')
  body = stripBlocks(body, 'noscript')
  const re = /<img\b([^>]*)>/gi
  const items: ImageItem[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(body)) !== null) {
    const tag = `<img ${match[1]}>`
    const rawSrc = attr(tag, 'src') ?? attr(tag, 'data-src')
    if (!rawSrc?.trim()) continue
    let src = rawSrc.trim()
    try {
      src = new URL(src, baseUrl).toString()
    } catch {
      /* keep raw */
    }
    const hasAlt = /\balt\s*=/i.test(tag)
    const altRaw = attr(tag, 'alt')
    items.push({
      src,
      alt: hasAlt ? cleanText(altRaw ?? '') : null,
      missingAlt: !hasAlt,
    })
    if (items.length >= MAX_IMAGES) break
  }
  return items
}

export function countLinks(html: string): number {
  const matches = html.match(/\bhref\s*=\s*(["'])[^"']*\1/gi)
  return matches?.length ?? 0
}

export function htmlPreview(html: string): string {
  if (html.length <= HTML_PREVIEW_LIMIT) return html
  return `${html.slice(0, HTML_PREVIEW_LIMIT)}…`
}

export function buildSnapshot(
  html: string,
  meta: { finalUrl: string; status: number | null },
): ViewSnapshot {
  const text = extractTextFromHtml(html)
  const headings = extractHeadings(html)
  const linkStats = extractLinks(html, meta.finalUrl || 'https://example.com')

  return {
    finalUrl: meta.finalUrl,
    status: meta.status,
    title: extractTitle(html),
    metaDescription: extractMetaDescription(html),
    canonical: extractCanonical(html),
    robots: extractRobots(html),
    og: extractOgTags(html),
    headings,
    h1s: headings.filter((h) => h.level === 1).map((h) => h.text),
    wordCount: countWords(text.replace(/…$/, '')),
    linkCount: linkStats.linkCount,
    internalLinks: linkStats.internalLinks,
    externalLinks: linkStats.externalLinks,
    links: linkStats.links,
    text,
    htmlBytes: new TextEncoder().encode(html).byteLength,
    htmlPreview: htmlPreview(html),
  }
}

/** Heuristic: JS view has substantially more text, or titles diverge. */
export function detectLikelySpa(
  noJs: { title: string; text: string },
  withJs: { title: string; text: string } | null,
): boolean | null {
  if (!withJs) return null
  const noLen = noJs.text.length
  const jsLen = withJs.text.length
  if (jsLen === 0 && noLen === 0) return false
  if (noLen < 80 && jsLen > noLen * 3 + 120) return true
  if (jsLen > noLen * 2.5 + 400) return true
  if (
    noJs.title &&
    withJs.title &&
    noJs.title !== withJs.title &&
    jsLen > noLen + 80
  ) {
    return true
  }
  // Empty shell: almost no text without JS, meaningful text with JS
  if (noLen < 40 && jsLen > 200) return true
  return false
}
