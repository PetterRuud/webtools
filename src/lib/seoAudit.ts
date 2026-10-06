import {
  buildSnapshot,
  extractImages,
} from '#/lib/spaVsBot/extract'
import type { ViewSnapshot } from '#/lib/spaVsBot/types'

export type AuditSeverity = 'pass' | 'warn' | 'fail' | 'info'

export type AuditIssue = {
  id: string
  severity: AuditSeverity
  category: string
  title: string
  detail: string
  value?: string
}

export type SeoAuditGrade = 'excellent' | 'good' | 'fair' | 'poor'

export type SeoAuditResult = {
  url: string
  finalUrl: string
  status: number
  title: string
  metaDescription: string
  canonical: string
  robots: string
  wordCount: number
  h1Count: number
  imageCount: number
  imagesMissingAlt: number
  /** 0–100 from pass/warn/fail (info ignored). */
  score: number
  grade: SeoAuditGrade
  summary: Record<AuditSeverity, number>
  issues: AuditIssue[]
  snapshot: ViewSnapshot
}

/** pass=1, warn=0.5, fail=0; info excluded. */
export function scoreFromSummary(
  summary: Pick<Record<AuditSeverity, number>, 'pass' | 'warn' | 'fail'>,
): { score: number; grade: SeoAuditGrade } {
  const scored = summary.pass + summary.warn + summary.fail
  const score =
    scored === 0
      ? 100
      : Math.round(
          ((summary.pass * 1 + summary.warn * 0.5 + summary.fail * 0) /
            scored) *
            100,
        )
  const grade: SeoAuditGrade =
    score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor'
  return { score, grade }
}

const TITLE_MIN = 30
const TITLE_MAX = 60
const DESC_MIN = 70
const DESC_MAX = 160
const THIN_WORDS = 200

function push(
  issues: AuditIssue[],
  issue: AuditIssue,
) {
  issues.push(issue)
}

export function runSeoAudit(
  html: string,
  meta: { url: string; finalUrl: string; status: number },
): SeoAuditResult {
  const snapshot = buildSnapshot(html, {
    finalUrl: meta.finalUrl,
    status: meta.status,
  })
  const images = extractImages(html, meta.finalUrl)
  const missingAlt = images.filter((img) => img.missingAlt)
  const issues: AuditIssue[] = []

  // Title
  if (!snapshot.title) {
    push(issues, {
      id: 'title-missing',
      severity: 'fail',
      category: 'Title',
      title: 'Missing title',
      detail: 'No <title> tag found.',
    })
  } else {
    const len = snapshot.title.length
    if (len < TITLE_MIN) {
      push(issues, {
        id: 'title-short',
        severity: 'warn',
        category: 'Title',
        title: 'Title may be too short',
        detail: `Aim for ~${TITLE_MIN}–${TITLE_MAX} characters.`,
        value: `${len} chars · ${snapshot.title}`,
      })
    } else if (len > TITLE_MAX) {
      push(issues, {
        id: 'title-long',
        severity: 'warn',
        category: 'Title',
        title: 'Title may be truncated in SERPs',
        detail: `Over ~${TITLE_MAX} characters often gets cut.`,
        value: `${len} chars · ${snapshot.title}`,
      })
    } else {
      push(issues, {
        id: 'title-ok',
        severity: 'pass',
        category: 'Title',
        title: 'Title looks fine',
        detail: `${len} characters.`,
        value: snapshot.title,
      })
    }
  }

  // Meta description
  if (!snapshot.metaDescription) {
    push(issues, {
      id: 'desc-missing',
      severity: 'fail',
      category: 'Meta',
      title: 'Missing meta description',
      detail: 'Add a unique meta description for search snippets.',
    })
  } else {
    const len = snapshot.metaDescription.length
    if (len < DESC_MIN) {
      push(issues, {
        id: 'desc-short',
        severity: 'warn',
        category: 'Meta',
        title: 'Meta description short',
        detail: `Aim for ~${DESC_MIN}–${DESC_MAX} characters.`,
        value: `${len} chars`,
      })
    } else if (len > DESC_MAX) {
      push(issues, {
        id: 'desc-long',
        severity: 'warn',
        category: 'Meta',
        title: 'Meta description long',
        detail: `Over ~${DESC_MAX} characters may truncate.`,
        value: `${len} chars`,
      })
    } else {
      push(issues, {
        id: 'desc-ok',
        severity: 'pass',
        category: 'Meta',
        title: 'Meta description looks fine',
        detail: `${len} characters.`,
        value: snapshot.metaDescription,
      })
    }
  }

  // Headings / H1
  const h1Count = snapshot.h1s.length
  if (h1Count === 0) {
    push(issues, {
      id: 'h1-missing',
      severity: 'fail',
      category: 'Headings',
      title: 'No H1',
      detail: 'Pages should have one primary H1.',
    })
  } else if (h1Count > 1) {
    push(issues, {
      id: 'h1-multiple',
      severity: 'warn',
      category: 'Headings',
      title: 'Multiple H1s',
      detail: `Found ${h1Count} H1 headings.`,
      value: snapshot.h1s.slice(0, 3).join(' · '),
    })
  } else {
    push(issues, {
      id: 'h1-ok',
      severity: 'pass',
      category: 'Headings',
      title: 'Single H1',
      detail: 'One primary heading.',
      value: snapshot.h1s[0],
    })
  }

  // Heading order (skip levels)
  let prev = 0
  let skipped = false
  for (const h of snapshot.headings) {
    if (prev > 0 && h.level > prev + 1) {
      skipped = true
      break
    }
    prev = h.level
  }
  if (skipped) {
    push(issues, {
      id: 'heading-skip',
      severity: 'warn',
      category: 'Headings',
      title: 'Heading level skip',
      detail: 'Hierarchy jumps a level (e.g. H2 → H4).',
    })
  } else if (snapshot.headings.length > 0) {
    push(issues, {
      id: 'heading-order-ok',
      severity: 'pass',
      category: 'Headings',
      title: 'Heading order looks ok',
      detail: `${snapshot.headings.length} headings checked.`,
    })
  }

  // Canonical
  if (!snapshot.canonical) {
    push(issues, {
      id: 'canonical-missing',
      severity: 'warn',
      category: 'Canonical',
      title: 'No canonical link',
      detail: 'Add rel="canonical" to avoid duplicate signals.',
    })
  } else {
    try {
      const canon = new URL(snapshot.canonical, meta.finalUrl)
      const final = new URL(meta.finalUrl)
      if (canon.origin + canon.pathname !== final.origin + final.pathname) {
        push(issues, {
          id: 'canonical-differs',
          severity: 'info',
          category: 'Canonical',
          title: 'Canonical differs from final URL',
          detail: 'May be intentional (pagination, variants).',
          value: snapshot.canonical,
        })
      } else {
        push(issues, {
          id: 'canonical-ok',
          severity: 'pass',
          category: 'Canonical',
          title: 'Canonical present',
          detail: 'Matches the final URL path.',
          value: snapshot.canonical,
        })
      }
    } catch {
      push(issues, {
        id: 'canonical-invalid',
        severity: 'fail',
        category: 'Canonical',
        title: 'Invalid canonical URL',
        detail: 'Could not parse the canonical href.',
        value: snapshot.canonical,
      })
    }
  }

  // Robots
  const robots = snapshot.robots.toLowerCase()
  if (robots.includes('noindex')) {
    push(issues, {
      id: 'robots-noindex',
      severity: 'fail',
      category: 'Robots',
      title: 'noindex set',
      detail: 'Page asks crawlers not to index it.',
      value: snapshot.robots,
    })
  } else if (robots.includes('nofollow')) {
    push(issues, {
      id: 'robots-nofollow',
      severity: 'warn',
      category: 'Robots',
      title: 'nofollow set',
      detail: 'Links on this page may not pass crawl signal.',
      value: snapshot.robots,
    })
  } else if (snapshot.robots) {
    push(issues, {
      id: 'robots-ok',
      severity: 'pass',
      category: 'Robots',
      title: 'Robots meta ok',
      detail: 'No noindex detected.',
      value: snapshot.robots,
    })
  } else {
    push(issues, {
      id: 'robots-default',
      severity: 'info',
      category: 'Robots',
      title: 'No robots meta',
      detail: 'Defaults to index,follow unless HTTP header says otherwise.',
    })
  }

  // Open Graph
  const ogTitle = snapshot.og['og:title']
  const ogDesc = snapshot.og['og:description']
  const ogImage = snapshot.og['og:image']
  if (!ogTitle && !ogDesc && !ogImage) {
    push(issues, {
      id: 'og-missing',
      severity: 'warn',
      category: 'Open Graph',
      title: 'No Open Graph tags',
      detail: 'Add og:title, og:description, og:image for social shares.',
    })
  } else {
    if (!ogTitle) {
      push(issues, {
        id: 'og-title-missing',
        severity: 'warn',
        category: 'Open Graph',
        title: 'Missing og:title',
        detail: 'Share cards fall back to <title>.',
      })
    }
    if (!ogDesc) {
      push(issues, {
        id: 'og-desc-missing',
        severity: 'warn',
        category: 'Open Graph',
        title: 'Missing og:description',
        detail: 'Share cards fall back to meta description.',
      })
    }
    if (!ogImage) {
      push(issues, {
        id: 'og-image-missing',
        severity: 'warn',
        category: 'Open Graph',
        title: 'Missing og:image',
        detail: 'Social previews work better with an image.',
      })
    }
    if (ogTitle && ogDesc && ogImage) {
      push(issues, {
        id: 'og-ok',
        severity: 'pass',
        category: 'Open Graph',
        title: 'Core OG tags present',
        detail: 'og:title, og:description, og:image found.',
      })
    }
  }

  // Twitter
  if (!snapshot.og['twitter:card'] && !snapshot.og['twitter:title']) {
    push(issues, {
      id: 'twitter-missing',
      severity: 'info',
      category: 'Social',
      title: 'No Twitter card tags',
      detail: 'Optional; X often falls back to OG.',
    })
  }

  // Images alt
  if (images.length === 0) {
    push(issues, {
      id: 'images-none',
      severity: 'info',
      category: 'Images',
      title: 'No <img> tags found',
      detail: 'Nothing to check for alt text.',
    })
  } else if (missingAlt.length > 0) {
    push(issues, {
      id: 'images-alt',
      severity: 'fail',
      category: 'Images',
      title: 'Images missing alt',
      detail: `${missingAlt.length} of ${images.length} images lack alt text.`,
      value: missingAlt
        .slice(0, 3)
        .map((i) => i.src)
        .join(' · '),
    })
  } else {
    push(issues, {
      id: 'images-alt-ok',
      severity: 'pass',
      category: 'Images',
      title: 'All images have alt',
      detail: `${images.length} images checked.`,
    })
  }

  // Content
  if (snapshot.wordCount < 50) {
    push(issues, {
      id: 'content-empty',
      severity: 'fail',
      category: 'Content',
      title: 'Very little text',
      detail: 'Crawlers may see a thin or empty page (SPA shell?).',
      value: `${snapshot.wordCount} words`,
    })
  } else if (snapshot.wordCount < THIN_WORDS) {
    push(issues, {
      id: 'content-thin',
      severity: 'warn',
      category: 'Content',
      title: 'Thin content',
      detail: `Under ~${THIN_WORDS} words in raw HTML.`,
      value: `${snapshot.wordCount} words`,
    })
  } else {
    push(issues, {
      id: 'content-ok',
      severity: 'pass',
      category: 'Content',
      title: 'Content length ok',
      detail: 'Enough visible text in raw HTML.',
      value: `${snapshot.wordCount} words`,
    })
  }

  // HTTP status
  if (meta.status >= 400) {
    push(issues, {
      id: 'http-error',
      severity: 'fail',
      category: 'HTTP',
      title: `HTTP ${meta.status}`,
      detail: 'Page returned an error status.',
    })
  } else if (meta.status >= 300) {
    push(issues, {
      id: 'http-redirect',
      severity: 'info',
      category: 'HTTP',
      title: `HTTP ${meta.status}`,
      detail: 'Unexpected redirect status after follow.',
    })
  } else {
    push(issues, {
      id: 'http-ok',
      severity: 'pass',
      category: 'HTTP',
      title: `HTTP ${meta.status}`,
      detail: 'Page fetched successfully.',
    })
  }

  // URL https
  try {
    const u = new URL(meta.finalUrl)
    if (u.protocol === 'http:') {
      push(issues, {
        id: 'https',
        severity: 'warn',
        category: 'URL',
        title: 'Not HTTPS',
        detail: 'Prefer HTTPS for indexing and trust.',
      })
    } else {
      push(issues, {
        id: 'https-ok',
        severity: 'pass',
        category: 'URL',
        title: 'HTTPS',
        detail: 'Final URL uses HTTPS.',
      })
    }
  } catch {
    /* ignore */
  }

  const order: AuditSeverity[] = ['fail', 'warn', 'pass', 'info']
  issues.sort(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
  )

  const summary: Record<AuditSeverity, number> = {
    pass: 0,
    warn: 0,
    fail: 0,
    info: 0,
  }
  for (const issue of issues) {
    summary[issue.severity] += 1
  }

  const { score, grade } = scoreFromSummary(summary)

  return {
    url: meta.url,
    finalUrl: meta.finalUrl,
    status: meta.status,
    title: snapshot.title,
    metaDescription: snapshot.metaDescription,
    canonical: snapshot.canonical,
    robots: snapshot.robots,
    wordCount: snapshot.wordCount,
    h1Count,
    imageCount: images.length,
    imagesMissingAlt: missingAlt.length,
    score,
    grade,
    summary,
    issues,
    snapshot,
  }
}
