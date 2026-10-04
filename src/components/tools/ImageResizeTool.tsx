import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { DownloadIcon, Loader2Icon, ScalingIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  ImageFileField,
  ImagePreviewFrame,
  imagePreviewClassName,
} from '#/components/tools/ImageFileField'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  clampResizeDimension,
  readImageDimensions,
  resizeImage,
} from '#/lib/imageTransform'

const SCALE_PRESETS = [25, 50, 75, 100, 150, 200] as const

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
  return fromName || 'png'
}

export function ImageResizeTool() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceDims, setSourceDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [lockAspect, setLockAspect] = useState(true)
  const [output, setOutput] = useState<File | null>(null)
  const [outputDims, setOutputDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const aspectRatio = useMemo(() => {
    if (!sourceDims || sourceDims.height === 0) return null
    return sourceDims.width / sourceDims.height
  }, [sourceDims])

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
        setWidth(String(dims.width))
        setHeight(String(dims.height))
      })
      .catch((err) => {
        if (cancelled) return
        setSourceDims(null)
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

  const parsedWidth = Number.parseInt(width, 10)
  const parsedHeight = Number.parseInt(height, 10)
  const targetValid =
    Number.isFinite(parsedWidth) &&
    Number.isFinite(parsedHeight) &&
    parsedWidth >= 1 &&
    parsedHeight >= 1

  const changed =
    !!sourceDims &&
    targetValid &&
    (clampResizeDimension(parsedWidth) !== sourceDims.width ||
      clampResizeDimension(parsedHeight) !== sourceDims.height)

  function clearOutput() {
    setOutput(null)
    setOutputDims(null)
  }

  function setWidthLocked(nextWidth: string) {
    setWidth(nextWidth)
    clearOutput()
    if (!lockAspect || !aspectRatio) return
    const n = Number.parseInt(nextWidth, 10)
    if (!Number.isFinite(n) || n < 1) return
    setHeight(String(clampResizeDimension(n / aspectRatio)))
  }

  function setHeightLocked(nextHeight: string) {
    setHeight(nextHeight)
    clearOutput()
    if (!lockAspect || !aspectRatio) return
    const n = Number.parseInt(nextHeight, 10)
    if (!Number.isFinite(n) || n < 1) return
    setWidth(String(clampResizeDimension(n * aspectRatio)))
  }

  function applyScalePercent(percent: number) {
    if (!sourceDims) return
    const scale = percent / 100
    const nextW = clampResizeDimension(sourceDims.width * scale)
    const nextH = clampResizeDimension(sourceDims.height * scale)
    setWidth(String(nextW))
    setHeight(String(nextH))
    clearOutput()
  }

  function resetDims() {
    if (!sourceDims) return
    setWidth(String(sourceDims.width))
    setHeight(String(sourceDims.height))
    clearOutput()
  }

  async function runResize() {
    if (!file) {
      setError('Choose an image first.')
      return
    }
    if (!targetValid) {
      setError('Enter width and height (≥ 1).')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const prepared = await resizeImage(file, parsedWidth, parsedHeight)
      setOutput(prepared.file)
      setOutputDims({ width: prepared.width, height: prepared.height })
      toast.success(prepared.transformed ? 'Resized' : 'Unchanged')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not resize that image'
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
    const suffix = outputDims
      ? `${outputDims.width}x${outputDims.height}`
      : 'resized'
    anchor.href = url
    anchor.download = `${base}-${suffix}.${ext}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
      <div className="flex flex-col gap-3">
        <ImageFileField
          id="resize-image"
          file={file}
          hint="PNG, JPEG, or WebP"
          onFile={(next) => {
            setFile(next)
            setOutput(null)
            setOutputDims(null)
            setError(null)
            setWidth('')
            setHeight('')
          }}
        />

        {sourceUrl && sourceDims ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-sm font-medium">Source</p>
              <p className="m-0 text-xs tabular-nums text-muted-foreground">
                {sourceDims.width}×{sourceDims.height}
                {targetValid
                  ? ` → ${clampResizeDimension(parsedWidth)}×${clampResizeDimension(parsedHeight)}`
                  : ''}
              </p>
            </div>
            <ImagePreviewFrame>
              <img
                src={sourceUrl}
                alt="Source preview"
                className={imagePreviewClassName}
              />
            </ImagePreviewFrame>
          </div>
        ) : null}

        <p className="m-0 text-xs text-muted-foreground">
          Related:{' '}
          <Link
            to="/tools/image-compress"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Compress
          </Link>
          {' · '}
          <Link
            to="/tools/image-crop"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Crop
          </Link>
          {' · '}
          <Link
            to="/tools/image-format"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Format
          </Link>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resize-width">Width</Label>
            <Input
              id="resize-width"
              type="number"
              min={1}
              max={16384}
              inputMode="numeric"
              value={width}
              disabled={!sourceDims}
              onChange={(e) => setWidthLocked(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resize-height">Height</Label>
            <Input
              id="resize-height"
              type="number"
              min={1}
              max={16384}
              inputMode="numeric"
              value={height}
              disabled={!sourceDims}
              onChange={(e) => setHeightLocked(e.target.value)}
            />
          </div>
        </div>

        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox
            checked={lockAspect}
            disabled={!sourceDims}
            onCheckedChange={(checked) => setLockAspect(checked === true)}
          />
          Lock aspect ratio
        </Label>

        <div className="flex flex-col gap-1.5">
          <Label>Scale</Label>
          <div className="flex flex-wrap gap-1.5">
            {SCALE_PRESETS.map((percent) => (
              <Button
                key={percent}
                type="button"
                size="sm"
                variant="outline"
                disabled={!sourceDims}
                onClick={() => applyScalePercent(percent)}
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!file || busy || !targetValid}
            onClick={() => void runResize()}
          >
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <ScalingIcon data-icon="inline-start" />
            )}
            {busy ? 'Resizing…' : 'Resize'}
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
          {file && changed ? (
            <Button type="button" variant="ghost" onClick={resetDims}>
              Reset
            </Button>
          ) : null}
        </div>

        {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}

        {file ? (
          <dl className="m-0 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Original</dt>
              <dd className="m-0 mt-0.5 font-medium">{formatBytes(file.size)}</dd>
              {sourceDims ? (
                <dd className="m-0 mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {sourceDims.width}×{sourceDims.height}
                </dd>
              ) : null}
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Output</dt>
              <dd className="m-0 mt-0.5 font-medium">
                {output ? formatBytes(output.size) : '—'}
              </dd>
              {outputDims ? (
                <dd className="m-0 mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {outputDims.width}×{outputDims.height}
                </dd>
              ) : targetValid ? (
                <dd className="m-0 mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {clampResizeDimension(parsedWidth)}×
                  {clampResizeDimension(parsedHeight)}
                </dd>
              ) : null}
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
            <ImagePreviewFrame>
              <img
                src={previewUrl}
                alt="Resized preview"
                className={imagePreviewClassName}
              />
            </ImagePreviewFrame>
          </div>
        ) : (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-3 py-8 text-sm text-muted-foreground lg:min-h-48">
            Resized preview
          </div>
        )}
      </div>
    </div>
  )
}
