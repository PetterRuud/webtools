import { useEffect, useMemo, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import {
  CROP_ASPECT_OPTIONS,
  getCropRect,
  prepareImageForCompress,
  readImageDimensions,
  type CropAspectId,
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
  const [focusX, setFocusX] = useState(0.5)
  const [focusY, setFocusY] = useState(0.5)
  const [output, setOutput] = useState<File | null>(null)
  const [outputDims, setOutputDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        if (!cancelled) setSourceDims(dims)
      })
      .catch(() => {
        if (!cancelled) setSourceDims(null)
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
    const pct = Math.max(0, Math.round((1 - output.size / file.size) * 100))
    return pct
  }, [file, output])

  const cropPreview = useMemo(() => {
    if (!sourceDims || cropAspect === 'none') return null
    const ratio =
      CROP_ASPECT_OPTIONS.find((option) => option.id === cropAspect)?.ratio ??
      null
    if (ratio === null) return null
    return getCropRect(
      sourceDims.width,
      sourceDims.height,
      ratio,
      focusX,
      focusY,
    )
  }, [sourceDims, cropAspect, focusX, focusY])

  const plannedDims = useMemo(() => {
    if (!sourceDims) return null
    const base = cropPreview ?? {
      width: sourceDims.width,
      height: sourceDims.height,
    }
    const scale = scalePercent / 100
    return {
      width: Math.max(1, Math.round(base.width * scale)),
      height: Math.max(1, Math.round(base.height * scale)),
    }
  }, [sourceDims, cropPreview, scalePercent])

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
        cropAspect,
        focusX,
        focusY,
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

  function resetGeometry() {
    setScalePercent(100)
    setCropAspect('none')
    setFocusX(0.5)
    setFocusY(0.5)
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
            resetGeometry()
          }}
        />
        <p className="m-0 text-sm text-muted-foreground">
          Processing stays in your browser. No upload to Workers. Default keeps
          the original resolution.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality">Quality</Label>
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="scale">Scale</Label>
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
            100% keeps pixel dimensions. Lower values resize before encode.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Crop</Label>
          <span className="text-sm text-muted-foreground">
            {cropAspect === 'none' ? 'Off' : cropAspect}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CROP_ASPECT_OPTIONS.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={cropAspect === option.id ? 'default' : 'outline'}
              onClick={() => {
                setCropAspect(option.id)
                if (option.id === 'none') {
                  setFocusX(0.5)
                  setFocusY(0.5)
                }
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {cropAspect !== 'none' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="focus-x">Horizontal focus</Label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {Math.round(focusX * 100)}%
                </span>
              </div>
              <Slider
                id="focus-x"
                min={0}
                max={1}
                step={0.01}
                value={[focusX]}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value
                  if (typeof next === 'number') setFocusX(next)
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="focus-y">Vertical focus</Label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {Math.round(focusY * 100)}%
                </span>
              </div>
              <Slider
                id="focus-y"
                min={0}
                max={1}
                step={0.01}
                value={[focusY]}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value
                  if (typeof next === 'number') setFocusY(next)
                }}
              />
            </div>
          </div>
        ) : (
          <p className="m-0 text-xs text-muted-foreground">
            Optional center crop with aspect presets. Default leaves the full
            frame.
          </p>
        )}
      </div>

      {sourceUrl && sourceDims ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 text-sm font-medium">Source</p>
            <p className="m-0 text-sm tabular-nums text-muted-foreground">
              {sourceDims.width}×{sourceDims.height}
              {plannedDims
                ? ` → ${plannedDims.width}×${plannedDims.height}`
                : ''}
            </p>
          </div>
          <div className="flex justify-center rounded-2xl border border-border bg-[oklch(0.96_0.01_120)] p-2">
            <div className="relative inline-block max-w-full">
              <img
                src={sourceUrl}
                alt="Source preview"
                className="block max-h-80 w-auto max-w-full"
              />
              {cropPreview ? (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-black/45"
                    style={{
                      clipPath: `polygon(
                        0% 0%,
                        100% 0%,
                        100% 100%,
                        0% 100%,
                        0% 0%,
                        ${(cropPreview.x / sourceDims.width) * 100}% ${(cropPreview.y / sourceDims.height) * 100}%,
                        ${(cropPreview.x / sourceDims.width) * 100}% ${((cropPreview.y + cropPreview.height) / sourceDims.height) * 100}%,
                        ${((cropPreview.x + cropPreview.width) / sourceDims.width) * 100}% ${((cropPreview.y + cropPreview.height) / sourceDims.height) * 100}%,
                        ${((cropPreview.x + cropPreview.width) / sourceDims.width) * 100}% ${(cropPreview.y / sourceDims.height) * 100}%,
                        ${(cropPreview.x / sourceDims.width) * 100}% ${(cropPreview.y / sourceDims.height) * 100}%
                      )`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                    style={{
                      left: `${(cropPreview.x / sourceDims.width) * 100}%`,
                      top: `${(cropPreview.y / sourceDims.height) * 100}%`,
                      width: `${(cropPreview.width / sourceDims.width) * 100}%`,
                      height: `${(cropPreview.height / sourceDims.height) * 100}%`,
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

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
        {file && (scalePercent !== 100 || cropAspect !== 'none') ? (
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
        <img
          src={previewUrl}
          alt="Compressed preview"
          className="max-h-80 w-full rounded-2xl border border-border bg-muted object-contain"
        />
      ) : null}
    </div>
  )
}
