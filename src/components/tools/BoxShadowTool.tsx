import { useMemo, useState } from 'react'
import { CopyIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { copyText } from '#/lib/clipboard'
import {
  DEFAULT_BOX_SHADOW,
  formatBoxShadowCss,
  formatBoxShadowValue,
  type BoxShadowParams,
} from '#/lib/boxShadow'

type NumericKey = 'offsetX' | 'offsetY' | 'blur' | 'spread' | 'opacity'

const SLIDERS: Array<{
  key: NumericKey
  label: string
  min: number
  max: number
  step: number
  format: (value: number) => string
}> = [
  {
    key: 'offsetX',
    label: 'Offset X',
    min: -50,
    max: 50,
    step: 1,
    format: (v) => `${v}px`,
  },
  {
    key: 'offsetY',
    label: 'Offset Y',
    min: -50,
    max: 50,
    step: 1,
    format: (v) => `${v}px`,
  },
  {
    key: 'blur',
    label: 'Blur',
    min: 0,
    max: 100,
    step: 1,
    format: (v) => `${v}px`,
  },
  {
    key: 'spread',
    label: 'Spread',
    min: -50,
    max: 50,
    step: 1,
    format: (v) => `${v}px`,
  },
  {
    key: 'opacity',
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    format: (v) => v.toFixed(2),
  },
]

export function BoxShadowTool() {
  const [params, setParams] = useState<BoxShadowParams>(DEFAULT_BOX_SHADOW)

  const cssValue = useMemo(() => formatBoxShadowValue(params), [params])
  const cssRule = useMemo(() => formatBoxShadowCss(params), [params])

  function update<K extends keyof BoxShadowParams>(
    key: K,
    value: BoxShadowParams[K],
  ) {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="skeuo-panel flex flex-col gap-3 rounded-xl border border-border/80 p-3 sm:p-4">
        {SLIDERS.map(({ key, label, min, max, step, format }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`shadow-${key}`}>{label}</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {format(params[key])}
              </span>
            </div>
            <Slider
              id={`shadow-${key}`}
              min={min}
              max={max}
              step={step}
              value={[params[key]]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value
                if (typeof next === 'number') update(key, next)
              }}
            />
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shadow-color">Color</Label>
          <div className="flex items-center gap-2">
            <input
              id="shadow-color"
              type="color"
              value={params.color}
              onChange={(event) => update('color', event.target.value)}
              className="h-8 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              aria-label="Shadow color"
            />
            <Input
              value={params.color}
              onValueChange={(value) => {
                if (/^#[0-9a-fA-F]{0,6}$/.test(value)) update('color', value)
              }}
              spellCheck={false}
              className="font-mono text-[0.92rem] uppercase"
              aria-label="Shadow color hex"
            />
          </div>
        </div>

        <label className="skeuo-metal flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-2.5 py-1.5 text-sm">
          <Checkbox
            checked={params.inset}
            onCheckedChange={(checked) => update('inset', checked === true)}
            aria-label="Inset shadow"
          />
          <span>Inset</span>
        </label>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button type="button" onClick={() => void copyText(cssRule, 'CSS')}>
            <CopyIcon data-icon="inline-start" />
            Copy CSS
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void copyText(cssValue, 'value')}
          >
            <CopyIcon data-icon="inline-start" />
            Copy value
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setParams(DEFAULT_BOX_SHADOW)}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className="skeuo-window relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-border p-8 sm:min-h-80"
          aria-label="Box shadow preview"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[repeating-conic-gradient(color-mix(in_oklch,var(--muted)_80%,transparent)_0%_25%,transparent_0%_50%)] bg-size-[16px_16px] opacity-70"
          />
          <div
            className="skeuo-emboss relative z-[1] flex size-36 items-center justify-center rounded-2xl border border-border/70 bg-card text-sm font-medium text-muted-foreground transition-[box-shadow] duration-200 ease-out sm:size-44"
            style={{ boxShadow: cssValue }}
          >
            Card
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shadow-css">CSS</Label>
          <div className="flex gap-2">
            <Input
              id="shadow-css"
              readOnly
              value={cssRule}
              spellCheck={false}
              className="font-mono text-[0.85rem]"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyText(cssRule, 'CSS')}
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
