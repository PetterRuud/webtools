import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  VIEWPORT_PRESETS,
  type CaptureMode,
  type ViewportPreset,
} from '#/lib/websiteScreenshot'

const SAMPLE = 'https://example.com'

export function WebsiteScreenshotTool() {
  const [url, setUrl] = useState(SAMPLE)
  const [preset, setPreset] = useState<ViewportPreset>('desktop')
  const [width, setWidth] = useState(String(VIEWPORT_PRESETS.desktop.width))
  const [height, setHeight] = useState(String(VIEWPORT_PRESETS.desktop.height))
  const [fullPage, setFullPage] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<CaptureMode | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function applyPreset(next: ViewportPreset) {
    setPreset(next)
    if (next === 'custom') return
    const dims = VIEWPORT_PRESETS[next]
    setWidth(String(dims.width))
    setHeight(String(dims.height))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setMode(null)

    try {
      const res = await fetch('/api/website-screenshot/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          preset,
          width: Number(width) || undefined,
          height: Number(height) || undefined,
          fullPage,
        }),
      })
      if (!res.ok) {
        let msg = res.statusText
        try {
          const j = (await res.json()) as { error?: string }
          if (j.error) msg = j.error
        } catch {
          /* ignore */
        }
        throw new Error(msg)
      }
      const captureMode = res.headers.get('X-Capture-Mode') as CaptureMode | null
      const blob = await res.blob()
      setPreviewUrl(URL.createObjectURL(blob))
      setMode(captureMode)
      toast.success('Screenshot ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Capture failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 lg:grid-cols-2 lg:items-start lg:gap-4"
    >
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">URL</span>
          <Input
            type="url"
            value={url}
            placeholder="https://example.com"
            onValueChange={setUrl}
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ['desktop', 'Desktop'],
              ['tablet', 'Tablet'],
              ['mobile', 'Mobile'],
              ['custom', 'Custom'],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={preset === id ? 'default' : 'outline'}
              onClick={() => applyPreset(id)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Width</span>
            <Input
              type="number"
              min={320}
              max={1920}
              value={width}
              onValueChange={(v) => {
                setPreset('custom')
                setWidth(v)
              }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Height</span>
            <Input
              type="number"
              min={320}
              max={4000}
              value={height}
              onValueChange={(v) => {
                setPreset('custom')
                setHeight(v)
              }}
            />
          </label>
        </div>

        <Label className="gap-2 font-normal">
          <Checkbox
            checked={fullPage}
            onCheckedChange={(v) => setFullPage(v === true)}
          />
          Full page
        </Label>

        <Button type="submit" disabled={busy || !url.trim()}>
          {busy ? 'Capturing…' : 'Capture screenshot'}
        </Button>

        {error ? (
          <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <section className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
            Preview
          </h2>
          {mode ? (
            <span className="rounded-md border border-border/80 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
              {mode}
            </span>
          ) : null}
        </div>
        <div className="flex min-h-64 flex-1 items-center justify-center overflow-auto rounded-lg border border-border bg-muted/30 p-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Screenshot of ${url}`}
              className="max-h-[32rem] max-w-full object-contain"
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              Preview after capture
            </span>
          )}
        </div>
        {previewUrl ? (
          <a
            href={previewUrl}
            download="website-screenshot.png"
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            Download website-screenshot.png
          </a>
        ) : null}
      </section>
    </form>
  )
}
