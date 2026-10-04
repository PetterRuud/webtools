import { useEffect, useRef, useState } from 'react'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import {
  BACKGROUND_PRESETS,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_PADDING,
  FONT_FAMILIES,
  LANGUAGES,
  SAMPLE_CODE,
  THEMES,
  WINDOW_CHROMES,
  downloadDataUrl,
  exportElementToPng,
  highlightCode,
  type FontFamilyId,
  type LanguageId,
  type ThemeId,
  type WindowChrome,
} from '#/lib/codeScreenshot'
import { cn } from 'cn'

const selectClass =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30'

export function CodeScreenshotTool() {
  const captureRef = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState(SAMPLE_CODE)
  const [language, setLanguage] = useState<LanguageId>('typescript')
  const [theme, setTheme] = useState<ThemeId>('github-dark')
  const [chrome, setChrome] = useState<WindowChrome>('macos')
  const [backgroundId, setBackgroundId] = useState(BACKGROUND_PRESETS[0].id)
  const [customBackground, setCustomBackground] = useState('#0f766e')
  const [padding, setPadding] = useState(DEFAULT_PADDING)
  const [fontSize, setFontSize] = useState(14)
  const [fontFamily, setFontFamily] = useState<FontFamilyId>('jetbrains')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showTitle, setShowTitle] = useState(true)
  const [title, setTitle] = useState('fibonacci.ts')
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const [windowBg, setWindowBg] = useState('#24292e')
  const [highlightError, setHighlightError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const background =
    backgroundId === 'custom'
      ? customBackground
      : (BACKGROUND_PRESETS.find((preset) => preset.id === backgroundId)
          ?.value ?? BACKGROUND_PRESETS[0].value)

  const fontStack =
    FONT_FAMILIES.find((item) => item.id === fontFamily)?.stack ??
    FONT_FAMILIES[0].stack

  useEffect(() => {
    try {
      const { html, background } = highlightCode(code || ' ', language, theme)
      setHighlightedHtml(html)
      setWindowBg(background)
      setHighlightError(null)
    } catch (error) {
      setHighlightError(
        error instanceof Error ? error.message : 'Highlight failed',
      )
    }
  }, [code, language, theme])

  async function exportPng() {
    const node = captureRef.current
    if (!node) {
      toast.error('Preview not ready')
      return
    }
    if (!code.trim()) {
      toast.error('Paste code first')
      return
    }

    setExporting(true)
    try {
      const dataUrl = await exportElementToPng(node, { pixelRatio: 2 })
      const safeName = (title.trim() || 'code')
        .replace(/[^\w.-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      downloadDataUrl(dataUrl, `${safeName || 'code-screenshot'}.png`)
      toast.success('PNG downloaded')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Export failed',
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="bg-card flex flex-col gap-3 rounded-xl border border-border/80 p-3 sm:p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="code-shot-source">Code</Label>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => setCode(SAMPLE_CODE)}
            >
              Sample
            </Button>
          </div>
          <Textarea
            id="code-shot-source"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            className="min-h-48 font-mono text-[0.85rem] leading-5"
            aria-label="Code source"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Label className="flex flex-col gap-1 font-normal">
            <span className="text-xs text-muted-foreground">Language</span>
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as LanguageId)
              }
              className={selectClass}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Label>
          <Label className="flex flex-col gap-1 font-normal">
            <span className="text-xs text-muted-foreground">Theme</span>
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value as ThemeId)}
              className={selectClass}
            >
              {THEMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Label>
          <Label className="flex flex-col gap-1 font-normal">
            <span className="text-xs text-muted-foreground">Window</span>
            <select
              value={chrome}
              onChange={(event) =>
                setChrome(event.target.value as WindowChrome)
              }
              className={selectClass}
            >
              {WINDOW_CHROMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Label>
          <Label className="flex flex-col gap-1 font-normal">
            <span className="text-xs text-muted-foreground">Font</span>
            <select
              value={fontFamily}
              onChange={(event) =>
                setFontFamily(event.target.value as FontFamilyId)
              }
              className={selectClass}
            >
              {FONT_FAMILIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Label>
        </div>

        <Label className="flex flex-col gap-1 font-normal">
          <span className="text-xs text-muted-foreground">Background</span>
          <select
            value={backgroundId}
            onChange={(event) => setBackgroundId(event.target.value)}
            className={selectClass}
          >
            {BACKGROUND_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
            <option value="custom">Custom color</option>
          </select>
        </Label>

        {backgroundId === 'custom' ? (
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={
                /^#[0-9a-fA-F]{6}$/.test(customBackground)
                  ? customBackground
                  : '#0f766e'
              }
              onChange={(event) => setCustomBackground(event.target.value)}
              className="h-8 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              aria-label="Custom background color"
            />
            <Input
              value={customBackground}
              onValueChange={setCustomBackground}
              spellCheck={false}
              className="font-mono text-[0.92rem]"
              aria-label="Custom background value"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label id="code-shot-padding-label">Padding</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {padding}px
            </span>
          </div>
          <Slider
            aria-labelledby="code-shot-padding-label"
            min={0}
            max={16}
            step={1}
            value={[padding]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') setPadding(next)
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label id="code-shot-font-size-label">Font size</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {fontSize}px
            </span>
          </div>
          <Slider
            aria-labelledby="code-shot-font-size-label"
            min={11}
            max={22}
            step={1}
            value={[fontSize]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') setFontSize(next)
            }}
          />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-0.5">
          <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
            <Checkbox
              checked={showLineNumbers}
              onCheckedChange={(checked) =>
                setShowLineNumbers(checked === true)
              }
              aria-label="Line numbers"
            />
            <span>Line numbers</span>
          </Label>
          <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
            <Checkbox
              checked={showTitle}
              onCheckedChange={(checked) => setShowTitle(checked === true)}
              aria-label="Window title"
            />
            <span>Title bar</span>
          </Label>
        </div>

        {showTitle ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code-shot-title">Filename</Label>
            <Input
              id="code-shot-title"
              value={title}
              onValueChange={setTitle}
              spellCheck={false}
              className="font-mono text-[0.92rem]"
            />
          </div>
        ) : null}

        {highlightError ? (
          <p className="m-0 text-sm text-destructive">{highlightError}</p>
        ) : null}

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button type="button" onClick={() => void exportPng()} disabled={exporting}>
            {exporting ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            {exporting ? 'Exporting…' : 'Download PNG'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCode('')
              setTitle('untitled')
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="overflow-auto rounded-xl border border-border/80 bg-muted/40 p-2 sm:p-3">
          <div className="mx-auto w-full max-w-full overflow-hidden rounded-lg border border-border/60">
          <div
            ref={captureRef}
            className="w-full max-w-full"
            style={{
              padding: `${padding}px`,
              background,
            }}
          >
            <div
              className="overflow-hidden rounded-xl border border-black/20"
              style={{ backgroundColor: windowBg }}
            >
              {chrome !== 'none' || showTitle ? (
                <div
                  className={cn(
                    'flex items-center gap-3 border-b border-white/5 px-3.5',
                    chrome === 'none' ? 'py-2' : 'py-2.5',
                  )}
                  style={{
                    backgroundColor: `color-mix(in srgb, ${windowBg} 92%, white 8%)`,
                  }}
                >
                  {chrome === 'macos' ? (
                    <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
                      <span className="size-3 rounded-full bg-[#ff5f57]" />
                      <span className="size-3 rounded-full bg-[#febc2e]" />
                      <span className="size-3 rounded-full bg-[#28c840]" />
                    </div>
                  ) : null}
                  {chrome === 'windows' ? (
                    <div
                      className="ml-auto flex shrink-0 items-center gap-3 text-[11px] text-white/55"
                      aria-hidden
                    >
                      <span>—</span>
                      <span>□</span>
                      <span>×</span>
                    </div>
                  ) : null}
                  {showTitle ? (
                    <div
                      className={cn(
                        'min-w-0 truncate font-mono text-[11px] tracking-wide text-white/55',
                        chrome === 'macos' && 'flex-1 text-center',
                        chrome === 'windows' && 'order-first flex-1',
                        chrome === 'none' && 'flex-1 text-center',
                      )}
                    >
                      {title || 'untitled'}
                    </div>
                  ) : chrome === 'macos' ? (
                    <div className="flex-1" />
                  ) : null}
                </div>
              ) : null}

              <div
                className={cn(
                  'code-shot-preview px-3 pb-3',
                  showLineNumbers && 'code-shot-lines',
                  chrome === 'none' && !showTitle && 'pt-3',
                )}
                style={{
                  fontFamily: fontStack,
                  fontSize: `${fontSize}px`,
                  lineHeight: DEFAULT_LINE_HEIGHT,
                }}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          </div>
          </div>
        </div>
      </div>

      <style>{`
        .code-shot-preview pre {
          margin: 0;
          padding: 0;
          background: transparent !important;
          overflow: visible;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .code-shot-preview code {
          display: block;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          white-space: inherit;
          overflow-wrap: inherit;
          word-break: inherit;
          counter-reset: code-line;
        }
        .code-shot-preview .line {
          display: block;
          min-height: ${DEFAULT_LINE_HEIGHT}em;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .code-shot-lines .line::before {
          counter-increment: code-line;
          content: counter(code-line);
          display: inline-block;
          width: 2.25em;
          margin-right: 1em;
          text-align: right;
          color: color-mix(in oklab, currentColor 35%, transparent);
          user-select: none;
          vertical-align: top;
        }
      `}</style>
    </div>
  )
}
