import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: false,
})

export const SAMPLE_MARKDOWN = `# Markdown preview

Write on the left — preview updates live.

## GFM bits

- [x] Task lists
- Tables, fenced code, and links

| Tool | Local |
| --- | --- |
| Preview | Yes |
| Export | HTML |

\`\`\`ts
const greeting = 'hello'
\`\`\`

> Secrets stay in your browser.

[WebTools](/)
`

export function markdownToUnsafeHtml(source: string): string {
  return marked.parse(source, { async: false }) as string
}

/** Prefer this in the browser; falls back to unsanitized marked output on SSR. */
export function markdownToHtml(source: string): string {
  const raw = markdownToUnsafeHtml(source)
  if (typeof window === 'undefined') return raw
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
  })
}

export function wrapHtmlDocument(bodyHtml: string, title = 'preview'): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 2rem auto;
    max-width: 48rem;
    padding: 0 1rem;
    font: 16px/1.6 system-ui, sans-serif;
  }
  pre {
    overflow: auto;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background: color-mix(in oklab, Canvas 92%, CanvasText 8%);
  }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid color-mix(in oklab, CanvasText 20%, transparent); padding: 0.4rem 0.6rem; }
  blockquote { margin-left: 0; padding-left: 1rem; border-left: 3px solid currentColor; opacity: 0.9; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
