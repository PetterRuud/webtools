export type OutputFormat = 'png' | 'jpeg' | 'webp'

export const OUTPUT_FORMATS: {
  id: OutputFormat
  label: string
  mime: string
  extension: string
  lossy: boolean
}[] = [
  {
    id: 'png',
    label: 'PNG',
    mime: 'image/png',
    extension: 'png',
    lossy: false,
  },
  {
    id: 'jpeg',
    label: 'JPEG',
    mime: 'image/jpeg',
    extension: 'jpg',
    lossy: true,
  },
  {
    id: 'webp',
    label: 'WebP',
    mime: 'image/webp',
    extension: 'webp',
    lossy: true,
  },
]

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function outputFileName(sourceName: string, format: OutputFormat): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'converted'
  const extension =
    OUTPUT_FORMATS.find((item) => item.id === format)?.extension ?? format
  return `${base}.${extension}`
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

export async function convertImageFormat(
  file: File,
  format: OutputFormat,
  quality: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const meta = OUTPUT_FORMATS.find((item) => item.id === format)
  if (!meta) throw new Error('Unknown output format')

  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Image has no dimensions')
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable in this browser')

  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(image, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) => {
    if (meta.lossy) {
      canvas.toBlob(resolve, meta.mime, quality)
    } else {
      canvas.toBlob(resolve, meta.mime)
    }
  })

  if (!blob) {
    throw new Error(
      `This browser could not encode ${meta.label}. Try PNG or JPEG.`,
    )
  }

  return { blob, width: canvas.width, height: canvas.height }
}
