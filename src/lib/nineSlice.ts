export type SliceMargins = {
  left: number
  right: number
  top: number
  bottom: number
}

export type CenterMode = 'stretch' | 'repeat' | 'round'

export type SliceRegionId =
  | 'tl'
  | 't'
  | 'tr'
  | 'l'
  | 'c'
  | 'r'
  | 'bl'
  | 'b'
  | 'br'

export type SliceRegion = {
  id: SliceRegionId
  label: string
  x: number
  y: number
  width: number
  height: number
}

const MIN_CENTER = 1

export function defaultSliceMargins(
  imageWidth: number,
  imageHeight: number,
): SliceMargins {
  return clampSliceMargins(
    {
      left: Math.max(1, Math.round(imageWidth * 0.25)),
      right: Math.max(1, Math.round(imageWidth * 0.25)),
      top: Math.max(1, Math.round(imageHeight * 0.25)),
      bottom: Math.max(1, Math.round(imageHeight * 0.25)),
    },
    imageWidth,
    imageHeight,
  )
}

export function clampSliceMargins(
  margins: SliceMargins,
  imageWidth: number,
  imageHeight: number,
): SliceMargins {
  const maxLeft = Math.max(0, imageWidth - MIN_CENTER)
  const left = clampInt(margins.left, 0, maxLeft)
  const maxRight = Math.max(0, imageWidth - left - MIN_CENTER)
  const right = clampInt(margins.right, 0, maxRight)

  const maxTop = Math.max(0, imageHeight - MIN_CENTER)
  const top = clampInt(margins.top, 0, maxTop)
  const maxBottom = Math.max(0, imageHeight - top - MIN_CENTER)
  const bottom = clampInt(margins.bottom, 0, maxBottom)

  return { left, right, top, bottom }
}

export function sliceRegions(
  imageWidth: number,
  imageHeight: number,
  margins: SliceMargins,
): SliceRegion[] {
  const m = clampSliceMargins(margins, imageWidth, imageHeight)
  const centerW = imageWidth - m.left - m.right
  const centerH = imageHeight - m.top - m.bottom

  return [
    { id: 'tl', label: 'Top-left', x: 0, y: 0, width: m.left, height: m.top },
    {
      id: 't',
      label: 'Top',
      x: m.left,
      y: 0,
      width: centerW,
      height: m.top,
    },
    {
      id: 'tr',
      label: 'Top-right',
      x: m.left + centerW,
      y: 0,
      width: m.right,
      height: m.top,
    },
    {
      id: 'l',
      label: 'Left',
      x: 0,
      y: m.top,
      width: m.left,
      height: centerH,
    },
    {
      id: 'c',
      label: 'Center',
      x: m.left,
      y: m.top,
      width: centerW,
      height: centerH,
    },
    {
      id: 'r',
      label: 'Right',
      x: m.left + centerW,
      y: m.top,
      width: m.right,
      height: centerH,
    },
    {
      id: 'bl',
      label: 'Bottom-left',
      x: 0,
      y: m.top + centerH,
      width: m.left,
      height: m.bottom,
    },
    {
      id: 'b',
      label: 'Bottom',
      x: m.left,
      y: m.top + centerH,
      width: centerW,
      height: m.bottom,
    },
    {
      id: 'br',
      label: 'Bottom-right',
      x: m.left + centerW,
      y: m.top + centerH,
      width: m.right,
      height: m.bottom,
    },
  ]
}

export function formatBorderImageCss(options: {
  fileName: string
  margins: SliceMargins
  centerMode: CenterMode
  borderScale?: number
}): string {
  const { fileName, margins, centerMode } = options
  const scale = options.borderScale ?? 1
  const top = Math.max(0, Math.round(margins.top * scale))
  const right = Math.max(0, Math.round(margins.right * scale))
  const bottom = Math.max(0, Math.round(margins.bottom * scale))
  const left = Math.max(0, Math.round(margins.left * scale))

  const slice = `${margins.top} ${margins.right} ${margins.bottom} ${margins.left} fill`
  const width = `${top}px ${right}px ${bottom}px ${left}px`
  const repeat =
    centerMode === 'stretch'
      ? 'stretch'
      : centerMode === 'round'
        ? 'round'
        : 'repeat'

  return [
    `.nine-slice {`,
    `  border-style: solid;`,
    `  border-width: ${width};`,
    `  border-image: url("${fileName}") ${slice} / ${width} / 0 ${repeat};`,
    `  padding: ${width};`,
    `}`,
  ].join('\n')
}

/** Sensible guides for the shipped sample panel (20px frame). */
export const SAMPLE_SLICE_MARGINS: SliceMargins = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 20,
}

export const SAMPLE_PANEL_FILE_NAME = 'nine-slice-panel.png'

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    return await loadImage(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

export async function exportSlicePngs(
  image: HTMLImageElement,
  margins: SliceMargins,
): Promise<Array<{ id: SliceRegionId; fileName: string; blob: Blob }>> {
  const regions = sliceRegions(image.naturalWidth, image.naturalHeight, margins)
  const outputs: Array<{ id: SliceRegionId; fileName: string; blob: Blob }> = []

  for (const region of regions) {
    if (region.width <= 0 || region.height <= 0) continue
    const canvas = document.createElement('canvas')
    canvas.width = region.width
    canvas.height = region.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    ctx.drawImage(
      image,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height,
    )
    const blob = await canvasToBlob(canvas, 'image/png')
    outputs.push({
      id: region.id,
      fileName: `slice-${region.id}.png`,
      blob,
    })
  }

  return outputs
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not export PNG'))
        return
      }
      resolve(blob)
    }, type)
  })
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}
