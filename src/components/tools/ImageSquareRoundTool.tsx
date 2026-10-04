import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { DownloadIcon, Loader2Icon, SquareRoundCornerIcon } from 'lucide-react'
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
import { Slider } from '#/components/ui/slider'
import {
  RADIUS_PRESETS,
  clampRadius,
  outputFileName,
  readSourceDimensions,
  renderSquareRound,
  type PadBackground,
} from '#/lib/imageSquareRound'

const BACKGROUNDS: { id: PadBackground; label: string }[] = [
  { id: 'transparent', label: 'Clear' },
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ImageSquareRoundTool() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceDims, setSourceDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [padToSquare, setPadToSquare] = useState(true)
  const [radius, setRadius] = useState(16)
  const [background, setBackground] = useState<PadBackground>('transparent')
  const [output, setOutput] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [outputDims, setOutputDims] = useState<{
    width: number
    height: number
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const outSize = useMemo(() => {
    if (!sourceDims) return null
    if (!padToSquare) {
      return { width: sourceDims.width, height: sourceDims.height }
    }
    const size = Math.max(sourceDims.width, sourceDims.height)
    return { width: size, height: size }
  }, [sourceDims, padToSquare])

  const maxRadius = outSize
    ? Math.floor(Math.min(outSize.width, outSize.height) / 2)
    : 0
  const effectiveRadius = outSize
    ? clampRadius(radius, outSize.width, outSize.height)
    : 0

  useEffect(() => {
    if (!file) {
      setSourceDims(null)
      return
    }
    let cancelled = false
    void readSourceDimensions(file)
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
    }
  }, [file])

  useEffect(() => {
    if (!file || !sourceDims) {
      setOutput(null)
      setOutputDims(null)
      return
    }

    let cancelled = false
    setBusy(true)
    setError(null)

    const timer = window.setTimeout(() => {
      void renderSquareRound(file, {
        padToSquare,
        radius,
        background,
      })
        .then((result) => {
          if (cancelled) return
          setOutput(result.blob)
          setOutputDims({ width: result.width, height: result.height })
        })
        .catch((err) => {
          if (cancelled) return
          setOutput(null)
          setOutputDims(null)
          setError(
            err instanceof Error ? err.message : 'Could not process that image',
          )
        })
        .finally(() => {
          if (!cancelled) setBusy(false)
        })
    }, 80)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [file, sourceDims, padToSquare, radius, background])

  useEffect(() => {
    if (!output) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(output)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [output])

  function download() {
    if (!file || !output) return
    const url = URL.createObjectURL(output)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = outputFileName(file.name, { padToSquare, radius })
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('PNG downloaded')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
      <div className="flex flex-col gap-3">
        <ImageFileField
          id="square-round-image"
          file={file}
          hint="PNG, JPEG, WebP, or SVG"
          onFile={(next) => {
            setFile(next)
            setError(null)
            setOutput(null)
            setOutputDims(null)
          }}
        />

        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox
            checked={padToSquare}
            disabled={!file}
            onCheckedChange={(checked) => setPadToSquare(checked === true)}
          />
          Pad to square
        </Label>

        <div className="flex flex-col gap-1.5">
          <Label>Background</Label>
          <div className="flex flex-wrap gap-1.5">
            {BACKGROUNDS.map((option) => (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={background === option.id ? 'default' : 'outline'}
                disabled={!file}
                onClick={() => setBackground(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="square-round-radius">Corner radius</Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {effectiveRadius}px
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {RADIUS_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                size="sm"
                variant={radius === preset ? 'default' : 'outline'}
                disabled={!file || (maxRadius > 0 && preset > maxRadius)}
                onClick={() => setRadius(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
          <Slider
            id="square-round-radius"
            min={0}
            max={Math.max(1, maxRadius)}
            step={1}
            value={[Math.min(radius, Math.max(0, maxRadius))]}
            disabled={!file || maxRadius === 0}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') setRadius(Math.round(next))
            }}
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={Math.max(0, maxRadius)}
              inputMode="numeric"
              className="w-24"
              disabled={!file}
              value={radius}
              onChange={(event) => {
                const next = Number.parseInt(event.target.value, 10)
                if (!Number.isFinite(next)) {
                  setRadius(0)
                  return
                }
                setRadius(next)
              }}
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!file || busy || !output}
            onClick={download}
          >
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            {busy ? 'Working…' : 'Download PNG'}
          </Button>
          {file ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setPadToSquare(true)
                setRadius(16)
                setBackground('transparent')
              }}
            >
              Reset
            </Button>
          ) : null}
        </div>

        {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}

        <p className="m-0 text-xs text-muted-foreground">
          Related:{' '}
          <Link
            to="/tools/image-crop"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Crop
          </Link>
          {' · '}
          <Link
            to="/tools/image-resize"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Resize
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
                  {effectiveRadius > 0 ? ` · r${effectiveRadius}` : ''}
                </dd>
              ) : outSize ? (
                <dd className="m-0 mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {outSize.width}×{outSize.height}
                </dd>
              ) : null}
            </div>
          </dl>
        ) : null}

        {previewUrl && outputDims ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 flex items-center gap-1.5 text-sm font-medium">
                <SquareRoundCornerIcon className="size-3.5" aria-hidden />
                Preview
              </p>
              {busy ? (
                <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
              ) : null}
            </div>
            <ImagePreviewFrame
              innerClassName={
                background === 'white'
                  ? 'bg-white'
                  : background === 'black'
                    ? 'bg-black'
                    : undefined
              }
            >
              <img
                src={previewUrl}
                alt="Square and round preview"
                className={imagePreviewClassName}
              />
            </ImagePreviewFrame>
          </div>
        ) : (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border px-3 py-8 text-sm text-muted-foreground lg:min-h-48">
            Preview
          </div>
        )}
      </div>
    </div>
  )
}
