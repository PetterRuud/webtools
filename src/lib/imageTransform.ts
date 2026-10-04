export type CropAspectId = 'none' | '1:1' | '4:3' | '3:2' | '16:9' | '9:16'

export const CROP_ASPECT_OPTIONS: { id: CropAspectId; label: string; ratio: number | null }[] =
  [
    { id: 'none', label: 'None', ratio: null },
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

/** focusX/focusY are 0–1 and place the crop window within the image. */
export function getCropRect(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
  focusX = 0.5,
  focusY = 0.5,
): CropRect {
  const imageAspect = imageWidth / imageHeight
  let width: number
  let height: number

  if (imageAspect > aspectRatio) {
    height = imageHeight
    width = Math.max(1, Math.round(imageHeight * aspectRatio))
  } else {
    width = imageWidth
    height = Math.max(1, Math.round(imageWidth / aspectRatio))
  }

  const maxX = Math.max(0, imageWidth - width)
  const maxY = Math.max(0, imageHeight - height)
  const x = Math.round(maxX * clamp01(focusX))
  const y = Math.round(maxY * clamp01(focusY))

  return { x, y, width, height }
}

export type PrepareImageOptions = {
  scalePercent: number
  cropAspect: CropAspectId
  focusX: number
  focusY: number
}

export type PreparedImage = {
  file: File
  width: number
  height: number
  transformed: boolean
}

/**
 * Optionally crop (aspect + focus) then scale. When both are identity
 * (no crop, 100% scale), returns the original file untouched.
 */
export async function prepareImageForCompress(
  file: File,
  options: PrepareImageOptions,
): Promise<PreparedImage> {
  const scale = Math.max(1, Math.min(100, Math.round(options.scalePercent))) / 100
  const aspect = CROP_ASPECT_OPTIONS.find((o) => o.id === options.cropAspect)?.ratio ?? null
  const needsCrop = aspect !== null
  const needsScale = scale !== 1

  if (!needsCrop && !needsScale) {
    const dims = await readImageDimensions(file)
    return { file, width: dims.width, height: dims.height, transformed: false }
  }

  const bitmap = await createImageBitmap(file)
  try {
    const crop = needsCrop
      ? getCropRect(bitmap.width, bitmap.height, aspect, options.focusX, options.focusY)
      : {
          x: 0,
          y: 0,
          width: bitmap.width,
          height: bitmap.height,
        }

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

    const mime = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg'
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

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not encode cropped image'))
          return
        }
        resolve(blob)
      },
      mime,
      0.97,
    )
  })
}
