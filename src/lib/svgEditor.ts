export const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">
  <!-- sample mark -->
  <metadata>WebTools sample</metadata>
  <rect x="8" y="8" width="144" height="104" rx="16" fill="#0f766e"/>
  <circle cx="56" cy="60" r="28" fill="#99f6e4"/>
  <path d="M78 40h46v14H92v16h28v14H92v18H78z" fill="#ecfdf5"/>
</svg>`

export type SvgParseResult =
  | { ok: true; doc: Document; svg: SVGSVGElement }
  | { ok: false; error: string }

function ensureBrowser() {
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    throw new Error('SVG tools need a browser')
  }
}

export function parseSvg(source: string): SvgParseResult {
  ensureBrowser()
  const trimmed = source.trim()
  if (!trimmed) {
    return { ok: false, error: 'Paste SVG first.' }
  }

  const doc = new DOMParser().parseFromString(trimmed, 'image/svg+xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    const message = parserError.textContent?.trim() || 'Invalid SVG'
    return { ok: false, error: message.split('\n')[0] ?? message }
  }

  const root = doc.documentElement
  if (root.localName !== 'svg') {
    return { ok: false, error: 'Root element must be <svg>.' }
  }

  return { ok: true, doc, svg: root as unknown as SVGSVGElement }
}

export function serializeSvg(node: Node): string {
  ensureBrowser()
  return new XMLSerializer().serializeToString(node)
}

export function stripComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, '')
}

export function stripMetadata(source: string): string {
  const parsed = parseSvg(source)
  if (!parsed.ok) throw new Error(parsed.error)

  const removable = ['metadata', 'title', 'desc']
  for (const tag of removable) {
    parsed.svg.querySelectorAll(tag).forEach((el) => el.remove())
  }

  const attrs = [...parsed.svg.attributes]
  for (const attr of attrs) {
    const name = attr.name.toLowerCase()
    if (
      name.startsWith('inkscape:') ||
      name.startsWith('sodipodi:') ||
      name === 'xmlns:inkscape' ||
      name === 'xmlns:sodipodi' ||
      name === 'xmlns:svgjs'
    ) {
      parsed.svg.removeAttribute(attr.name)
    }
  }

  parsed.svg.querySelectorAll('*').forEach((el) => {
    ;[...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase()
      if (name.startsWith('inkscape:') || name.startsWith('sodipodi:')) {
        el.removeAttribute(attr.name)
      }
    })
  })

  return serializeSvg(parsed.svg)
}

export function minifySvg(source: string): string {
  const withoutComments = stripComments(source)
  const parsed = parseSvg(withoutComments)
  if (!parsed.ok) throw new Error(parsed.error)

  let out = serializeSvg(parsed.svg)
  out = out.replace(/>\s+</g, '><')
  out = out.replace(/\s{2,}/g, ' ')
  return out.trim()
}

export function prettifySvg(source: string, indentSize = 2): string {
  const parsed = parseSvg(stripComments(source))
  if (!parsed.ok) throw new Error(parsed.error)

  const raw = serializeSvg(parsed.svg)
  const pad = ' '.repeat(indentSize)
  let formatted = ''
  let depth = 0
  const tokens = raw
    .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
    .split('\n')

  for (const token of tokens) {
    const line = token.trim()
    if (!line) continue
    if (line.startsWith('</')) depth = Math.max(depth - 1, 0)
    formatted += `${pad.repeat(depth)}${line}\n`
    if (
      line.startsWith('<') &&
      !line.startsWith('</') &&
      !line.endsWith('/>') &&
      !/^<\?/.test(line) &&
      !/^<!/.test(line)
    ) {
      depth += 1
    }
  }

  return formatted.trim() + '\n'
}

function parseLength(value: string | null): number | null {
  if (!value) return null
  const match = value.trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+))/)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}

export function ensureViewBoxFromSize(source: string): string {
  const parsed = parseSvg(source)
  if (!parsed.ok) throw new Error(parsed.error)

  const existing = parsed.svg.getAttribute('viewBox')
  if (existing?.trim()) return serializeSvg(parsed.svg)

  const width = parseLength(parsed.svg.getAttribute('width'))
  const height = parseLength(parsed.svg.getAttribute('height'))
  if (width == null || height == null || width <= 0 || height <= 0) {
    throw new Error('Need numeric width and height to set viewBox.')
  }

  parsed.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  return serializeSvg(parsed.svg)
}

/** Measure content bounds via a temporary offscreen render. */
export function fitViewBoxToContent(source: string): string {
  const parsed = parseSvg(source)
  if (!parsed.ok) throw new Error(parsed.error)

  const host = document.createElement('div')
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:0;height:0;overflow:hidden;pointer-events:none'
  host.appendChild(parsed.svg)
  document.body.appendChild(host)

  try {
    const bbox = parsed.svg.getBBox()
    if (!Number.isFinite(bbox.width) || !Number.isFinite(bbox.height)) {
      throw new Error('Could not measure SVG bounds.')
    }
    if (bbox.width <= 0 || bbox.height <= 0) {
      throw new Error('SVG content has empty bounds.')
    }
    const x = Number(bbox.x.toFixed(3))
    const y = Number(bbox.y.toFixed(3))
    const w = Number(bbox.width.toFixed(3))
    const h = Number(bbox.height.toFixed(3))
    parsed.svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`)
    return serializeSvg(parsed.svg)
  } finally {
    host.remove()
  }
}

export function readSvgDimensions(source: string): {
  width: number
  height: number
} | null {
  const parsed = parseSvg(source)
  if (!parsed.ok) return null

  const viewBox = parsed.svg.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number)
    if (
      parts.length === 4 &&
      parts.every((n) => Number.isFinite(n)) &&
      parts[2]! > 0 &&
      parts[3]! > 0
    ) {
      return { width: parts[2]!, height: parts[3]! }
    }
  }

  const width = parseLength(parsed.svg.getAttribute('width'))
  const height = parseLength(parsed.svg.getAttribute('height'))
  if (width != null && height != null && width > 0 && height > 0) {
    return { width, height }
  }
  return null
}

export function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function svgToPngBlob(source: string, scale = 2): Promise<Blob> {
  const dims = readSvgDimensions(source)
  if (!dims) {
    throw new Error('Need viewBox or width/height for PNG export.')
  }

  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Could not rasterize SVG.'))
      image.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(dims.width * scale))
    canvas.height = Math.max(1, Math.round(dims.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new Error('PNG encode failed')),
        'image/png',
      )
    })
    return png
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
