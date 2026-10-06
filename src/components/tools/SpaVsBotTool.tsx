import { useState, type FormEvent } from 'react'
import { GitCompareArrowsIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import type { CompareResult, ViewSnapshot } from '#/lib/spaVsBot'
import { cn } from 'cn'

const SAMPLE = 'https://example.com'

function SnapshotPanel({
  label,
  mode,
  snapshot,
  emptyHint,
}: {
  label: string
  mode?: string | null
  snapshot: ViewSnapshot | null
  emptyHint?: string | null
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </h2>
        {mode ? (
          <span className="rounded-md border border-border/80 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
            {mode}
          </span>
        ) : null}
      </div>

      {!snapshot ? (
        <p className="m-0 text-sm text-muted-foreground">
          {emptyHint ?? '—'}
        </p>
      ) : (
        <>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Title</dt>
            <dd className="m-0 truncate font-medium" title={snapshot.title}>
              {snapshot.title || '(none)'}
            </dd>
            <dt className="text-muted-foreground">Links</dt>
            <dd className="m-0 font-mono tabular-nums">{snapshot.linkCount}</dd>
            <dt className="text-muted-foreground">HTML</dt>
            <dd className="m-0 font-mono tabular-nums">
              {snapshot.htmlBytes.toLocaleString()} B
            </dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="m-0 font-mono tabular-nums">
              {snapshot.status ?? '—'}
            </dd>
          </dl>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-muted-foreground">
              Text snapshot
            </Label>
            <Textarea
              readOnly
              value={snapshot.text || '(empty)'}
              className="min-h-40 font-mono text-xs leading-relaxed"
            />
          </div>
        </>
      )}
    </section>
  )
}

export function SpaVsBotTool() {
  const [url, setUrl] = useState(SAMPLE)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompareResult | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/spa-vs-bot/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        let msg = res.statusText
        try {
          const j = (await res.json()) as { error?: string }
          if (j.error) msg = j.error
        } catch {
          /* ignore */
        }
        throw new Error(msg)
      }
      const data = (await res.json()) as CompareResult
      setResult(data)
      if (data.jsMode === 'unavailable') {
        toast.message('No-JS ready · JS view unavailable')
      } else {
        toast.success('Compare ready')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compare failed')
    } finally {
      setBusy(false)
    }
  }

  const delta =
    result?.withJs && result.noJs
      ? {
          text: result.withJs.text.length - result.noJs.text.length,
          links: result.withJs.linkCount - result.noJs.linkCount,
          html: result.withJs.htmlBytes - result.noJs.htmlBytes,
        }
      : null

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 lg:gap-4"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3 sm:flex-row sm:items-end sm:gap-3 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label
            htmlFor="spa-vs-bot-url"
            className="text-xs font-normal text-muted-foreground"
          >
            URL
          </Label>
          <Input
            id="spa-vs-bot-url"
            type="url"
            value={url}
            placeholder="https://example.com"
            onValueChange={setUrl}
            required
          />
        </div>
        <Button type="submit" disabled={busy || !url.trim()} className="shrink-0">
          {busy ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <GitCompareArrowsIcon data-icon="inline-start" />
          )}
          {busy ? 'Comparing…' : 'Compare'}
        </Button>
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {result ? (
        <div
          className={cn(
            'flex flex-wrap items-center gap-2 text-sm',
            result.likelySpa === true && 'text-amber-600 dark:text-amber-400',
          )}
        >
          <span className="rounded-md border border-border/80 px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
            {result.likelySpa === true
              ? 'likely SPA / thin SSR'
              : result.likelySpa === false
                ? 'similar content'
                : 'JS pending'}
          </span>
          {delta ? (
            <span className="font-mono text-[0.7rem] text-muted-foreground">
              Δ text {delta.text >= 0 ? '+' : ''}
              {delta.text} · Δ links {delta.links >= 0 ? '+' : ''}
              {delta.links} · Δ HTML {delta.html >= 0 ? '+' : ''}
              {delta.html.toLocaleString()} B
            </span>
          ) : null}
          {result.jsError ? (
            <span className="text-[0.75rem] text-muted-foreground">
              {result.jsError}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <SnapshotPanel
          label="No-JS (bot / raw HTTP)"
          mode="raw-fetch"
          snapshot={result?.noJs ?? null}
          emptyHint="Fetch to see crawler view"
        />
        <SnapshotPanel
          label="With JS (rendered)"
          mode={result?.jsMode ?? null}
          snapshot={result?.withJs ?? null}
          emptyHint={
            result?.jsError ??
            'Fetch to see JS-rendered view (Chrome / Browser Rendering)'
          }
        />
      </div>
    </form>
  )
}
