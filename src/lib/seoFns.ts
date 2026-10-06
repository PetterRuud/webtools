import { createServerFn } from '@tanstack/react-start'
import { fieldsFromOg } from '#/lib/ogPreview'
import {
  checkPaths,
  parseRobotsTxt,
  robotsUrlFromPage,
} from '#/lib/robotsTxt'
import { buildSnapshot } from '#/lib/spaVsBot/extract'
import {
  BOT_USER_AGENT,
  FETCH_TIMEOUT_MS,
  MAX_HTML_BYTES,
  normalizeUrl,
} from '#/lib/spaVsBot/options'

async function fetchText(url: string): Promise<{
  status: number
  finalUrl: string
  body: string
}> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,text/plain,*/*;q=0.8',
        'User-Agent': BOT_USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    const buf = new Uint8Array(await res.arrayBuffer())
    const sliced =
      buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf
    const body = new TextDecoder('utf-8', { fatal: false }).decode(sliced)
    return {
      status: res.status,
      finalUrl: res.url || url,
      body,
    }
  } finally {
    clearTimeout(timer)
  }
}

export const fetchPageMetaFn = createServerFn({ method: 'POST' })
  .validator((data: { url?: string }) => ({
    url: normalizeUrl(data.url ?? ''),
  }))
  .handler(async ({ data }) => {
    const fetched = await fetchText(data.url)
    const snapshot = buildSnapshot(fetched.body, {
      finalUrl: fetched.finalUrl,
      status: fetched.status,
    })
    const fields = fieldsFromOg(snapshot.og, {
      title: snapshot.title,
      description: snapshot.metaDescription,
      url: snapshot.finalUrl,
    })
    return {
      status: snapshot.status,
      finalUrl: snapshot.finalUrl,
      title: snapshot.title,
      metaDescription: snapshot.metaDescription,
      canonical: snapshot.canonical,
      robots: snapshot.robots,
      og: snapshot.og,
      fields,
    }
  })

export const checkRobotsTxtFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      url?: string
      paths?: string | string[]
      userAgent?: string
      robotsText?: string | null
    }) => {
      const paths = Array.isArray(data.paths)
        ? data.paths.map((p) => String(p))
        : String(data.paths ?? '')
            .split(/\r?\n/)
            .map((p) => p.trim())
            .filter(Boolean)
      return {
        urlRaw: (data.url ?? '').trim(),
        paths,
        userAgent: (data.userAgent ?? '*').trim() || '*',
        robotsText:
          typeof data.robotsText === 'string' ? data.robotsText : null,
      }
    },
  )
  .handler(async ({ data }) => {
    let raw = data.robotsText
    let robotsUrl: string | null = null
    let status: number | null = null

    if (raw == null || !raw.trim()) {
      if (!data.urlRaw) {
        throw new Error('Enter a site URL or paste robots.txt.')
      }
      robotsUrl = robotsUrlFromPage(normalizeUrl(data.urlRaw))
      const fetched = await fetchText(robotsUrl)
      status = fetched.status
      raw = fetched.body
      if (fetched.status >= 400) {
        throw new Error(`Could not fetch robots.txt (HTTP ${fetched.status}).`)
      }
    }

    const parsed = parseRobotsTxt(raw)
    const checks = checkPaths(parsed, data.paths, data.userAgent)
    return {
      robotsUrl,
      status,
      sitemaps: parsed.sitemaps,
      rules: parsed.rules,
      checks,
      raw,
    }
  })
