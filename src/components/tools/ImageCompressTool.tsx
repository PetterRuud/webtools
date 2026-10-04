import { useEffect, useMemo, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ImageCompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.75)
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1920)
  const [output, setOutput] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function compress(nextFile = file) {
    if (!nextFile) {
      setError('Choose an image first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await imageCompression(nextFile, {
        maxSizeMB: 8,
        maxWidthOrHeight,
        initialQuality: quality,
        useWebWorker: true,
        fileType: nextFile.type || 'image/jpeg',
      })
      setOutput(result)
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
    anchor.href = url
    anchor.download = `${base}-compressed.jpg`
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
            setError(null)
          }}
        />
        <p className="m-0 text-sm text-muted-foreground">
          Processing stays in your browser. No upload to Workers.
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
            <Label htmlFor="max-dim">Max dimension</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {maxWidthOrHeight}px
            </span>
          </div>
          <Slider
            id="max-dim"
            min={640}
            max={4096}
            step={16}
            value={[maxWidthOrHeight]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') setMaxWidthOrHeight(next)
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
      </div>

      {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}

      {!file && !error ? (
        <p className="m-0 rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
          Drop in a PNG or JPEG when you are ready.
        </p>
      ) : null}

      {file ? (
        <dl className="m-0 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <dt className="text-muted-foreground">Original</dt>
            <dd className="m-0 mt-1 font-medium">{formatBytes(file.size)}</dd>
          </div>
          <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <dt className="text-muted-foreground">Compressed</dt>
            <dd className="m-0 mt-1 font-medium">
              {output ? formatBytes(output.size) : '—'}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <dt className="text-muted-foreground">Saved</dt>
            <dd className="m-0 mt-1 font-medium">
              {savings === null ? '—' : `${savings}%`}
            </dd>
          </div>
        </dl>
      ) : null}

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Compressed preview"
          className="max-h-80 w-full rounded-2xl border border-border object-contain bg-[oklch(0.96_0.01_120)]"
        />
      ) : null}
    </div>
  )
}
