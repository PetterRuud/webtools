import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import {
  OUTPUT_FORMATS,
  convertImageFormat,
  formatBytes,
  outputFileName,
  type OutputFormat,
} from '#/lib/imageFormat'

export function ImageFormatTool() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [format, setFormat] = useState<OutputFormat>('webp')
  const [quality, setQuality] = useState(0.9)
  const [output, setOutput] = useState<Blob | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = OUTPUT_FORMATS.find((item) => item.id === format)!
  const lossy = selected.lossy

  useEffect(() => {
    if (!file) {
      setSourceUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!output) {
      setOutputUrl(null)
      return
    }
    const url = URL.createObjectURL(output)
    setOutputUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [output])

  const downloadName = useMemo(
    () => (file ? outputFileName(file.name, format) : `converted.${selected.extension}`),
    [file, format, selected.extension],
  )

  function onPick(next: File | null) {
    setFile(next)
    setOutput(null)
    setDims(null)
    setError(null)
  }

  async function convert() {
    if (!file) {
      setError('Pick an image first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await convertImageFormat(file, format, quality)
      setOutput(result.blob)
      setDims({ width: result.width, height: result.height })
      toast.success(`Converted to ${selected.label}`)
    } catch (err) {
      setOutput(null)
      setDims(null)
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setBusy(false)
    }
  }

  function download() {
    if (!output || !outputUrl) return
    const anchor = document.createElement('a')
    anchor.href = outputUrl
    anchor.download = downloadName
    anchor.click()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="format-file">Image</Label>
          <input
            id="format-file"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/85"
            onChange={(event) => onPick(event.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="m-0 text-xs text-muted-foreground">
              {file.name} · {formatBytes(file.size)}
              {file.type ? ` · ${file.type}` : ''}
            </p>
          ) : null}
        </div>

        {sourceUrl ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card/50">
            <img
              src={sourceUrl}
              alt="Source preview"
              className="mx-auto max-h-52 w-auto object-contain"
            />
          </div>
        ) : (
          <p className="m-0 rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
            Choose an image
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label>Output</Label>
          <div className="flex flex-wrap gap-1.5">
            {OUTPUT_FORMATS.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={format === item.id ? 'default' : 'outline'}
                onClick={() => {
                  setFormat(item.id)
                  setOutput(null)
                  setError(null)
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {lossy ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="format-quality">Quality</Label>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <Slider
              id="format-quality"
              min={0.1}
              max={1}
              step={0.05}
              value={[quality]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') {
                  setQuality(next)
                  setOutput(null)
                }
              }}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void convert()} disabled={busy || !file}>
            {busy ? 'Converting…' : `Convert to ${selected.label}`}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={download}
            disabled={!output}
          >
            Download
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onPick(null)
              setFormat('webp')
              setQuality(0.9)
            }}
          >
            Clear
          </Button>
        </div>

        {error ? (
          <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

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
            to="/tools/image-compress"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Compress
          </Link>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {output && outputUrl ? (
          <>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
                Result
              </h2>
              <p className="m-0 text-xs text-muted-foreground">
                {downloadName}
                {dims ? ` · ${dims.width}×${dims.height}` : ''} ·{' '}
                {formatBytes(output.size)}
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card/50">
              <img
                src={outputUrl}
                alt="Converted preview"
                className="mx-auto max-h-80 w-auto object-contain"
              />
            </div>
          </>
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border px-3 py-8 text-sm text-muted-foreground lg:min-h-64">
            Result appears here
          </div>
        )}
      </div>
    </div>
  )
}
