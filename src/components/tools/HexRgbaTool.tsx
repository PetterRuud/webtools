import { useMemo, useState } from 'react'
import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import {
  COLOR_FORMAT_META,
  formatColor,
  formatRgba,
  parseColor,
  rgbaToHex,
  type ColorFormat,
  type Rgba,
} from '#/lib/color'

const FORMATS: ColorFormat[] = ['hex', 'rgba', 'hsl', 'hwb', 'oklch']

const DEFAULT_COLOR: Rgba = { r: 47, g: 111, b: 102, a: 1 }

function draftsFromColor(color: Rgba): Record<ColorFormat, string> {
  return {
    hex: rgbaToHex(color),
    rgba: formatColor('rgba', color),
    hsl: formatColor('hsl', color),
    hwb: formatColor('hwb', color),
    oklch: formatColor('oklch', color),
  }
}

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Copied ${label}`)
  } catch {
    toast.error('Clipboard unavailable')
  }
}

export function HexRgbaTool() {
  const [channels, setChannels] = useState<Rgba>(DEFAULT_COLOR)
  const [drafts, setDrafts] = useState(() => draftsFromColor(DEFAULT_COLOR))
  const [errors, setErrors] = useState<Partial<Record<ColorFormat, string>>>({})

  const preview = useMemo(() => formatRgba(channels), [channels])

  function applyColor(next: Rgba, source?: ColorFormat) {
    const formatted = draftsFromColor(next)
    setChannels(next)
    setDrafts((prev) => ({
      ...formatted,
      ...(source ? { [source]: prev[source] } : {}),
    }))
    setErrors({})
  }

  function onFormatChange(format: ColorFormat, value: string) {
    setDrafts((prev) => ({ ...prev, [format]: value }))
    const parsed = parseColor(format, value)
    if (!parsed) {
      setErrors((prev) => ({
        ...prev,
        [format]: COLOR_FORMAT_META[format].error,
      }))
      return
    }
    applyColor(parsed, format)
  }

  function updateChannel(key: keyof Rgba, value: number) {
    applyColor({ ...channels, [key]: value })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-border/80 p-2">
          <div
            className="h-24 w-full rounded-lg border border-black/10 transition-[background] duration-300 ease-out sm:h-28"
            style={{ background: preview }}
            aria-label="Color preview"
          />
          <p className="m-0 mt-2 text-center font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
            Swatch
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FORMATS.map((format) => {
            const meta = COLOR_FORMAT_META[format]
            const error = errors[format]
            return (
              <div key={format} className="flex flex-col gap-1">
                <Label htmlFor={`color-${format}`}>{meta.label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={`color-${format}`}
                    value={drafts[format]}
                    onValueChange={(value) => onFormatChange(format, value)}
                    aria-invalid={Boolean(error)}
                    spellCheck={false}
                    className="font-mono text-[0.92rem]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (errors[format] || !parseColor(format, drafts[format])) {
                        toast.error(`Fix ${meta.label} first`)
                        return
                      }
                      void copyText(formatColor(format, channels), meta.label)
                    }}
                  >
                    <CopyIcon data-icon="inline-start" />
                    Copy
                  </Button>
                </div>
                {error ? (
                  <p className="m-0 text-xs text-destructive">{error}</p>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-card flex flex-col gap-4 rounded-xl border border-border/80 p-3 sm:p-4">
        <p className="m-0 text-sm font-medium text-ink">Channels</p>
        {(
          [
            ['r', 'Red', 255],
            ['g', 'Green', 255],
            ['b', 'Blue', 255],
            ['a', 'Alpha', 1],
          ] as const
        ).map(([key, label, max]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`channel-${key}`}>{label}</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {key === 'a' ? channels.a.toFixed(2) : Math.round(channels[key])}
              </span>
            </div>
            <Slider
              id={`channel-${key}`}
              min={0}
              max={max}
              step={key === 'a' ? 0.01 : 1}
              value={[channels[key]]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') updateChannel(key, next)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
