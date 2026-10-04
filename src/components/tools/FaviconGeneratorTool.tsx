import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CopyIcon,
  DownloadIcon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { copyText } from '#/lib/clipboard'
import { formatBytes } from '#/lib/imageFormat'
import {
  generateFaviconPack,
  revokeFaviconUrls,
  type FaviconAsset,
} from '#/lib/favicon'

const DEFAULT_BG = '#0f172a'

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function FaviconGeneratorTool() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [transparent, setTransparent] = useState(true)
  const [background, setBackground] = useState(DEFAULT_BG)
  const [radiusPercent, setRadiusPercent] = useState(20)
  const [paddingPercent, setPaddingPercent] = useState(10)
  const [assets, setAssets] = useState<FaviconAsset[]>([])
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null)
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)
  const [html, setHtml] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    return () => revokeFaviconUrls(assets)
  }, [assets])

  const options = useMemo(
    () => ({
      background: transparent ? null : background,
      radiusPercent,
      paddingPercent,
    }),
    [transparent, background, radiusPercent, paddingPercent],
  )

  function clearOutput() {
    revokeFaviconUrls(assets)
    setAssets([])
    setIcoBlob(null)
    setZipBlob(null)
    setHtml('')
  }

  function onPick(next: File | null) {
    setFile(next)
    clearOutput()
    setError(null)
  }

  async function generate() {
    if (!file) {
      setError('Pick an image first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await generateFaviconPack(file, options)
      revokeFaviconUrls(assets)
      setAssets(result.assets)
      setIcoBlob(result.ico.blob)
      setZipBlob(result.zip)
      setHtml(result.html)
      toast.success('Favicon pack ready')
    } catch (err) {
      clearOutput()
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="favicon-file">Image</Label>
          <input
            id="favicon-file"
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
          <div className="skeuo-film overflow-hidden rounded-lg border border-border/80 p-3">
            <div className="overflow-hidden rounded-md bg-card/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <img
                src={sourceUrl}
                alt="Source preview"
                className="mx-auto max-h-44 w-auto object-contain"
              />
            </div>
          </div>
        ) : (
          <p className="m-0 rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
            Choose an image
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Background</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={transparent ? 'default' : 'outline'}
                onClick={() => {
                  setTransparent(true)
                  clearOutput()
                }}
              >
                Transparent
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!transparent ? 'default' : 'outline'}
                onClick={() => {
                  setTransparent(false)
                  clearOutput()
                }}
              >
                Color
              </Button>
              {!transparent ? (
                <Input
                  type="color"
                  value={background}
                  aria-label="Background color"
                  className="h-8 w-12 cursor-pointer p-1"
                  onChange={(event) => {
                    setBackground(event.target.value)
                    clearOutput()
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="favicon-radius">Radius</Label>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.round(radiusPercent)}%
              </span>
            </div>
            <Slider
              id="favicon-radius"
              min={0}
              max={50}
              step={1}
              value={[radiusPercent]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') {
                  setRadiusPercent(next)
                  clearOutput()
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="favicon-padding">Padding</Label>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.round(paddingPercent)}%
              </span>
            </div>
            <Slider
              id="favicon-padding"
              min={0}
              max={40}
              step={1}
              value={[paddingPercent]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') {
                  setPaddingPercent(next)
                  clearOutput()
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="skeuo-plastic"
            onClick={() => void generate()}
            disabled={busy || !file}
          >
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <SparklesIcon data-icon="inline-start" />
            )}
            {busy ? 'Generating…' : 'Generate pack'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => zipBlob && downloadBlob(zipBlob, 'favicons.zip')}
            disabled={!zipBlob}
          >
            <DownloadIcon data-icon="inline-start" />
            Download ZIP
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => icoBlob && downloadBlob(icoBlob, 'favicon.ico')}
            disabled={!icoBlob}
          >
            <DownloadIcon data-icon="inline-start" />
            Download ICO
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onPick(null)
              setTransparent(true)
              setBackground(DEFAULT_BG)
              setRadiusPercent(20)
              setPaddingPercent(10)
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
          <Link
            to="/tools/image-compress"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Crop first
          </Link>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {assets.length > 0 ? (
          <>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
                Badges
              </h2>
              <p className="m-0 text-xs text-muted-foreground">
                PNG + ICO · {formatBytes(zipBlob?.size ?? 0)} zip
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {assets.map((asset) => (
                <button
                  key={asset.fileName}
                  type="button"
                  className="skeuo-stamp flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2 py-3 text-left transition-[transform,box-shadow] hover:translate-y-px"
                  onClick={() => downloadBlob(asset.blob, asset.fileName)}
                  title={`Download ${asset.fileName}`}
                >
                  <div
                    className="skeuo-emboss flex h-16 w-16 items-center justify-center rounded-md border border-border/80"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, color-mix(in oklab, var(--border) 70%, transparent) 25%, transparent 25%), linear-gradient(-45deg, color-mix(in oklab, var(--border) 70%, transparent) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, color-mix(in oklab, var(--border) 70%, transparent) 75%), linear-gradient(-45deg, transparent 75%, color-mix(in oklab, var(--border) 70%, transparent) 75%)',
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
                    }}
                  >
                    <img
                      src={asset.url}
                      alt={asset.label}
                      width={Math.min(48, asset.size)}
                      height={Math.min(48, asset.size)}
                      className="object-contain"
                      style={{
                        width: Math.min(48, asset.size),
                        height: Math.min(48, asset.size),
                        imageRendering:
                          asset.size <= 32 ? 'pixelated' : 'auto',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {asset.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatBytes(asset.blob.size)}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="favicon-html">HTML</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void copyText(html, 'HTML')}
                  disabled={!html}
                >
                  <CopyIcon data-icon="inline-start" />
                  Copy
                </Button>
              </div>
              <pre
                id="favicon-html"
                className="m-0 max-h-48 overflow-auto rounded-lg border border-border bg-card/50 p-3 text-xs leading-5 text-foreground"
              >
                {html}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border px-3 py-8 text-sm text-muted-foreground lg:min-h-64">
            Previews and HTML appear here
          </div>
        )}
      </div>
    </div>
  )
}
