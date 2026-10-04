import { useEffect, useMemo, useRef, useState } from 'react'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import samplePanelUrl from '#/assets/samples/nine-slice-panel.png?url'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import { NineSliceGuides } from '#/components/tools/NineSliceGuides'
import { copyText } from '#/lib/clipboard'
import {
  SAMPLE_PANEL_FILE_NAME,
  SAMPLE_SLICE_MARGINS,
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
type SourceKind = 'sample' | 'file'

const MARGIN_FIELDS: Array<{ key: MarginKey; label: string }> = [
  { key: 'top', label: 'Top' },
  { key: 'right', label: 'Right' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'left', label: 'Left' },
]

const CENTER_MODES: Array<{ id: CenterMode; label: string }> = [
  { id: 'stretch', label: 'Stretch' },
  { id: 'repeat', label: 'Tile' },
  { id: 'round', label: 'Round' },
]

const PREVIEW_FRAMES: Array<{
  id: string
  width: number
  height: number
  text: string
}> = [
  {
    id: 'wide',
    width: 280,
    height: 160,
    text: 'Quiet winds slice through serene landscapes in bounded moments.',
  },
  {
    id: 'tall',
    width: 140,
    height: 220,
    text: 'Slice of life',
  },
  {
    id: 'bar',
    width: 240,
    height: 96,
    text: 'Contours of change',
  },
]

export function NineSliceTool() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sourceKind, setSourceKind] = useState<SourceKind>('sample')
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  )
  const [margins, setMargins] = useState<SliceMargins>(SAMPLE_SLICE_MARGINS)
  const [centerMode, setCenterMode] = useState<CenterMode>('stretch')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggingFile, setDraggingFile] = useState(false)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
      try {
        const img = await loadImage(samplePanelUrl)
        if (cancelled) return
        const width = img.naturalWidth
        const height = img.naturalHeight
        setDims({ width, height })
        setSourceUrl(samplePanelUrl)
        setSourceKind('sample')
        setFile(null)
        setMargins(clampSliceMargins(SAMPLE_SLICE_MARGINS, width, height))
      } catch (err) {
        if (cancelled) return
        setDims(null)
        setSourceUrl(null)
        setError(err instanceof Error ? err.message : 'Could not read image')
      }
    })()
    return () => {
      cancelled = true
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [])

  async function applySource(
    url: string,
    kind: SourceKind,
    nextFile: File | null,
    preferSampleMargins: boolean,
  ) {
    setError(null)
    try {
      const img = await loadImage(url)
      const width = img.naturalWidth
      const height = img.naturalHeight
      setDims({ width, height })
      setSourceUrl(url)
      setSourceKind(kind)
      setFile(nextFile)
      setMargins(
        preferSampleMargins
          ? clampSliceMargins(SAMPLE_SLICE_MARGINS, width, height)
          : defaultSliceMargins(width, height),
      )
    } catch (err) {
      setDims(null)
      setSourceUrl(null)
      setError(err instanceof Error ? err.message : 'Could not read image')
    }
  }

  async function loadSample() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
    await applySource(samplePanelUrl, 'sample', null, true)
  }

  async function loadFromFile(next: File | null) {
    if (!next) return
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    const url = URL.createObjectURL(next)
    objectUrlRef.current = url
    await applySource(url, 'file', next, false)
  }

  const displayName =
    sourceKind === 'sample'
      ? SAMPLE_PANEL_FILE_NAME
      : file?.name || 'slice.png'

  const css = useMemo(() => {
    if (!dims) return ''
    return formatBorderImageCss({
      fileName: displayName,
      margins,
      centerMode,
    })
  }, [dims, margins, centerMode, displayName])

  function previewStyle(width: number, height: number) {
    if (!sourceUrl || !dims) return undefined
    const border = `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`
    return {
      width,
      height,
      boxSizing: 'border-box' as const,
      borderStyle: 'solid',
      borderWidth: border,
      borderImageSource: `url("${sourceUrl}")`,
      borderImageSlice: `${margins.top} ${margins.right} ${margins.bottom} ${margins.left} fill`,
      borderImageWidth: border,
      borderImageRepeat: centerMode,
      padding: border,
      background: 'transparent',
      overflow: 'hidden' as const,
      resize: 'both' as const,
      minWidth: 96,
      minHeight: 72,
      maxWidth: '100%',
      color: 'var(--foreground)',
      fontSize: 13,
      lineHeight: 1.35,
    }
  }

  function updateMargin(key: MarginKey, value: number) {
    if (!dims) return
    setMargins((prev) =>
      clampSliceMargins({ ...prev, [key]: value }, dims.width, dims.height),
    )
  }

  async function exportSlices() {
    if (!sourceUrl || !dims) {
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
    <div
      className="relative grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start"
      onDragEnter={(e) => {
        e.preventDefault()
        if (e.dataTransfer.types.includes('Files')) setDraggingFile(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDraggingFile(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDraggingFile(false)
        const next = e.dataTransfer.files?.[0]
        if (next) void loadFromFile(next)
      }}
    >
      {draggingFile ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-background/80 text-sm font-medium">
          Drop an image
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
            <Label htmlFor="nine-slice-file">Image</Label>
            <input
              ref={fileInputRef}
              id="nine-slice-file"
              type="file"
              accept="image/*"
              className="block w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
              onChange={(e) => {
                void loadFromFile(e.target.files?.[0] ?? null)
              }}
            />
          </div>
          <Button
            type="button"
            variant={sourceKind === 'sample' ? 'default' : 'outline'}
            size="sm"
            onClick={() => void loadSample()}
          >
            Sample
          </Button>
        </div>

        {dims ? (
          <p className="m-0 text-xs tabular-nums text-muted-foreground">
            {displayName} · {dims.width}×{dims.height}
            {sourceKind === 'sample' ? ' · demo panel' : ''}
          </p>
        ) : null}

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
            Loading sample…
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {MARGIN_FIELDS.map(({ key, label }) => {
            const max = Math.max(
              1,
              key === 'left' || key === 'right'
                ? (dims?.width ?? 2) - 1
                : (dims?.height ?? 2) - 1,
            )
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
            className="min-h-32 font-mono text-xs"
          />
          <p className="m-0 text-xs text-muted-foreground">
            Tip: try{' '}
            <a
              className="underline underline-offset-2"
              href="https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-repeat"
              target="_blank"
              rel="noreferrer"
            >
              border-image-repeat
            </a>{' '}
            — Stretch / Tile / Round below.
          </p>
        </div>

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

        <div className="flex flex-col gap-1.5">
          <Label>Preview</Label>
          <div className="flex flex-wrap content-start gap-3 rounded-lg border border-border bg-[linear-gradient(45deg,#80808020_25%,transparent_25%,transparent_75%,#80808020_75%),linear-gradient(45deg,#80808020_25%,transparent_25%,transparent_75%,#80808020_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] p-3">
            {sourceUrl && dims ? (
              PREVIEW_FRAMES.map((frame) => (
                <div
                  key={frame.id}
                  className="outline-none"
                  style={previewStyle(frame.width, frame.height)}
                  contentEditable
                  suppressContentEditableWarning
                >
                  {frame.text}
                </div>
              ))
            ) : (
              <p className="m-0 w-full py-8 text-center text-sm text-muted-foreground">
                Preview appears with the sample
              </p>
            )}
          </div>
          <p className="m-0 text-xs text-muted-foreground">
            Drag the bottom-right grip on each frame to resize.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!dims || busy}
            onClick={() => void exportSlices()}
          >
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            {busy ? 'Exporting…' : 'Download 9 slices'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!dims}
            onClick={() => {
              if (!dims) return
              setMargins(
                sourceKind === 'sample'
                  ? clampSliceMargins(SAMPLE_SLICE_MARGINS, dims.width, dims.height)
                  : defaultSliceMargins(dims.width, dims.height),
              )
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
