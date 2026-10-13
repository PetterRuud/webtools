export type AppIconBackground =
  | { kind: 'solid'; color: string }
  | {
      kind: 'gradient'
      from: string
      to: string
      angle: number
    }
  | { kind: 'transparent' }

export type AppIconOptions = {
  background: AppIconBackground
  /** Recolor SVG / Lucide. Ignored for raster uploads. */
  foreground: string | null
  radiusPercent: number
  paddingPercent: number
}

export type AppIconSize = {
  size: number
  fileName: string
  label: string
  purpose?: 'any' | 'maskable'
  /**
   * Full-bleed square — OS / CSS applies the mask (Apple HIG, Play, maskable).
   * Do not bake corner radius into these assets.
   */
  squareExport?: boolean
}

export type AppIconAsset = {
  size: number
  fileName: string
  label: string
  blob: Blob
  url: string
}

export type AppManifestFields = {
  name: string
  shortName: string
  themeColor: string
  backgroundColor: string
  startUrl: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
}

/** Favicon + apple-touch + PWA + store master. */
export const APP_ICON_PNG_SIZES: AppIconSize[] = [
  { size: 16, fileName: 'favicon-16x16.png', label: '16×16' },
  { size: 32, fileName: 'favicon-32x32.png', label: '32×32' },
  { size: 48, fileName: 'favicon-48x48.png', label: '48×48' },
  {
    size: 180,
    fileName: 'apple-touch-icon.png',
    label: '180×180',
    squareExport: true,
  },
  { size: 192, fileName: 'icon-192.png', label: '192×192', purpose: 'any' },
  { size: 512, fileName: 'icon-512.png', label: '512×512', purpose: 'any' },
  {
    size: 512,
    fileName: 'icon-512-maskable.png',
    label: '512 maskable',
    purpose: 'maskable',
    squareExport: true,
  },
  {
    size: 1024,
    fileName: 'icon-1024.png',
    label: '1024×1024',
    squareExport: true,
  },
]

/** Options for a size — store / maskable stay square (system applies mask). */
export function optionsForIconSize(
  options: AppIconOptions,
  spec: Pick<AppIconSize, 'squareExport' | 'purpose'>,
): AppIconOptions {
  if (spec.squareExport || spec.purpose === 'maskable') {
    return { ...options, radiusPercent: 0 }
  }
  return options
}

const ICO_SIZES = [16, 32, 48] as const

function clampPercent(value: number, max = 50): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(max, Math.max(0, value))
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer())
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function fillBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  background: AppIconBackground,
  radius: number,
) {
  if (background.kind === 'transparent') return

  if (background.kind === 'solid') {
    ctx.fillStyle = background.color
  } else {
    const rad = (background.angle * Math.PI) / 180
    const x0 = size / 2 - (Math.cos(rad) * size) / 2
    const y0 = size / 2 - (Math.sin(rad) * size) / 2
    const x1 = size / 2 + (Math.cos(rad) * size) / 2
    const y1 = size / 2 + (Math.sin(rad) * size) / 2
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
    gradient.addColorStop(0, background.from)
    gradient.addColorStop(1, background.to)
    ctx.fillStyle = gradient
  }

  if (radius > 0) {
    roundedRectPath(ctx, 0, 0, size, size, radius)
    ctx.fill()
  } else {
    ctx.fillRect(0, 0, size, size)
  }
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not decode that image'))
    image.src = url
  })
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  return loadImageFromUrl(url).finally(() => URL.revokeObjectURL(url))
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not encode PNG'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

/** Build a multi-size ICO using embedded PNG frames. */
export async function buildIcoFromPngBlobs(
  frames: Array<{ size: number; png: Blob }>,
): Promise<Blob> {
  const entries = await Promise.all(
    frames.map(async (frame) => ({
      size: frame.size,
      bytes: await blobToUint8Array(frame.png),
    })),
  )

  const count = entries.length
  const headerSize = 6 + count * 16
  let offset = headerSize
  const offsets: number[] = []
  for (const entry of entries) {
    offsets.push(offset)
    offset += entry.bytes.length
  }

  const out = new Uint8Array(offset)
  const view = new DataView(out.buffer)

  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, count, true)

  for (let i = 0; i < count; i += 1) {
    const entry = entries[i]!
    const dir = 6 + i * 16
    const dim = entry.size >= 256 ? 0 : entry.size
    out[dir] = dim
    out[dir + 1] = dim
    out[dir + 2] = 0
    out[dir + 3] = 0
    view.setUint16(dir + 4, 1, true)
    view.setUint16(dir + 6, 32, true)
    view.setUint32(dir + 8, entry.bytes.length, true)
    view.setUint32(dir + 12, offsets[i]!, true)
    out.set(entry.bytes, offsets[i]!)
  }

  return new Blob([toArrayBuffer(out)], { type: 'image/x-icon' })
}

function crcTable(): Uint32Array {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c
  }
  return table
}

const CRC_TABLE = crcTable()

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/** Minimal store-method ZIP (no compression). */
export async function buildZip(
  files: Array<{ name: string; data: Blob | Uint8Array }>,
): Promise<Blob> {
  const parts: Array<{
    nameBytes: Uint8Array
    data: Uint8Array
    crc: number
    localHeaderOffset: number
  }> = []

  let offset = 0
  const locals: Uint8Array[] = []

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name)
    const data =
      file.data instanceof Uint8Array
        ? file.data
        : await blobToUint8Array(file.data)
    const crc = crc32(data)
    const local = new Uint8Array(30 + nameBytes.length + data.length)
    const view = new DataView(local.buffer)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 0, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, 0, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, data.length, true)
    view.setUint32(22, data.length, true)
    view.setUint16(26, nameBytes.length, true)
    view.setUint16(28, 0, true)
    local.set(nameBytes, 30)
    local.set(data, 30 + nameBytes.length)
    locals.push(local)
    parts.push({
      nameBytes,
      data,
      crc,
      localHeaderOffset: offset,
    })
    offset += local.length
  }

  const centralChunks: Uint8Array[] = []
  let centralSize = 0
  for (const part of parts) {
    const central = new Uint8Array(46 + part.nameBytes.length)
    const view = new DataView(central.buffer)
    view.setUint32(0, 0x02014b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 20, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, 0, true)
    view.setUint16(14, 0, true)
    view.setUint32(16, part.crc, true)
    view.setUint32(20, part.data.length, true)
    view.setUint32(24, part.data.length, true)
    view.setUint16(28, part.nameBytes.length, true)
    view.setUint16(30, 0, true)
    view.setUint16(32, 0, true)
    view.setUint16(34, 0, true)
    view.setUint16(36, 0, true)
    view.setUint32(38, 0, true)
    view.setUint32(42, part.localHeaderOffset, true)
    central.set(part.nameBytes, 46)
    centralChunks.push(central)
    centralSize += central.length
  }

  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(4, 0, true)
  endView.setUint16(6, 0, true)
  endView.setUint16(8, parts.length, true)
  endView.setUint16(10, parts.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)
  endView.setUint16(20, 0, true)

  return new Blob(
    [...locals, ...centralChunks, end].map((chunk) => toArrayBuffer(chunk)),
    { type: 'application/zip' },
  )
}

/**
 * Normalize pasted/uploaded SVG; optionally recolor (stroke-first for Lucide-like).
 */
export function prepareSvgMarkup(
  raw: string,
  options?: { foreground?: string | null; size?: number },
): string {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('SVG is empty')
  const parser = new DOMParser()
  const doc = parser.parseFromString(trimmed, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  if (!svg || doc.querySelector('parsererror')) {
    throw new Error('Invalid SVG')
  }

  const size = options?.size ?? 512
  if (!svg.getAttribute('viewBox')) {
    const w = Number.parseFloat(svg.getAttribute('width') || '') || size
    const h = Number.parseFloat(svg.getAttribute('height') || '') || size
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  if (options?.foreground) {
    const color = options.foreground
    svg.setAttribute('color', color)
    const stroked = Boolean(svg.querySelector('[stroke]'))
    const filled = Boolean(
      svg.querySelector(
        '[fill]:not([fill="none"]):not([fill=""]):not([fill="currentColor"])',
      ),
    )

    if (stroked && !filled) {
      svg.setAttribute('fill', 'none')
      svg.setAttribute('stroke', color)
      svg.querySelectorAll('[stroke]').forEach((el) => {
        const stroke = el.getAttribute('stroke')
        if (stroke && stroke !== 'none') el.setAttribute('stroke', color)
      })
    } else {
      svg.querySelectorAll('[fill]').forEach((el) => {
        const fill = el.getAttribute('fill')
        if (fill && fill !== 'none') el.setAttribute('fill', color)
      })
      svg.querySelectorAll('[stroke]').forEach((el) => {
        const stroke = el.getAttribute('stroke')
        if (stroke && stroke !== 'none') el.setAttribute('stroke', color)
      })
      const rootFill = svg.getAttribute('fill')
      if (!rootFill || rootFill === 'currentColor') {
        svg.setAttribute('fill', color)
      }
    }
  }

  return new XMLSerializer().serializeToString(svg)
}

export async function svgMarkupToImage(
  markup: string,
): Promise<HTMLImageElement> {
  // Data URL — blob URLs revoked in finally break later canvas drawImage.
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  return loadImageFromUrl(url)
}

export function renderAppIconCanvas(
  source: CanvasImageSource,
  size: number,
  options: AppIconOptions,
  maskable = false,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable in this browser')

  const radiusPercent = clampPercent(options.radiusPercent)
  // Maskable safe zone ≈ center 80% (≥10% inset). Don't stack on top of user padding.
  const paddingPercent = clampPercent(
    maskable ? Math.max(options.paddingPercent, 10) : options.paddingPercent,
    40,
  )
  const radius = (radiusPercent / 100) * size
  const padding = (paddingPercent / 100) * size
  const drawSize = Math.max(1, size - padding * 2)

  ctx.clearRect(0, 0, size, size)
  fillBackground(ctx, size, options.background, radius)

  ctx.save()
  if (radius > 0) {
    roundedRectPath(ctx, 0, 0, size, size, radius)
    ctx.clip()
  }

  const sourceWidth =
    'naturalWidth' in source && typeof source.naturalWidth === 'number'
      ? source.naturalWidth || (source as HTMLCanvasElement).width
      : (source as HTMLCanvasElement).width
  const sourceHeight =
    'naturalHeight' in source && typeof source.naturalHeight === 'number'
      ? source.naturalHeight || (source as HTMLCanvasElement).height
      : (source as HTMLCanvasElement).height

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Image has no dimensions')
  }

  const scale = Math.min(drawSize / sourceWidth, drawSize / sourceHeight)
  const width = sourceWidth * scale
  const height = sourceHeight * scale
  const x = padding + (drawSize - width) / 2
  const y = padding + (drawSize - height) / 2
  ctx.drawImage(source, x, y, width, height)
  ctx.restore()

  return canvas
}

export async function resolveIconSource(input: {
  kind: 'image' | 'svg' | 'lucide'
  file?: File | null
  svgText?: string
  lucideSvg?: string
  foreground: string | null
}): Promise<CanvasImageSource> {
  if (input.kind === 'lucide') {
    if (!input.lucideSvg) throw new Error('Pick a Lucide icon')
    const markup = prepareSvgMarkup(input.lucideSvg, {
      foreground: input.foreground,
      size: 512,
    })
    return svgMarkupToImage(markup)
  }

  if (input.kind === 'svg') {
    const raw = input.svgText?.trim() ?? ''
    if (!raw) throw new Error('Paste SVG code')
    const markup = prepareSvgMarkup(raw, {
      foreground: input.foreground,
      size: 512,
    })
    return svgMarkupToImage(markup)
  }

  if (!input.file) throw new Error('Upload an image')
  if (
    input.file.type.includes('svg') ||
    input.file.name.toLowerCase().endsWith('.svg')
  ) {
    const markup = prepareSvgMarkup(await input.file.text(), {
      foreground: input.foreground,
      size: 512,
    })
    return svgMarkupToImage(markup)
  }
  return loadImageFromFile(input.file)
}

export function buildWebManifest(
  fields: AppManifestFields,
  icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>,
): string {
  return `${JSON.stringify(
    {
      name: fields.name,
      short_name: fields.shortName,
      start_url: fields.startUrl || '/',
      display: fields.display,
      background_color: fields.backgroundColor,
      theme_color: fields.themeColor,
      icons,
    },
    null,
    2,
  )}\n`
}

export function appIconHtmlSnippet(themeColor: string): string {
  return [
    `<link rel="icon" href="/favicon.ico" sizes="any" />`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`,
    `<link rel="manifest" href="/site.webmanifest" />`,
    `<meta name="theme-color" content="${themeColor}" />`,
  ].join('\n')
}

export async function generateAppIconPack(
  source: CanvasImageSource,
  options: AppIconOptions,
  manifestFields: AppManifestFields,
): Promise<{
  assets: AppIconAsset[]
  ico: { blob: Blob; fileName: string }
  zip: Blob
  html: string
  manifest: string
}> {
  const assets: AppIconAsset[] = []

  for (const spec of APP_ICON_PNG_SIZES) {
    const canvas = renderAppIconCanvas(
      source,
      spec.size,
      optionsForIconSize(options, spec),
      spec.purpose === 'maskable',
    )
    const blob = await canvasToPngBlob(canvas)
    assets.push({
      size: spec.size,
      fileName: spec.fileName,
      label: spec.label,
      blob,
      url: URL.createObjectURL(blob),
    })
  }

  const icoFrames = await Promise.all(
    ICO_SIZES.map(async (size) => {
      const existing = assets.find(
        (asset) =>
          asset.size === size && asset.fileName.startsWith('favicon-'),
      )
      if (existing) return { size, png: existing.blob }
      const canvas = renderAppIconCanvas(source, size, options)
      return { size, png: await canvasToPngBlob(canvas) }
    }),
  )
  const icoBlob = await buildIcoFromPngBlobs(icoFrames)
  const html = appIconHtmlSnippet(manifestFields.themeColor)
  const manifest = buildWebManifest(manifestFields, [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512-maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ])

  const zip = await buildZip([
    { name: 'favicon.ico', data: icoBlob },
    ...assets.map((asset) => ({ name: asset.fileName, data: asset.blob })),
    {
      name: 'site.webmanifest',
      data: new Blob([manifest], { type: 'application/manifest+json' }),
    },
    {
      name: 'site-head.html',
      data: new Blob([`${html}\n`], { type: 'text/html' }),
    },
  ])

  return {
    assets,
    ico: { blob: icoBlob, fileName: 'favicon.ico' },
    zip,
    html,
    manifest,
  }
}

export function revokeAppIconUrls(assets: AppIconAsset[]) {
  for (const asset of assets) {
    URL.revokeObjectURL(asset.url)
  }
}

export function previewAppIconDataUrl(
  source: CanvasImageSource,
  options: AppIconOptions,
  size = 256,
  maskable = false,
): string {
  return renderAppIconCanvas(source, size, options, maskable).toDataURL(
    'image/png',
  )
}
