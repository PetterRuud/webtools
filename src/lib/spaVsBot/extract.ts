const HTML_PREVIEW_LIMIT = 4_000
const TEXT_SNAPSHOT_LIMIT = 8_000

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
  return decodeEntities(match[1].replace(/\s+/g, ' ').trim())
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
): import('./types.ts').ViewSnapshot {
  return {
    finalUrl: meta.finalUrl,
    status: meta.status,
    title: extractTitle(html),
    text: extractTextFromHtml(html),
    linkCount: countLinks(html),
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
