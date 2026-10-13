import { useEffect, useMemo, useState } from 'react'
import {
  CopyIcon,
  DownloadIcon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageFileField } from '#/components/tools/ImageFileField'
import { AppIconPlatformPreviews } from '#/components/tools/AppIconPlatformPreviews'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import { formatBytes } from '#/lib/imageFormat'
import {
  generateAppIconPack,
  previewAppIconDataUrl,
  resolveIconSource,
  revokeAppIconUrls,
  type AppIconAsset,
  type AppIconBackground,
  type AppIconOptions,
  type AppManifestFields,
} from '#/lib/appIcon'
import {
  APP_ICON_LUCIDE,
  filterLucideIcons,
  lucideToSvgMarkup,
  type LucidePick,
} from '#/lib/appIconLucide'
import { cn } from 'cn'

type SourceMode = 'image' | 'svg' | 'lucide'
type BgMode = 'solid' | 'gradient' | 'transparent'

const DEFAULT_BG = '#5865f2'
const DEFAULT_FG = '#ffffff'
const DEFAULT_GRAD_TO = '#eb459e'

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          value={value}
          aria-label={label}
          className="h-8 w-12 cursor-pointer p-1"
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          value={value}
          aria-label={`${label} hex`}
          className="font-mono text-xs"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}

export function AppIconGeneratorTool() {
  const [sourceMode, setSourceMode] = useState<SourceMode>('image')
  const [file, setFile] = useState<File | null>(null)
  const [svgText, setSvgText] = useState('')
  const [lucideQuery, setLucideQuery] = useState('')
  const [lucidePick, setLucidePick] = useState<LucidePick | null>(null)
  const [lucideSvg, setLucideSvg] = useState<string | null>(null)

  const [bgMode, setBgMode] = useState<BgMode>('solid')
  const [bgSolid, setBgSolid] = useState(DEFAULT_BG)
  const [gradFrom, setGradFrom] = useState(DEFAULT_BG)
  const [gradTo, setGradTo] = useState(DEFAULT_GRAD_TO)
  const [gradAngle, setGradAngle] = useState(135)
  const [foreground, setForeground] = useState(DEFAULT_FG)
  const [radiusPercent, setRadiusPercent] = useState(22)
  const [paddingPercent, setPaddingPercent] = useState(12)

  const [appName, setAppName] = useState('My App')
  const [shortName, setShortName] = useState('App')
  const [themeColor, setThemeColor] = useState(DEFAULT_BG)
  const [manifestBg, setManifestBg] = useState(DEFAULT_BG)
  const [startUrl, setStartUrl] = useState('/')
  const [display, setDisplay] =
    useState<AppManifestFields['display']>('standalone')

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [assets, setAssets] = useState<AppIconAsset[]>([])
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null)
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)
  const [html, setHtml] = useState('')
  const [manifest, setManifest] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lucideMatches = useMemo(
    () => filterLucideIcons(lucideQuery),
    [lucideQuery],
  )

  const usesForeground = sourceMode === 'svg' || sourceMode === 'lucide'

  const background: AppIconBackground = useMemo(() => {
    if (bgMode === 'transparent') return { kind: 'transparent' }
    if (bgMode === 'gradient') {
      return {
        kind: 'gradient',
        from: gradFrom,
        to: gradTo,
        angle: gradAngle,
      }
    }
    return { kind: 'solid', color: bgSolid }
  }, [bgMode, bgSolid, gradFrom, gradTo, gradAngle])

  const options: AppIconOptions = useMemo(
    () => ({
      background,
      foreground: usesForeground ? foreground : null,
      radiusPercent,
      paddingPercent,
    }),
    [background, usesForeground, foreground, radiusPercent, paddingPercent],
  )

  const manifestFields: AppManifestFields = useMemo(
    () => ({
      name: appName.trim() || 'My App',
      shortName: shortName.trim() || 'App',
      themeColor,
      backgroundColor: manifestBg,
      startUrl: startUrl.trim() || '/',
      display,
    }),
    [appName, shortName, themeColor, manifestBg, startUrl, display],
  )

  useEffect(() => {
    return () => revokeAppIconUrls(assets)
  }, [assets])

  function applyLucidePick(item: LucidePick | null) {
    setLucidePick(item)
    if (!item) {
      setLucideSvg(null)
      return
    }
    try {
      setLucideSvg(lucideToSvgMarkup(item.Icon))
      setError(null)
    } catch (err) {
      setLucideSvg(null)
      setError(err instanceof Error ? err.message : 'Lucide render failed')
    }
  }

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const ready =
            (sourceMode === 'image' && file) ||
            (sourceMode === 'svg' && Boolean(svgText.trim())) ||
            (sourceMode === 'lucide' && lucideSvg)
          if (!ready) {
            if (!cancelled) setPreviewUrl(null)
            return
          }
          const source = await resolveIconSource({
            kind: sourceMode,
            file,
            svgText,
            lucideSvg: lucideSvg ?? undefined,
            foreground: usesForeground ? foreground : null,
          })
          // Square master — platform CSS applies the mask once (avoid double-clip).
          const url = previewAppIconDataUrl(
            source,
            { ...options, radiusPercent: 0 },
            256,
            false,
          )
          if (!cancelled) setPreviewUrl(url)
        } catch (err) {
          if (!cancelled) {
            setPreviewUrl(null)
            setError(err instanceof Error ? err.message : 'Preview failed')
          }
        }
      })()
    }, 80)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    sourceMode,
    file,
    svgText,
    lucideSvg,
    options,
    usesForeground,
    foreground,
  ])

  function clearOutput() {
    revokeAppIconUrls(assets)
    setAssets([])
    setIcoBlob(null)
    setZipBlob(null)
    setHtml('')
    setManifest('')
  }

  function onPickFile(next: File | null) {
    setFile(next)
    clearOutput()
    setError(null)
  }

  async function generate() {
    setBusy(true)
    setError(null)
    try {
      const source = await resolveIconSource({
        kind: sourceMode,
        file,
        svgText,
        lucideSvg: lucideSvg ?? undefined,
        foreground: usesForeground ? foreground : null,
      })
      const result = await generateAppIconPack(
        source,
        options,
        manifestFields,
      )
      revokeAppIconUrls(assets)
      setAssets(result.assets)
      setIcoBlob(result.ico.blob)
      setZipBlob(result.zip)
      setHtml(result.html)
      setManifest(result.manifest)
      toast.success('Icon pack ready')
    } catch (err) {
      clearOutput()
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setBusy(false)
    }
  }

  const canGenerate =
    (sourceMode === 'image' && Boolean(file)) ||
    (sourceMode === 'svg' && Boolean(svgText.trim())) ||
    (sourceMode === 'lucide' && Boolean(lucideSvg))

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['image', 'Image'],
              ['svg', 'SVG'],
              ['lucide', 'Lucide'],
            ] as const
          ).map(([mode, label]) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={sourceMode === mode ? 'default' : 'outline'}
              onClick={() => {
                setSourceMode(mode)
                if (mode === 'lucide' && !lucidePick) {
                  applyLucidePick(APP_ICON_LUCIDE[0] ?? null)
                }
                clearOutput()
                setError(null)
              }}
            >
              {label}
            </Button>
          ))}
        </div>

        {sourceMode === 'image' ? (
          <ImageFileField
            id="app-icon-file"
            file={file}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
            hint="PNG, JPEG, WebP, or SVG"
            onFile={onPickFile}
          />
        ) : null}

        {sourceMode === 'svg' ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="app-icon-svg">SVG code</Label>
            <Textarea
              id="app-icon-svg"
              value={svgText}
              placeholder="<svg …>"
              className="min-h-28 font-mono text-xs"
              onChange={(event) => {
                setSvgText(event.target.value)
                clearOutput()
                setError(null)
              }}
            />
          </div>
        ) : null}

        {sourceMode === 'lucide' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="app-icon-lucide-search">Lucide icon</Label>
            <Input
              id="app-icon-lucide-search"
              value={lucideQuery}
              placeholder="Search curated icons…"
              onChange={(event) => setLucideQuery(event.target.value)}
            />
            <div className="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-border p-1.5 sm:grid-cols-8">
              {lucideMatches.map((item) => {
                const Icon = item.Icon
                const selected = lucidePick?.name === item.name
                return (
                  <button
                    key={item.name}
                    type="button"
                    title={item.name}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-md border border-transparent text-foreground hover:bg-muted/60',
                      selected && 'border-ring bg-muted',
                    )}
                    onClick={() => {
                      applyLucidePick(item)
                      clearOutput()
                    }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </button>
                )
              })}
            </div>
            {lucidePick ? (
              <p className="m-0 text-xs text-muted-foreground">
                {lucidePick.name}
                <span className="text-muted-foreground/70">
                  {' '}
                  · {APP_ICON_LUCIDE.length} curated
                </span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['solid', 'Solid'],
              ['gradient', 'Gradient'],
              ['transparent', 'Clear'],
            ] as const
          ).map(([mode, label]) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={bgMode === mode ? 'default' : 'outline'}
              onClick={() => {
                setBgMode(mode)
                clearOutput()
              }}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {bgMode === 'solid' ? (
            <ColorField
              id="app-icon-bg"
              label="Background"
              value={bgSolid}
              onChange={(value) => {
                setBgSolid(value)
                clearOutput()
              }}
            />
          ) : null}
          {bgMode === 'gradient' ? (
            <>
              <ColorField
                id="app-icon-grad-from"
                label="From"
                value={gradFrom}
                onChange={(value) => {
                  setGradFrom(value)
                  clearOutput()
                }}
              />
              <ColorField
                id="app-icon-grad-to"
                label="To"
                value={gradTo}
                onChange={(value) => {
                  setGradTo(value)
                  clearOutput()
                }}
              />
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Label id="app-icon-angle-label">Angle</Label>
                  <span className="font-mono text-sm text-muted-foreground">
                    {Math.round(gradAngle)}°
                  </span>
                </div>
                <Slider
                  aria-labelledby="app-icon-angle-label"
                  min={0}
                  max={360}
                  step={1}
                  value={[gradAngle]}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value
                    if (typeof next === 'number') {
                      setGradAngle(next)
                      clearOutput()
                    }
                  }}
                />
              </div>
            </>
          ) : null}

          {usesForeground ? (
            <ColorField
              id="app-icon-fg"
              label="Foreground"
              value={foreground}
              onChange={(value) => {
                setForeground(value)
                clearOutput()
              }}
            />
          ) : null}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label id="app-icon-radius-label">Radius (web)</Label>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.round(radiusPercent)}%
              </span>
            </div>
            <Slider
              aria-labelledby="app-icon-radius-label"
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
            <p className="m-0 text-[11px] text-muted-foreground">
              Baked into favicons / PWA any. iOS &amp; maskable stay square.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label id="app-icon-padding-label">Padding</Label>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.round(paddingPercent)}%
              </span>
            </div>
            <Slider
              aria-labelledby="app-icon-padding-label"
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="app-icon-name">App name</Label>
            <Input
              id="app-icon-name"
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="app-icon-short">Short name</Label>
            <Input
              id="app-icon-short"
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
            />
          </div>
          <ColorField
            id="app-icon-theme"
            label="Theme color"
            value={themeColor}
            onChange={setThemeColor}
          />
          <ColorField
            id="app-icon-manifest-bg"
            label="Manifest bg"
            value={manifestBg}
            onChange={setManifestBg}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="app-icon-start">Start URL</Label>
            <Input
              id="app-icon-start"
              value={startUrl}
              onChange={(event) => setStartUrl(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="app-icon-display">Display</Label>
            <Select
              value={display}
              onValueChange={(value) => {
                if (value) setDisplay(value as AppManifestFields['display'])
              }}
            >
              <SelectTrigger id="app-icon-display" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standalone">standalone</SelectItem>
                <SelectItem value="fullscreen">fullscreen</SelectItem>
                <SelectItem value="minimal-ui">minimal-ui</SelectItem>
                <SelectItem value="browser">browser</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void generate()}
            disabled={busy || !canGenerate}
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
            onClick={() =>
              zipBlob && downloadBlob(zipBlob, 'app-icons.zip')
            }
            disabled={!zipBlob}
          >
            <DownloadIcon data-icon="inline-start" />
            ZIP
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => icoBlob && downloadBlob(icoBlob, 'favicon.ico')}
            disabled={!icoBlob}
          >
            <DownloadIcon data-icon="inline-start" />
            ICO
          </Button>
        </div>

        {error ? (
          <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <AppIconPlatformPreviews
          iconUrl={previewUrl}
          appName={appName}
          shortName={shortName}
        />

        {assets.length > 0 ? (
          <>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
                Pack
              </h2>
              <p className="m-0 text-xs text-muted-foreground">
                Favicon + PWA + manifest · {formatBytes(zipBlob?.size ?? 0)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {assets.map((asset) => (
                <button
                  key={asset.fileName}
                  type="button"
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-3 text-left hover:bg-muted/40"
                  onClick={() => downloadBlob(asset.blob, asset.fileName)}
                  title={`Download ${asset.fileName}`}
                >
                  <img
                    src={asset.url}
                    alt={asset.label}
                    width={48}
                    height={48}
                    className="object-contain"
                    style={{
                      imageRendering: asset.size <= 32 ? 'pixelated' : 'auto',
                    }}
                  />
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
                <Label>site.webmanifest</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void copyText(manifest, 'Manifest')}
                  disabled={!manifest}
                >
                  <CopyIcon data-icon="inline-start" />
                  Copy
                </Button>
              </div>
              <pre className="m-0 max-h-40 overflow-auto rounded-lg border border-border bg-card/50 p-3 text-xs leading-5 text-foreground">
                {manifest}
              </pre>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label>HTML</Label>
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
              <pre className="m-0 max-h-36 overflow-auto rounded-lg border border-border bg-card/50 p-3 text-xs leading-5 text-foreground">
                {html}
              </pre>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
