export type PadBackground = 'white' | 'black' | 'transparent'

export type SquareRoundOptions = {
  padToSquare: boolean
  /** Corner radius in source pixels (applied after padding). */
  radius: number
  background: PadBackground
}

export type SquareRoundResult = {
  blob: Blob
  width: number
  height: number
}

export const RADIUS_PRESETS = [0, 2, 4, 8, 16, 32, 64] as const

export function clampRadius(
  radius: number,
  width: number,
  height: number,
): number {
  if (!Number.isFinite(radius) || radius <= 0) return 0
  const max = Math.floor(Math.min(width, height) / 2)
  return Math.max(0, Math.min(max, Math.round(radius)))
}

function fillBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: PadBackground,
) {
  ctx.clearRect(0, 0, width, height)
  if (background === 'transparent') return
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
}

/** Rounded rect path using quadratic curves (matches common canvas corner clips). */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
) {
  const r = clampRadius(radius, width, height)
  ctx.beginPath()
  if (r <= 0) {
    ctx.rect(0, 0, width, height)
    ctx.closePath()
    return
  }
  ctx.moveTo(r, 0)
  ctx.lineTo(width - r, 0)
  ctx.quadraticCurveTo(width, 0, width, r)
  ctx.lineTo(width, height - r)
  ctx.quadraticCurveTo(width, height, width - r, height)
  ctx.lineTo(r, height)
  ctx.quadraticCurveTo(0, height, 0, height - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
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

function loadHtmlImage(file: File): Promise<HTMLImageElement> {
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

async function loadDrawable(file: File): Promise<{
  source: CanvasImageSource
  width: number
  height: number
  close?: () => void
}> {
  try {
    const bitmap = await createImageBitmap(file)
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    }
  } catch {
    // SVG and some formats fail createImageBitmap; HTMLImageElement is fine.
    const image = await loadHtmlImage(file)
    return {
      source: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    }
  }
}

export async function readSourceDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const drawable = await loadDrawable(file)
  try {
    return { width: drawable.width, height: drawable.height }
  } finally {
    drawable.close?.()
  }
}

/**
 * Pad an image to a square (optional) and clip rounded corners. Always PNG.
 */
export async function renderSquareRound(
  file: File,
  options: SquareRoundOptions,
): Promise<SquareRoundResult> {
  const drawable = await loadDrawable(file)
  try {
    const srcW = drawable.width
    const srcH = drawable.height
    if (srcW < 1 || srcH < 1) {
      throw new Error('Image has no dimensions')
    }

    const size = Math.max(srcW, srcH)
    const width = options.padToSquare ? size : srcW
    const height = options.padToSquare ? size : srcH
    const offsetX = options.padToSquare ? Math.round((width - srcW) / 2) : 0
    const offsetY = options.padToSquare ? Math.round((height - srcH) / 2) : 0
    const radius = clampRadius(options.radius, width, height)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable in this browser')

    fillBackground(ctx, width, height, options.background)

    ctx.save()
    if (radius > 0) {
      roundedRectPath(ctx, width, height, radius)
      ctx.clip()
    }
    ctx.drawImage(drawable.source, offsetX, offsetY)
    ctx.restore()

    const blob = await canvasToPngBlob(canvas)
    return { blob, width, height }
  } finally {
    drawable.close?.()
  }
}

export function outputFileName(
  sourceName: string,
  options: Pick<SquareRoundOptions, 'padToSquare' | 'radius'>,
): string {
  const base = (sourceName || 'image').replace(/\.[^.]+$/, '') || 'image'
  const parts: string[] = []
  if (options.padToSquare) parts.push('square')
  if (options.radius > 0) parts.push(`r${Math.round(options.radius)}`)
  const suffix = parts.length > 0 ? `-${parts.join('-')}` : '-processed'
  return `${base}${suffix}.png`
}
