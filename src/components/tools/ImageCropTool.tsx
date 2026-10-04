import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CropIcon, DownloadIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { ImageCropper } from '#/components/tools/ImageCropper'
import {
  CROP_ASPECT_OPTIONS,
  fullFrameRect,
  initialCropRect,
  prepareImageForCompress,
  readImageDimensions,
  type CropAspectId,
  type CropRect,
} from '#/lib/imageTransform'

type CropPresetId = Exclude<CropAspectId, 'none'>

const ASPECT_PRESETS = CROP_ASPECT_OPTIONS.filter(
  (option): option is (typeof CROP_ASPECT_OPTIONS)[number] & {
    id: CropPresetId
  } => option.id !== 'none',
)

function extensionForMime(mime: string, fallbackName: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  const fromName = fallbackName.match(/\.([^.]+)$/)?.[1]
  return fromName || 'png'
}

export function ImageCropTool() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceDims, setSourceDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [cropAspect, setCropAspect] = useState<CropPresetId>('free')
  const [cropRect, setCropRect] = useState<CropRect | null>(null)
  const [output, setOutput] = useState<File | null>(null)
  const [outputDims, setOutputDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const aspectRatio =
    ASPECT_PRESETS.find((option) => option.id === cropAspect)?.ratio ?? null

  useEffect(() => {
    if (!file) {
      setSourceUrl(null)
      setSourceDims(null)
      return
    }
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    let cancelled = false
    void readImageDimensions(file)
      .then((dims) => {
        if (cancelled) return
        setSourceDims(dims)
        setCropRect(initialCropRect(dims.width, dims.height, null))
      })
      .catch((err) => {
        if (cancelled) return
        setSourceDims(null)
        setCropRect(null)
        setError(
          err instanceof Error ? err.message : 'Could not read that image',
        )
      })
    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [file])

  useEffect(() => {
    if (!output) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(output)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [output])

  const activeCrop = useMemo(() => {
    if (!sourceDims) return null
    return cropRect ?? fullFrameRect(sourceDims.width, sourceDims.height)
  }, [sourceDims, cropRect])

  function selectCropAspect(next: CropPresetId) {
    setCropAspect(next)
    setOutput(null)
    setOutputDims(null)
    if (!sourceDims) return
    const ratio =
      ASPECT_PRESETS.find((option) => option.id === next)?.ratio ?? null
    setCropRect(initialCropRect(sourceDims.width, sourceDims.height, ratio))
  }

  function resetCrop() {
    if (!sourceDims) return
    setCropAspect('free')
    setCropRect(initialCropRect(sourceDims.width, sourceDims.height, null))
    setOutput(null)
    setOutputDims(null)
  }

  async function exportCrop() {
    if (!file || !activeCrop) {
      setError('Choose an image first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const prepared = await prepareImageForCompress(file, {
        scalePercent: 100,
        cropEnabled: true,
        cropRect: activeCrop,
      })
      setOutput(prepared.file)
      setOutputDims({ width: prepared.width, height: prepared.height })
      toast.success('Cropped')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not crop that image'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  function download() {
    if (!output) return
    const url = URL.createObjectURL(output)
    const anchor = document.createElement('a')
    const base = (file?.name || 'image').replace(/\.[^.]+$/, '')
    const ext = extensionForMime(output.type, file?.name || 'image.png')
    anchor.href = url
    anchor.download = `${base}-cropped.${ext}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="crop-image">Image</Label>
          <input
            id="crop-image"
            type="file"
            accept="image/*"
            className="block w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null
              setFile(next)
              setOutput(null)
              setOutputDims(null)
              setError(null)
              setCropAspect('free')
              setCropRect(null)
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Aspect</Label>
            <span className="text-xs text-muted-foreground">{cropAspect}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ASPECT_PRESETS.map((option) => (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={cropAspect === option.id ? 'default' : 'outline'}
                onClick={() => selectCropAspect(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {sourceUrl && sourceDims && activeCrop ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-sm font-medium">Crop region</p>
              <p className="m-0 text-xs tabular-nums text-muted-foreground">
                {sourceDims.width}×{sourceDims.height}
                {` → ${Math.round(activeCrop.width)}×${Math.round(activeCrop.height)}`}
              </p>
            </div>
            <ImageCropper
              src={sourceUrl}
              imageWidth={sourceDims.width}
              imageHeight={sourceDims.height}
              crop={activeCrop}
              aspectRatio={aspectRatio}
              enabled
              onChange={(next) => {
                setCropRect(next)
                setOutput(null)
                setOutputDims(null)
              }}
            />
          </div>
        ) : !file ? (
          <p className="m-0 rounded-lg border border-dashed border-border bg-card/50 px-3 py-8 text-center text-sm text-muted-foreground">
            Choose a PNG or JPEG
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="skeuo-plastic"
            disabled={!file || busy || !activeCrop}
            onClick={() => void exportCrop()}
          >
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <CropIcon data-icon="inline-start" />
            )}
            {busy ? 'Cropping…' : 'Crop'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!output}
            onClick={download}
          >
            <DownloadIcon data-icon="inline-start" />
            Download
          </Button>
          {file ? (
            <Button type="button" variant="ghost" onClick={resetCrop}>
              Reset
            </Button>
          ) : null}
        </div>

        {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}

        {file && activeCrop ? (
          <dl className="m-0 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Source</dt>
              <dd className="m-0 mt-0.5 font-medium tabular-nums">
                {sourceDims
                  ? `${sourceDims.width}×${sourceDims.height}`
                  : '—'}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Crop</dt>
              <dd className="m-0 mt-0.5 font-medium tabular-nums">
                {Math.round(activeCrop.width)}×{Math.round(activeCrop.height)}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2 sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Origin</dt>
              <dd className="m-0 mt-0.5 font-medium tabular-nums">
                {Math.round(activeCrop.x)}, {Math.round(activeCrop.y)}
              </dd>
            </div>
          </dl>
        ) : null}

        {previewUrl && outputDims ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="m-0 text-sm font-medium">Result</p>
              <p className="m-0 text-xs tabular-nums text-muted-foreground">
                {outputDims.width}×{outputDims.height}
              </p>
            </div>
            <div className="skeuo-film overflow-hidden rounded-xl border border-border/80 p-3">
              <img
                src={previewUrl}
                alt="Cropped preview"
                className="max-h-72 w-full rounded-md bg-muted object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-3 py-8 text-sm text-muted-foreground lg:min-h-48">
            Cropped preview
          </div>
        )}

        <p className="m-0 text-xs text-muted-foreground">
          Related:{' '}
          <Link
            to="/tools/image-resize"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Resize
          </Link>
          {' · '}
          <Link
            to="/tools/image-compress"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Compress
          </Link>
          {' · '}
          <Link
            to="/tools/nine-slice"
            className="text-foreground underline-offset-4 hover:underline"
          >
            9-slicer
          </Link>
        </p>
      </div>
    </div>
  )
}
