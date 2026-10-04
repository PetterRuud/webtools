import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import { NineSliceGuides } from '#/components/tools/NineSliceGuides'
import { copyText } from '#/lib/clipboard'
import {
  clampSliceMargins,
  defaultSliceMargins,
  downloadBlob,
  exportSlicePngs,
  formatBorderImageCss,
  loadImage,
  type CenterMode,
  type SliceMargins,
} from '#/lib/nineSlice'

type MarginKey = keyof SliceMargins

const MARGIN_FIELDS: Array<{ key: MarginKey; label: string }> = [
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
  { key: 'top', label: 'Top' },
  { key: 'bottom', label: 'Bottom' },
]

const CENTER_MODES: Array<{ id: CenterMode; label: string }> = [
  { id: 'stretch', label: 'Stretch' },
  { id: 'repeat', label: 'Tile' },
  { id: 'round', label: 'Round' },
]

export function NineSliceTool() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  )
  const [margins, setMargins] = useState<SliceMargins>({
    left: 32,
    right: 32,
    top: 32,
    bottom: 32,
  })
  const [centerMode, setCenterMode] = useState<CenterMode>('stretch')
  const [previewW, setPreviewW] = useState(320)
  const [previewH, setPreviewH] = useState(200)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setSourceUrl(null)
      setDims(null)
      return
    }
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    let cancelled = false
    void loadImage(url)
      .then((img) => {
        if (cancelled) return
        const width = img.naturalWidth
        const height = img.naturalHeight
        setDims({ width, height })
        setMargins(defaultSliceMargins(width, height))
        setPreviewW(Math.max(width + 80, 280))
        setPreviewH(Math.max(height + 60, 180))
      })
      .catch((err) => {
        if (cancelled) return
        setDims(null)
        setError(err instanceof Error ? err.message : 'Could not read image')
      })
    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [file])

  const css = useMemo(() => {
    if (!file || !dims) return ''
    return formatBorderImageCss({
      fileName: file.name || 'slice.png',
      margins,
      centerMode,
    })
  }, [file, dims, margins, centerMode])

  const previewStyle = useMemo(() => {
    if (!sourceUrl || !dims) return undefined
    const width = `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`
    return {
      width: previewW,
      height: previewH,
      borderStyle: 'solid',
      borderWidth: width,
      borderImageSource: `url("${sourceUrl}")`,
      borderImageSlice: `${margins.top} ${margins.right} ${margins.bottom} ${margins.left} fill`,
      borderImageWidth: width,
      borderImageRepeat: centerMode,
      background: 'transparent',
    } as const
  }, [sourceUrl, dims, margins, centerMode, previewW, previewH])

  function updateMargin(key: MarginKey, value: number) {
    if (!dims) return
    setMargins((prev) =>
      clampSliceMargins({ ...prev, [key]: value }, dims.width, dims.height),
    )
  }

  async function exportSlices() {
    if (!sourceUrl || !dims || !file) {
      setError('Choose an image first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const image = await loadImage(sourceUrl)
      const slices = await exportSlicePngs(image, margins)
      for (const slice of slices) {
        downloadBlob(slice.blob, slice.fileName)
      }
      toast.success(`Exported ${slices.length} slices`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not export slices'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nine-slice-file">Image</Label>
          <input
            id="nine-slice-file"
            type="file"
            accept="image/*"
            className="block w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setError(null)
            }}
          />
          {file && dims ? (
            <p className="m-0 text-xs tabular-nums text-muted-foreground">
              {file.name} · {dims.width}×{dims.height}
            </p>
          ) : null}
        </div>

        {sourceUrl && dims ? (
          <NineSliceGuides
            src={sourceUrl}
            imageWidth={dims.width}
            imageHeight={dims.height}
            margins={margins}
            onChange={setMargins}
          />
        ) : (
          <p className="m-0 rounded-lg border border-dashed border-border bg-card/50 px-3 py-10 text-center text-sm text-muted-foreground">
            Choose a PNG or JPEG with clear borders
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {MARGIN_FIELDS.map(({ key, label }) => {
            const max =
              key === 'left' || key === 'right'
                ? Math.max(0, (dims?.width ?? 1) - 1)
                : Math.max(0, (dims?.height ?? 1) - 1)
            return (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={`slice-${key}`}>{label}</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      id={`slice-${key}`}
                      type="number"
                      min={0}
                      max={max}
                      value={margins[key]}
                      disabled={!dims}
                      className="h-7 w-16 px-2 text-right tabular-nums"
                      onChange={(e) =>
                        updateMargin(key, Number(e.target.value) || 0)
                      }
                    />
                    <span className="text-xs text-muted-foreground">px</span>
                  </div>
                </div>
                <Slider
                  min={0}
                  max={max}
                  step={1}
                  disabled={!dims}
                  value={[margins[key]]}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value
                    if (typeof next === 'number') updateMargin(key, next)
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Center</Label>
          <div className="flex flex-wrap gap-1.5">
            {CENTER_MODES.map((mode) => (
              <Button
                key={mode.id}
                type="button"
                size="sm"
                variant={centerMode === mode.id ? 'default' : 'outline'}
                onClick={() => setCenterMode(mode.id)}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="preview-w">Preview W</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {previewW}px
              </span>
            </div>
            <Slider
              id="preview-w"
              min={120}
              max={720}
              step={4}
              value={[previewW]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') setPreviewW(next)
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="preview-h">Preview H</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {previewH}px
              </span>
            </div>
            <Slider
              id="preview-h"
              min={80}
              max={520}
              step={4}
              value={[previewH]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') setPreviewH(next)
              }}
            />
          </div>
        </div>

        <div className="overflow-auto rounded-lg border border-border bg-[linear-gradient(45deg,#80808020_25%,transparent_25%,transparent_75%,#80808020_75%),linear-gradient(45deg,#80808020_25%,transparent_25%,transparent_75%,#80808020_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] p-4">
          {previewStyle ? (
            <div className="mx-auto" style={previewStyle} />
          ) : (
            <p className="m-0 py-10 text-center text-sm text-muted-foreground">
              Preview appears after upload
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="nine-slice-css">CSS</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!css}
              onClick={() => void copyText(css, 'CSS')}
            >
              Copy
            </Button>
          </div>
          <Textarea
            id="nine-slice-css"
            readOnly
            value={css}
            placeholder="border-image CSS…"
            className="min-h-36 font-mono text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!file || busy}
            onClick={() => void exportSlices()}
          >
            {busy ? 'Exporting…' : 'Download 9 slices'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!dims}
            onClick={() => {
              if (!dims) return
              setMargins(defaultSliceMargins(dims.width, dims.height))
            }}
          >
            Reset guides
          </Button>
        </div>

        {error ? (
          <p className="m-0 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
