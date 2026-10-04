import { useMemo, useState } from 'react'
import { CopyIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { copyText } from '#/lib/clipboard'
import {
  ALIGN_ITEMS,
  DEFAULT_FLEXBOX,
  FLEX_DIRECTIONS,
  FLEX_WRAPS,
  GAP_MAX,
  GAP_MIN,
  ITEM_COUNT_MAX,
  ITEM_COUNT_MIN,
  JUSTIFY_CONTENTS,
  buildFlexboxRule,
  shortLabel,
  type AlignItems,
  type FlexDirection,
  type FlexWrap,
  type FlexboxConfig,
  type JustifyContent,
} from '#/lib/flexbox'
const ITEM_HUES = [165, 75, 200, 25, 280, 140, 40, 320, 100, 220, 55, 185]

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  format = shortLabel,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (next: T) => void
  format?: (value: T) => string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const active = option === value
          return (
            <Button
              key={option}
              type="button"
              size="xs"
              variant={active ? 'default' : 'outline'}
              aria-pressed={active}
              onClick={() => onChange(option)}
              className="font-mono"
            >
              {format(option)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function FlexboxTool() {
  const [config, setConfig] = useState<FlexboxConfig>(DEFAULT_FLEXBOX)

  const css = useMemo(() => buildFlexboxRule(config), [config])

  function patch<K extends keyof FlexboxConfig>(key: K, value: FlexboxConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
        <OptionGroup
          label="Direction"
          value={config.flexDirection}
          options={FLEX_DIRECTIONS}
          onChange={(value: FlexDirection) => patch('flexDirection', value)}
          format={(value) => value}
        />
        <OptionGroup
          label="Wrap"
          value={config.flexWrap}
          options={FLEX_WRAPS}
          onChange={(value: FlexWrap) => patch('flexWrap', value)}
          format={(value) => value}
        />
        <OptionGroup
          label="Justify"
          value={config.justifyContent}
          options={JUSTIFY_CONTENTS}
          onChange={(value: JustifyContent) => patch('justifyContent', value)}
        />
        <OptionGroup
          label="Align"
          value={config.alignItems}
          options={ALIGN_ITEMS}
          onChange={(value: AlignItems) => patch('alignItems', value)}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="flex-gap">Gap</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {config.gap}px
            </span>
          </div>
          <Slider
            id="flex-gap"
            min={GAP_MIN}
            max={GAP_MAX}
            step={1}
            value={[config.gap]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') patch('gap', next)
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="flex-items">Items</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {config.itemCount}
            </span>
          </div>
          <Slider
            id="flex-items"
            min={ITEM_COUNT_MIN}
            max={ITEM_COUNT_MAX}
            step={1}
            value={[config.itemCount]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') patch('itemCount', next)
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className="min-h-56 rounded-xl border border-border bg-muted/40 p-3 transition-[background] duration-200 sm:min-h-72 sm:p-4"
          style={{
            display: 'flex',
            flexDirection: config.flexDirection,
            flexWrap: config.flexWrap,
            justifyContent: config.justifyContent,
            alignItems: config.alignItems,
            gap: `${config.gap}px`,
          }}
          aria-label="Flexbox preview"
        >
          {Array.from({ length: config.itemCount }, (_, index) => {
            const hue = ITEM_HUES[index % ITEM_HUES.length]
            const grow =
              config.alignItems === 'stretch' &&
              (config.flexDirection === 'row' ||
                config.flexDirection === 'row-reverse')
            return (
              <div
                key={index}
                className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-border/60 px-3 py-2 text-sm font-medium tabular-nums text-ink shadow-sm"
                style={{
                  background: `oklch(0.78 0.1 ${hue} / 0.55)`,
                  flex: grow ? '1 1 4.5rem' : '0 0 auto',
                  width:
                    config.flexDirection === 'column' ||
                    config.flexDirection === 'column-reverse'
                      ? undefined
                      : '4.5rem',
                  height:
                    config.flexDirection === 'column' ||
                    config.flexDirection === 'column-reverse'
                      ? '3rem'
                      : undefined,
                }}
              >
                {index + 1}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="flex-css">CSS</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyText(css, 'CSS')}
            >
              <CopyIcon data-icon="inline-start" />
              Copy CSS
            </Button>
          </div>
          <pre
            id="flex-css"
            className="m-0 overflow-x-auto rounded-lg border border-border/60 bg-background/70 p-3 font-mono text-xs leading-5 text-ink sm:text-sm"
          >
            {css}
          </pre>
        </div>
      </div>
    </div>
  )
}
