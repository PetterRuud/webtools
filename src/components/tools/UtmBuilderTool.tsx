import { useMemo, useState } from 'react'
import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { copyText } from '#/lib/clipboard'
import {
  UTM_PRESETS,
  UTM_SAMPLE,
  buildUtmUrl,
  type UtmParams,
} from '#/lib/utmBuilder'
import { cn } from 'cn'

export function UtmBuilderTool() {
  const [params, setParams] = useState<UtmParams>(UTM_SAMPLE)

  const result = useMemo(() => buildUtmUrl(params), [params])

  function setField<K extends keyof UtmParams>(key: K, value: UtmParams[K]) {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  function applyPreset(id: string) {
    const preset = UTM_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setParams((prev) => ({
      ...prev,
      source: preset.source,
      medium: preset.medium,
    }))
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5">
          {UTM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                'inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground',
                params.source === preset.source &&
                  params.medium === preset.medium &&
                  'border-transparent bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {(
          [
            ['url', 'URL', 'https://example.com/page'],
            ['source', 'utm_source', 'google'],
            ['medium', 'utm_medium', 'cpc'],
            ['campaign', 'utm_campaign', 'spring-sale'],
            ['term', 'utm_term (optional)', 'keyword'],
            ['content', 'utm_content (optional)', 'header-cta'],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key} className="flex flex-col gap-1">
            <Label
              htmlFor={`utm-${key}`}
              className="text-xs font-normal text-muted-foreground"
            >
              {label}
            </Label>
            <Input
              id={`utm-${key}`}
              value={params[key]}
              onValueChange={(v) => setField(key, v)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
        <h2 className="m-0 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Result
        </h2>
        {result.error ? (
          <p className="m-0 text-sm text-destructive">{result.error}</p>
        ) : result.url ? (
          <>
            <p className="m-0 break-all font-mono text-sm text-foreground">{result.url}</p>
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={async () => {
                await copyText(result.url)
                toast.success('URL copied')
              }}
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">Enter a URL.</p>
        )}
      </div>
    </div>
  )
}
