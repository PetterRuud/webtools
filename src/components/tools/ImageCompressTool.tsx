import { useEffect, useMemo, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function extensionForMime(mime: string, fallbackName: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  const fromName = fallbackName.match(/\.([^.]+)$/)?.[1]
  return fromName || 'jpg'
}

export function ImageCompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceDims, setSourceDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [quality, setQuality] = useState(0.75)
  const [scalePercent, setScalePercent] = useState(100)
  const [cropAspect, setCropAspect] = useState<CropAspectId>('none')
  const [cropRect, setCropRect] = useState<CropRect | null>(null)
  const [output, setOutput] = useState<File | null>(null)
  const [outputDims, setOutputDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cropEnabled = cropAspect !== 'none'
  const aspectRatio =
    CROP_ASPECT_OPTIONS.find((option) => option.id === cropAspect)?.ratio ??
    null

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
        setCropRect(fullFrameRect(dims.width, dims.height))
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

  const savings = useMemo(() => {
    if (!file || !output || file.size === 0) return null
    return Math.max(0, Math.round((1 - output.size / file.size) * 100))
  }, [file, output])

  const activeCrop = useMemo(() => {
    if (!sourceDims) return null
    if (!cropEnabled || !cropRect) {
      return fullFrameRect(sourceDims.width, sourceDims.height)
    }
    return cropRect
  }, [sourceDims, cropEnabled, cropRect])

  const plannedDims = useMemo(() => {
    if (!activeCrop) return null
    const scale = scalePercent / 100
    return {
      width: Math.max(1, Math.round(activeCrop.width * scale)),
      height: Math.max(1, Math.round(activeCrop.height * scale)),
    }
  }, [activeCrop, scalePercent])

  function selectCropAspect(next: CropAspectId) {
    setCropAspect(next)
    if (!sourceDims) return
    if (next === 'none') {
      setCropRect(fullFrameRect(sourceDims.width, sourceDims.height))
      return
    }
    const ratio =
      CROP_ASPECT_OPTIONS.find((option) => option.id === next)?.ratio ?? null
    setCropRect(initialCropRect(sourceDims.width, sourceDims.height, ratio))
  }

  function resetGeometry() {
    setScalePercent(100)
    setCropAspect('none')
    if (sourceDims) {
      setCropRect(fullFrameRect(sourceDims.width, sourceDims.height))
    }
  }

  async function compress(nextFile = file) {
    if (!nextFile) {
      setError('Choose an image first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const prepared = await prepareImageForCompress(nextFile, {
        scalePercent,
        cropEnabled,
        cropRect: activeCrop,
      })
      const result = await imageCompression(prepared.file, {
        maxSizeMB: 8,
        initialQuality: quality,
        useWebWorker: true,
        alwaysKeepResolution: true,
        fileType: prepared.file.type || nextFile.type || 'image/jpeg',
      })
      const resultDims = await readImageDimensions(result).catch(() => ({
        width: prepared.width,
        height: prepared.height,
      }))
      setOutput(result)
      setOutputDims(resultDims)
      toast.success('Compressed — ready to download')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not compress that image'
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
    const ext = extensionForMime(output.type, file?.name || 'image.jpg')
    anchor.href = url
    anchor.download = `${base}-compressed.${ext}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Label htmlFor="image">Image</Label>
        <input
          id="image"
          type="file"
          accept="image/*"
          className="block w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
          onChange={(e) => {
            const next = e.target.files?.[0] ?? null
            setFile(next)
            setOutput(null)
            setOutputDims(null)
            setError(null)
            setScalePercent(100)
            setCropAspect('none')
            setCropRect(null)
          }}
        />
        <p className="m-0 text-sm text-muted-foreground">
          Processing stays in your browser. No upload to Workers. Default keeps
          the original resolution and full frame.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label>1. Crop</Label>
          <span className="text-sm text-muted-foreground">
            {cropAspect === 'none' ? 'Off · full frame' : cropAspect}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CROP_ASPECT_OPTIONS.map((option) => (
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
        {!cropEnabled ? (
          <p className="m-0 text-xs text-muted-foreground">
            Optional. Pick Free or an aspect to enable the visual cropper with
            drag handles.
          </p>
        ) : (
          <p className="m-0 text-xs text-muted-foreground">
            Drag inside the frame to move. Pull corner and edge handles to
            resize.
          </p>
        )}
      </div>

      {sourceUrl && sourceDims && activeCrop ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm font-medium">
              {cropEnabled ? 'Crop region' : 'Source'}
            </p>
            <p className="m-0 text-sm tabular-nums text-muted-foreground">
              {sourceDims.width}×{sourceDims.height}
              {plannedDims
                ? ` → ${plannedDims.width}×${plannedDims.height}`
                : ''}
            </p>
          </div>
          <ImageCropper
            src={sourceUrl}
            imageWidth={sourceDims.width}
            imageHeight={sourceDims.height}
            crop={activeCrop}
            aspectRatio={aspectRatio}
            enabled={cropEnabled}
            onChange={setCropRect}
          />
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="scale">2. Scale</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {scalePercent}%
            </span>
          </div>
          <Slider
            id="scale"
            min={10}
            max={100}
            step={1}
            value={[scalePercent]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') setScalePercent(Math.round(next))
            }}
          />
          <p className="m-0 text-xs text-muted-foreground">
            Optional. 100% keeps cropped pixel size.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality">3. Quality</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <Slider
            id="quality"
            min={0.2}
            max={1}
            step={0.01}
            value={[quality]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') setQuality(next)
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!file || busy}
          onClick={() => void compress()}
        >
          {busy ? 'Compressing…' : 'Compress'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!output}
          onClick={download}
        >
          Download
        </Button>
        {file && (scalePercent !== 100 || cropEnabled) ? (
          <Button type="button" variant="ghost" onClick={resetGeometry}>
            Reset scale & crop
          </Button>
        ) : null}
      </div>

      {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}

      {!file && !error ? (
        <p className="m-0 rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
          Drop in a PNG or JPEG when you are ready.
        </p>
      ) : null}

      {file ? (
        <dl className="m-0 grid gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <dt className="text-muted-foreground">Original</dt>
            <dd className="m-0 mt-1 font-medium">{formatBytes(file.size)}</dd>
            {sourceDims ? (
              <dd className="m-0 mt-1 text-xs tabular-nums text-muted-foreground">
                {sourceDims.width}×{sourceDims.height}
              </dd>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <dt className="text-muted-foreground">Compressed</dt>
            <dd className="m-0 mt-1 font-medium">
              {output ? formatBytes(output.size) : '—'}
            </dd>
            {outputDims ? (
              <dd className="m-0 mt-1 text-xs tabular-nums text-muted-foreground">
                {outputDims.width}×{outputDims.height}
              </dd>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <dt className="text-muted-foreground">Saved</dt>
            <dd className="m-0 mt-1 font-medium">
              {savings === null ? '—' : `${savings}%`}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <dt className="text-muted-foreground">Output size</dt>
            <dd className="m-0 mt-1 font-medium tabular-nums">
              {plannedDims
                ? `${plannedDims.width}×${plannedDims.height}`
                : '—'}
            </dd>
          </div>
        </dl>
      ) : null}

      {previewUrl ? (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium">Result</p>
          <img
            src={previewUrl}
            alt="Compressed preview"
            className="max-h-80 w-full rounded-2xl border border-border bg-muted object-contain"
          />
        </div>
      ) : null}
    </div>
  )
}
