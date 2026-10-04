export type FaviconSize = {
  size: number
  fileName: string
  label: string
}

export type FaviconOptions = {
  background: string | null
  radiusPercent: number
  paddingPercent: number
}

export type FaviconAsset = {
  size: number
  fileName: string
  label: string
  blob: Blob
  url: string
}

export const FAVICON_PNG_SIZES: FaviconSize[] = [
  { size: 16, fileName: 'favicon-16x16.png', label: '16×16' },
  { size: 32, fileName: 'favicon-32x32.png', label: '32×32' },
  { size: 48, fileName: 'favicon-48x48.png', label: '48×48' },
  { size: 64, fileName: 'favicon-64x64.png', label: '64×64' },
  { size: 180, fileName: 'apple-touch-icon.png', label: '180×180' },
  { size: 192, fileName: 'android-chrome-192x192.png', label: '192×192' },
  { size: 512, fileName: 'android-chrome-512x512.png', label: '512×512' },
]

const ICO_SIZES = [16, 32, 48] as const

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(50, Math.max(0, value))
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}


function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not decode that image'))
    }
    image.src = url
  })
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

export function renderFaviconCanvas(
  image: HTMLImageElement,
  size: number,
  options: FaviconOptions,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable in this browser')

  const radiusPercent = clampPercent(options.radiusPercent)
  const paddingPercent = clampPercent(options.paddingPercent)
  const radius = (radiusPercent / 100) * size
  const padding = (paddingPercent / 100) * size
  const drawSize = Math.max(1, size - padding * 2)

  ctx.clearRect(0, 0, size, size)

  if (options.background) {
    ctx.fillStyle = options.background
    if (radius > 0) {
      roundedRectPath(ctx, 0, 0, size, size, radius)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, size, size)
    }
  }

  ctx.save()
  if (radius > 0) {
    roundedRectPath(ctx, 0, 0, size, size, radius)
    ctx.clip()
  }

  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Image has no dimensions')
  }

  const scale = Math.min(drawSize / sourceWidth, drawSize / sourceHeight)
  const width = sourceWidth * scale
  const height = sourceHeight * scale
  const x = padding + (drawSize - width) / 2
  const y = padding + (drawSize - height) / 2
  ctx.drawImage(image, x, y, width, height)
  ctx.restore()

  return canvas
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
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

  const total = offset
  const out = new Uint8Array(total)
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

export function faviconHtmlSnippet(): string {
  return [
    `<link rel="icon" href="/favicon.ico" sizes="any" />`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`,
    `<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />`,
    `<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />`,
  ].join('\n')
}

export async function generateFaviconPack(
  file: File,
  options: FaviconOptions,
): Promise<{
  assets: FaviconAsset[]
  ico: { blob: Blob; fileName: string }
  zip: Blob
  html: string
}> {
  const image = await loadImage(file)
  const assets: FaviconAsset[] = []

  for (const spec of FAVICON_PNG_SIZES) {
    const canvas = renderFaviconCanvas(image, spec.size, options)
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
      const existing = assets.find((asset) => asset.size === size)
      if (existing) return { size, png: existing.blob }
      const canvas = renderFaviconCanvas(image, size, options)
      return { size, png: await canvasToPngBlob(canvas) }
    }),
  )
  const icoBlob = await buildIcoFromPngBlobs(icoFrames)
  const html = faviconHtmlSnippet()

  const zip = await buildZip([
    { name: 'favicon.ico', data: icoBlob },
    ...assets.map((asset) => ({ name: asset.fileName, data: asset.blob })),
    {
      name: 'site-head.html',
      data: new Blob([html + '\n'], { type: 'text/html' }),
    },
  ])

  return {
    assets,
    ico: { blob: icoBlob, fileName: 'favicon.ico' },
    zip,
    html,
  }
}

export function revokeFaviconUrls(assets: FaviconAsset[]) {
  for (const asset of assets) {
    URL.revokeObjectURL(asset.url)
  }
}
