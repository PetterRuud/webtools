import { createServerFn } from '@tanstack/react-start'
import {
  collectLinksToCheck,
  LINK_CHECK_CONCURRENCY,
  LINK_CHECK_TIMEOUT_MS,
  mapPool,
  MAX_LINKS_TO_CHECK,
  pageMetaFromHtml,
  type BrokenLinkItem,
} from '#/lib/brokenLinks'
import { fieldsFromOg } from '#/lib/ogPreview'
import {
  isRedirectStatus,
  MAX_REDIRECT_HOPS,
  REDIRECT_HOP_TIMEOUT_MS,
  resolveRedirectLocation,
  type RedirectHop,
} from '#/lib/redirectChecker'
import {
  checkPaths,
  parseRobotsTxt,
  robotsUrlFromPage,
} from '#/lib/robotsTxt'
import { runSeoAudit } from '#/lib/seoAudit'
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

export const checkRedirectsFn = createServerFn({ method: 'POST' })
  .validator((data: { url?: string }) => ({
    url: normalizeUrl(data.url ?? ''),
  }))
  .handler(async ({ data }) => {
    const hops: RedirectHop[] = []
    let current = data.url
    const seen = new Set<string>()
    let totalMs = 0

    for (let i = 0; i < MAX_REDIRECT_HOPS; i++) {
      if (seen.has(current)) {
        hops.push({
          url: current,
          status: 0,
          ms: 0,
          location: null,
          redirected: false,
          error: 'Redirect loop detected',
        })
        break
      }
      seen.add(current)

      const controller = new AbortController()
      const timer = setTimeout(
        () => controller.abort(),
        REDIRECT_HOP_TIMEOUT_MS,
      )
      const started = Date.now()
      try {
        const res = await fetch(current, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
            'User-Agent': BOT_USER_AGENT,
            'Accept-Language': 'en-US,en;q=0.9',
          },
        })
        const ms = Date.now() - started
        totalMs += ms
        const location = res.headers.get('location')
        const redirected = isRedirectStatus(res.status)
        hops.push({
          url: current,
          status: res.status,
          ms,
          location,
          redirected,
          error: null,
        })

        // Drain body so the connection can close promptly.
        try {
          await res.arrayBuffer()
        } catch {
          /* ignore */
        }

        if (!redirected) break
        const next = resolveRedirectLocation(current, location)
        if (!next) {
          hops[hops.length - 1] = {
            ...hops[hops.length - 1],
            error: 'Redirect without Location header',
          }
          break
        }
        current = next
      } catch (err) {
        const ms = Date.now() - started
        totalMs += ms
        hops.push({
          url: current,
          status: 0,
          ms,
          location: null,
          redirected: false,
          error: err instanceof Error ? err.message : 'Request failed',
        })
        break
      } finally {
        clearTimeout(timer)
      }
    }

    const last = hops[hops.length - 1]
    const finalUrl =
      last && !last.redirected && !last.error
        ? last.url
        : last?.location
          ? (resolveRedirectLocation(last.url, last.location) ?? last.url)
          : (last?.url ?? data.url)

    return {
      startUrl: data.url,
      finalUrl,
      hopCount: hops.length,
      totalMs,
      redirected: hops.some((h) => h.redirected),
      hops,
    }
  })

async function probeUrl(url: string): Promise<{
  status: number | null
  finalUrl: string | null
  ms: number | null
  error: string | null
}> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS)
  const started = Date.now()
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': BOT_USER_AGENT,
        Accept: '*/*',
      },
    })
    // Some hosts reject HEAD — fall back to GET.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': BOT_USER_AGENT,
          Accept: '*/*',
        },
      })
    }
    try {
      await res.arrayBuffer()
    } catch {
      /* ignore */
    }
    return {
      status: res.status,
      finalUrl: res.url || url,
      ms: Date.now() - started,
      error: null,
    }
  } catch (err) {
    return {
      status: null,
      finalUrl: null,
      ms: Date.now() - started,
      error: err instanceof Error ? err.message : 'Request failed',
    }
  } finally {
    clearTimeout(timer)
  }
}

export const checkBrokenLinksFn = createServerFn({ method: 'POST' })
  .validator((data: { url?: string; maxLinks?: number }) => {
    const max =
      typeof data.maxLinks === 'number' && Number.isFinite(data.maxLinks)
        ? Math.min(MAX_LINKS_TO_CHECK, Math.max(1, Math.floor(data.maxLinks)))
        : MAX_LINKS_TO_CHECK
    return {
      url: normalizeUrl(data.url ?? ''),
      maxLinks: max,
    }
  })
  .handler(async ({ data }) => {
    const page = await fetchText(data.url)
    const meta = pageMetaFromHtml(page.body, {
      finalUrl: page.finalUrl,
      status: page.status,
    })
    const collected = collectLinksToCheck(
      page.body,
      page.finalUrl,
      data.maxLinks,
    )

    const probed = await mapPool(
      collected.links,
      LINK_CHECK_CONCURRENCY,
      async (link) => {
        const result = await probeUrl(link.href)
        const ok =
          result.error == null &&
          result.status != null &&
          result.status > 0 &&
          result.status < 400
        const item: BrokenLinkItem = {
          href: link.href,
          text: link.text,
          external: link.external,
          status: result.status,
          finalUrl: result.finalUrl,
          ms: result.ms,
          ok,
          error: result.error,
        }
        return item
      },
    )

    // Broken first, then by status
    probed.sort((a, b) => {
      if (a.ok !== b.ok) return a.ok ? 1 : -1
      return (a.status ?? 999) - (b.status ?? 999)
    })

    const broken = probed.filter((l) => !l.ok).length
    return {
      pageUrl: data.url,
      finalUrl: meta.finalUrl,
      status: meta.status,
      title: meta.title,
      metaDescription: meta.metaDescription,
      canonical: meta.canonical,
      linkCount: collected.linkCount,
      internalLinks: collected.internalLinks,
      externalLinks: collected.externalLinks,
      checked: probed.length,
      capped: collected.capped,
      ok: probed.length - broken,
      broken,
      links: probed,
    }
  })

export const auditSeoFn = createServerFn({ method: 'POST' })
  .validator((data: { url?: string }) => ({
    url: normalizeUrl(data.url ?? ''),
  }))
  .handler(async ({ data }) => {
    const fetched = await fetchText(data.url)
    return runSeoAudit(fetched.body, {
      url: data.url,
      finalUrl: fetched.finalUrl,
      status: fetched.status,
    })
  })
