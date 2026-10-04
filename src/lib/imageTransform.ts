export type CropAspectId = 'none' | 'free' | '1:1' | '4:3' | '3:2' | '16:9' | '9:16'

export const CROP_ASPECT_OPTIONS: {
  id: CropAspectId
  label: string
  ratio: number | null
}[] = [
  { id: 'none', label: 'None', ratio: null },
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
  { id: '3:2', label: '3:2', ratio: 3 / 2 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
  { id: '9:16', label: '9:16', ratio: 9 / 16 },
]

export type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

const MIN_CROP = 16

export function fullFrameRect(imageWidth: number, imageHeight: number): CropRect {
  return { x: 0, y: 0, width: imageWidth, height: imageHeight }
}

export function isFullFrame(
  rect: CropRect,
  imageWidth: number,
  imageHeight: number,
): boolean {
  return (
    rect.x === 0 &&
    rect.y === 0 &&
    rect.width === imageWidth &&
    rect.height === imageHeight
  )
}

/** Centered crop covering most of the image, optionally locked to an aspect. */
export function initialCropRect(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number | null,
): CropRect {
  if (aspectRatio === null) {
    const insetX = Math.round(imageWidth * 0.08)
    const insetY = Math.round(imageHeight * 0.08)
    return clampCropRect(
      {
        x: insetX,
        y: insetY,
        width: imageWidth - insetX * 2,
        height: imageHeight - insetY * 2,
      },
      imageWidth,
      imageHeight,
    )
  }

  return fitAspectCrop(imageWidth, imageHeight, aspectRatio, 0.84)
}

/** Largest centered crop of the given aspect, optionally scaled by coverage (0–1). */
export function fitAspectCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
  coverage = 1,
): CropRect {
  const imageAspect = imageWidth / imageHeight
  let width: number
  let height: number

  if (imageAspect > aspectRatio) {
    height = Math.max(MIN_CROP, Math.round(imageHeight * coverage))
    width = Math.max(MIN_CROP, Math.round(height * aspectRatio))
    if (width > imageWidth) {
      width = imageWidth
      height = Math.max(MIN_CROP, Math.round(width / aspectRatio))
    }
  } else {
    width = Math.max(MIN_CROP, Math.round(imageWidth * coverage))
    height = Math.max(MIN_CROP, Math.round(width / aspectRatio))
    if (height > imageHeight) {
      height = imageHeight
      width = Math.max(MIN_CROP, Math.round(height * aspectRatio))
    }
  }

  return {
    x: Math.round((imageWidth - width) / 2),
    y: Math.round((imageHeight - height) / 2),
    width,
    height,
  }
}

export function clampCropRect(
  rect: CropRect,
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number | null = null,
): CropRect {
  let width = Math.max(MIN_CROP, Math.round(rect.width))
  let height = Math.max(MIN_CROP, Math.round(rect.height))

  if (aspectRatio && aspectRatio > 0) {
    // Prefer width; recompute height from aspect, then fit in bounds.
    height = Math.max(MIN_CROP, Math.round(width / aspectRatio))
    if (height > imageHeight) {
      height = imageHeight
      width = Math.max(MIN_CROP, Math.round(height * aspectRatio))
    }
    if (width > imageWidth) {
      width = imageWidth
      height = Math.max(MIN_CROP, Math.round(width / aspectRatio))
    }
  } else {
    width = Math.min(width, imageWidth)
    height = Math.min(height, imageHeight)
  }

  const x = Math.min(Math.max(0, Math.round(rect.x)), Math.max(0, imageWidth - width))
  const y = Math.min(Math.max(0, Math.round(rect.y)), Math.max(0, imageHeight - height))

  return {
    x,
    y,
    width: Math.min(width, imageWidth - x),
    height: Math.min(height, imageHeight - y),
  }
}

export type PrepareImageOptions = {
  scalePercent: number
  cropEnabled: boolean
  cropRect: CropRect | null
}

export type PreparedImage = {
  file: File
  width: number
  height: number
  transformed: boolean
}

/**
 * Crop (optional) then scale (optional). Identity when crop is off/full-frame
 * and scale is 100%.
 */
export async function prepareImageForCompress(
  file: File,
  options: PrepareImageOptions,
): Promise<PreparedImage> {
  const scale =
    Math.max(1, Math.min(100, Math.round(options.scalePercent))) / 100
  const dims = await readImageDimensions(file)
  const crop =
    options.cropEnabled && options.cropRect
      ? clampCropRect(options.cropRect, dims.width, dims.height)
      : fullFrameRect(dims.width, dims.height)
  const cropped = !isFullFrame(crop, dims.width, dims.height)
  const needsScale = scale !== 1

  if (!cropped && !needsScale) {
    return {
      file,
      width: dims.width,
      height: dims.height,
      transformed: false,
    }
  }

  const bitmap = await createImageBitmap(file)
  try {
    const outWidth = Math.max(1, Math.round(crop.width * scale))
    const outHeight = Math.max(1, Math.round(crop.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = outWidth
    canvas.height = outHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable in this browser')

    ctx.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      outWidth,
      outHeight,
    )

    const mime =
      file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg'
    const blob = await canvasToBlob(canvas, mime)
    const next = new File([blob], file.name, {
      type: blob.type || mime,
      lastModified: Date.now(),
    })
    return {
      file: next,
      width: outWidth,
      height: outHeight,
      transformed: true,
    }
  } finally {
    bitmap.close()
  }
}

export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const dims = { width: bitmap.width, height: bitmap.height }
  bitmap.close()
  return dims
}

const MIN_RESIZE = 1
const MAX_RESIZE = 16384

export function clampResizeDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_RESIZE
  return Math.max(MIN_RESIZE, Math.min(MAX_RESIZE, Math.round(value)))
}

/** Resize to exact pixel dimensions (stretch). Identity when unchanged. */
export async function resizeImage(
  file: File,
  width: number,
  height: number,
): Promise<PreparedImage> {
  const outWidth = clampResizeDimension(width)
  const outHeight = clampResizeDimension(height)
  const dims = await readImageDimensions(file)

  if (dims.width === outWidth && dims.height === outHeight) {
    return {
      file,
      width: dims.width,
      height: dims.height,
      transformed: false,
    }
  }

  const bitmap = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = outWidth
    canvas.height = outHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable in this browser')

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, outWidth, outHeight)

    const mime =
      file.type && file.type.startsWith('image/') ? file.type : 'image/png'
    const blob = await canvasToBlob(canvas, mime)
    const next = new File([blob], file.name, {
      type: blob.type || mime,
      lastModified: Date.now(),
    })
    return {
      file: next,
      width: outWidth,
      height: outHeight,
      transformed: true,
    }
  } finally {
    bitmap.close()
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not encode image'))
          return
        }
        resolve(blob)
      },
      mime,
      0.97,
    )
  })
}
