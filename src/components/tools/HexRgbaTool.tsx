import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import {
  formatRgba,
  hexToRgba,
  normalizeHex,
  parseRgba,
  rgbaToHex,
  type Rgba,
} from '#/lib/color'

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Copied ${label}`)
  } catch {
    toast.error('Clipboard unavailable')
  }
}

export function HexRgbaTool() {
  const [hex, setHex] = useState('#2f6f66')
  const [rgbaText, setRgbaText] = useState('rgba(47, 111, 102, 1)')
  const [channels, setChannels] = useState<Rgba>({
    r: 47,
    g: 111,
    b: 102,
    a: 1,
  })
  const [hexError, setHexError] = useState<string | null>(null)
  const [rgbaError, setRgbaError] = useState<string | null>(null)

  const preview = useMemo(
    () => formatRgba(channels),
    [channels],
  )

  function applyRgba(next: Rgba) {
    setChannels(next)
    setHex(rgbaToHex(next))
    setRgbaText(formatRgba(next))
    setHexError(null)
    setRgbaError(null)
  }

  function onHexChange(value: string) {
    setHex(value)
    const parsed = hexToRgba(value)
    if (!parsed) {
      setHexError('Use #RGB, #RRGGBB, or #RRGGBBAA')
      return
    }
    setChannels(parsed)
    setRgbaText(formatRgba(parsed))
    setHexError(null)
    setRgbaError(null)
  }

  function onRgbaTextChange(value: string) {
    setRgbaText(value)
    const parsed = parseRgba(value)
    if (!parsed) {
      setRgbaError('Use rgba(r, g, b, a) or rgb(r, g, b)')
      return
    }
    setChannels(parsed)
    setHex(rgbaToHex(parsed))
    setHexError(null)
    setRgbaError(null)
  }

  function updateChannel(key: keyof Rgba, value: number) {
    applyRgba({ ...channels, [key]: value })
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        className="h-28 w-full rounded-2xl border border-border shadow-inner"
        style={{ background: preview }}
        aria-label="Color preview"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hex">Hex</Label>
          <div className="flex gap-2">
            <Input
              id="hex"
              value={hex}
              onValueChange={onHexChange}
              aria-invalid={Boolean(hexError)}
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const normalized = normalizeHex(hex)
                if (!normalized) {
                  toast.error('Fix the hex value first')
                  return
                }
                void copyText(normalized, 'hex')
              }}
            >
              Copy
            </Button>
          </div>
          {hexError ? (
            <p className="m-0 text-sm text-destructive">{hexError}</p>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">
              Accepts 3, 6, or 8 digit hex.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rgba">RGBA</Label>
          <div className="flex gap-2">
            <Input
              id="rgba"
              value={rgbaText}
              onChange={(e) => onRgbaTextChange(e.target.value)}
              aria-invalid={Boolean(rgbaError)}
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyText(formatRgba(channels), 'rgba')}
            >
              Copy
            </Button>
          </div>
          {rgbaError ? (
            <p className="m-0 text-sm text-destructive">{rgbaError}</p>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">
              Live CSS string for paste into stylesheets.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5">
        {(
          [
            ['r', 'Red', 255],
            ['g', 'Green', 255],
            ['b', 'Blue', 255],
            ['a', 'Alpha', 1],
          ] as const
        ).map(([key, label, max]) => (
          <div key={key} className="flex flex-col gap-2">
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
