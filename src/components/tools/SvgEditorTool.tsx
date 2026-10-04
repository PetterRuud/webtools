import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  SAMPLE_SVG,
  downloadBlob,
  downloadTextFile,
  ensureViewBoxFromSize,
  fitViewBoxToContent,
  minifySvg,
  parseSvg,
  prettifySvg,
  stripComments,
  stripMetadata,
  svgToPngBlob,
} from '#/lib/svgEditor'

export function SvgEditorTool() {
  const [source, setSource] = useState(SAMPLE_SVG)
  const [error, setError] = useState<string | null>(null)
  const [busyPng, setBusyPng] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!source.trim()) {
      setPreviewUrl(null)
      setParseError(null)
      return
    }

    const parsed = parseSvg(source)
    if (!parsed.ok) {
      setPreviewUrl(null)
      setParseError(parsed.error)
      return
    }

    setParseError(null)
    const url = URL.createObjectURL(
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' }),
    )
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [source])

  const charCount = useMemo(() => source.length.toLocaleString(), [source])

  function applyTransform(
    label: string,
    transform: (value: string) => string,
  ) {
    if (!source.trim()) {
      setError('Paste SVG first.')
      return
    }
    try {
      const next = transform(source)
      setSource(next)
      setError(null)
      toast.success(label)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transform failed')
    }
  }

  async function downloadPng() {
    if (!source.trim()) {
      setError('Paste SVG first.')
      return
    }
    setBusyPng(true)
    try {
      const blob = await svgToPngBlob(source, 2)
      downloadBlob('image.png', blob)
      toast.success('PNG downloaded')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PNG export failed')
    } finally {
      setBusyPng(false)
    }
  }

  const statusError = error ?? parseError

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            onClick={() => applyTransform('Prettified', (v) => prettifySvg(v))}
          >
            Prettify
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => applyTransform('Minified', (v) => minifySvg(v))}
          >
            Minify
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              applyTransform('Comments removed', (v) => stripComments(v))
            }
          >
            Strip comments
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              applyTransform('Metadata removed', (v) => stripMetadata(v))
            }
          >
            Strip metadata
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              applyTransform('viewBox set', (v) => ensureViewBoxFromSize(v))
            }
          >
            viewBox from size
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              applyTransform('viewBox fitted', (v) => fitViewBoxToContent(v))
            }
          >
            Fit viewBox
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSource(SAMPLE_SVG)
              setError(null)
            }}
          >
            Sample
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSource('')
              setError(null)
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="svg-source">Source</Label>
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void copyText(source, 'SVG')}
                disabled={!source.trim()}
              >
                Copy
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!source.trim()) {
                    setError('Paste SVG first.')
                    return
                  }
                  downloadTextFile(
                    'image.svg',
                    source,
                    'image/svg+xml;charset=utf-8',
                  )
                  toast.success('SVG downloaded')
                }}
                disabled={!source.trim()}
              >
                SVG
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void downloadPng()}
                disabled={!source.trim() || busyPng}
              >
                {busyPng ? 'PNG…' : 'PNG'}
              </Button>
            </div>
          </div>
          <Textarea
            id="svg-source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value)
              setError(null)
            }}
            spellCheck={false}
            placeholder="Paste SVG…"
            className="min-h-80 font-mono text-[0.8rem] leading-5"
            aria-invalid={Boolean(statusError)}
          />
          <p className="m-0 text-xs text-muted-foreground">{charCount} chars</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Preview</Label>
          <div
            className="relative flex min-h-80 items-center justify-center overflow-auto rounded-lg border border-border p-4"
            style={{
              backgroundImage:
                'linear-gradient(45deg, color-mix(in oklch, var(--muted) 70%, transparent) 25%, transparent 25%), linear-gradient(-45deg, color-mix(in oklch, var(--muted) 70%, transparent) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, color-mix(in oklch, var(--muted) 70%, transparent) 75%), linear-gradient(-45deg, transparent 75%, color-mix(in oklch, var(--muted) 70%, transparent) 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
              backgroundColor: 'var(--background)',
            }}
          >
            {!source.trim() ? (
              <p className="m-0 text-sm text-muted-foreground">Paste SVG…</p>
            ) : statusError ? (
              <p className="m-0 max-w-sm text-center text-sm text-destructive">
                {statusError}
              </p>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="SVG preview"
                className="max-h-[28rem] max-w-full object-contain"
              />
            ) : null}
          </div>
        </div>
      </div>

      {statusError ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {statusError}
        </p>
      ) : null}
    </div>
  )
}
