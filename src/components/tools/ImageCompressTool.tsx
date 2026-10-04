import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import imageCompression from 'browser-image-compression'
import { DownloadIcon, Loader2Icon, Minimize2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import {
  prepareImageForCompress,
  readImageDimensions,
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
        if (cancelled) return
        setSourceDims(dims)
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

  const savings = useMemo(() => {
    if (!file || !output || file.size === 0) return null
    return Math.max(0, Math.round((1 - output.size / file.size) * 100))
  }, [file, output])

  const plannedDims = useMemo(() => {
    if (!sourceDims) return null
    const scale = scalePercent / 100
    return {
      width: Math.max(1, Math.round(sourceDims.width * scale)),
      height: Math.max(1, Math.round(sourceDims.height * scale)),
    }
  }, [sourceDims, scalePercent])

  function resetScale() {
    setScalePercent(100)
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
        cropEnabled: false,
        cropRect: null,
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
      toast.success('Compressed')
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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image">Image</Label>
          <Input
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
            }}
          />
        </div>

        {sourceUrl && sourceDims ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-sm font-medium">Source</p>
              <p className="m-0 text-xs tabular-nums text-muted-foreground">
                {sourceDims.width}×{sourceDims.height}
                {plannedDims && scalePercent !== 100
                  ? ` → ${plannedDims.width}×${plannedDims.height}`
                  : ''}
              </p>
            </div>
            <div className="bg-muted/40 overflow-hidden rounded-xl border border-border/80 p-3">
              <div className="overflow-hidden rounded-md bg-card/80">
                <img
                  src={sourceUrl}
                  alt="Source preview"
                  className="mx-auto max-h-80 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        ) : !file ? (
          <p className="m-0 rounded-lg border border-dashed border-border bg-card/50 px-3 py-8 text-center text-sm text-muted-foreground">
            Choose a PNG or JPEG
          </p>
        ) : null}

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label id="scale-label">Scale</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {scalePercent}%
              </span>
            </div>
            <Slider
              aria-labelledby="scale-label"
              min={10}
              max={100}
              step={1}
              value={[scalePercent]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') setScalePercent(Math.round(next))
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label id="quality-label">Quality</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <Slider
              aria-labelledby="quality-label"
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

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!file || busy}
            onClick={() => void compress()}
          >
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <Minimize2Icon data-icon="inline-start" />
            )}
            {busy ? 'Compressing…' : 'Compress'}
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
          {file && scalePercent !== 100 ? (
            <Button type="button" variant="ghost" onClick={resetScale}>
              Reset scale
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
              <dt className="text-xs text-muted-foreground">Compressed</dt>
              <dd className="m-0 mt-0.5 font-medium">
                {output ? formatBytes(output.size) : '—'}
              </dd>
              {outputDims ? (
                <dd className="m-0 mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {outputDims.width}×{outputDims.height}
                </dd>
              ) : null}
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Saved</dt>
              <dd className="m-0 mt-0.5 font-medium">
                {savings === null ? '—' : `${savings}%`}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Output size</dt>
              <dd className="m-0 mt-0.5 font-medium tabular-nums">
                {plannedDims
                  ? `${plannedDims.width}×${plannedDims.height}`
                  : '—'}
              </dd>
            </div>
          </dl>
        ) : null}

        {previewUrl ? (
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-sm font-medium">Result</p>
            <div className="bg-muted/40 overflow-hidden rounded-xl border border-border/80 p-3">
              <img
                src={previewUrl}
                alt="Compressed preview"
                className="max-h-72 w-full rounded-md bg-muted object-contain"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
