import { useState, type FormEvent } from 'react'
import { ClipboardCheckIcon, Loader2Icon } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import type { AuditSeverity, SeoAuditGrade } from '#/lib/seoAudit'
import { auditSeoFn } from '#/lib/seoFns'
import { cn } from 'cn'

type AuditResult = Awaited<ReturnType<typeof auditSeoFn>>

const SEVERITY_STYLE: Record<AuditSeverity, string> = {
  pass: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  warn: 'border-amber-500/35 bg-amber-500/15 text-amber-900 dark:text-amber-100',
  fail: 'border-destructive/40 bg-destructive/10 text-destructive',
  info: 'border-border bg-muted/50 text-muted-foreground',
}

const SEVERITY_BADGE: Record<AuditSeverity, string> = {
  pass: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-100',
  warn: 'bg-amber-500/20 text-amber-950 dark:text-amber-50',
  fail: 'bg-destructive/20 text-destructive',
  info: 'bg-muted text-muted-foreground',
}

const GRADE_STYLE: Record<
  SeoAuditGrade,
  { ring: string; score: string; label: string }
> = {
  excellent: {
    ring: 'border-emerald-500/40 bg-emerald-500/10',
    score: 'text-emerald-800 dark:text-emerald-200',
    label: 'Excellent',
  },
  good: {
    ring: 'border-sky-500/40 bg-sky-500/10',
    score: 'text-sky-800 dark:text-sky-200',
    label: 'Good',
  },
  fair: {
    ring: 'border-amber-500/40 bg-amber-500/10',
    score: 'text-amber-900 dark:text-amber-100',
    label: 'Fair',
  },
  poor: {
    ring: 'border-destructive/40 bg-destructive/10',
    score: 'text-destructive',
    label: 'Poor',
  },
}

export function SeoAuditTool() {
  const auditSeo = useServerFn(auditSeoFn)
  const [url, setUrl] = useState('https://example.com')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [filter, setFilter] = useState<AuditSeverity | 'all'>('all')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await auditSeo({ data: { url } })
      setResult(data)
      setFilter(data.summary.fail > 0 ? 'fail' : data.summary.warn > 0 ? 'warn' : 'all')
      toast.success(
        `Score ${data.score} · ${data.summary.fail} fail · ${data.summary.warn} warn · ${data.summary.pass} pass`,
      )
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Audit failed')
    } finally {
      setBusy(false)
    }
  }

  const visible =
    result?.issues.filter((issue) =>
      filter === 'all' ? true : issue.severity === filter,
    ) ?? []

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 lg:gap-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="seo-audit-url"
              className="text-xs font-normal text-muted-foreground"
            >
              Page URL
            </Label>
            <Input
              id="seo-audit-url"
              value={url}
              onValueChange={setUrl}
              placeholder="https://example.com"
              autoComplete="url"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-fit">
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <ClipboardCheckIcon data-icon="inline-start" />
            )}
            {busy ? 'Auditing…' : 'Run audit'}
          </Button>

          {result ? (
            <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="m-0 font-mono tabular-nums">{result.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Words</dt>
                <dd className="m-0 font-mono tabular-nums">{result.wordCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">H1s</dt>
                <dd className="m-0 font-mono tabular-nums">{result.h1Count}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Images / no alt</dt>
                <dd className="m-0 font-mono tabular-nums">
                  {result.imageCount} / {result.imagesMissingAlt}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Title</dt>
                <dd className="m-0 line-clamp-2 text-foreground">
                  {result.title || '—'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Canonical</dt>
                <dd className="m-0 break-all font-mono text-[0.7rem] text-foreground">
                  {result.canonical || '—'}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {error ? (
            <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {result ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={cn(
                    'flex size-16 shrink-0 flex-col items-center justify-center rounded-xl border',
                    GRADE_STYLE[result.grade].ring,
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-2xl font-semibold tabular-nums leading-none',
                      GRADE_STYLE[result.grade].score,
                    )}
                  >
                    {result.score}
                  </span>
                  <span className="mt-0.5 text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase">
                    /100
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p
                    className={cn(
                      'm-0 text-sm font-semibold',
                      GRADE_STYLE[result.grade].score,
                    )}
                  >
                    {GRADE_STYLE[result.grade].label}
                  </p>
                  <p className="m-0 break-all font-mono text-[0.75rem] text-foreground">
                    {result.finalUrl}
                  </p>
                  <p className="m-0 text-xs text-muted-foreground">
                    {result.summary.fail} fail · {result.summary.warn} warn ·{' '}
                    {result.summary.pass} pass
                    {result.summary.info
                      ? ` · ${result.summary.info} info`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'fail', label: 'Fail' },
                    { id: 'warn', label: 'Warn' },
                    { id: 'pass', label: 'Pass' },
                    { id: 'info', label: 'Info' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={
                      filter === item.id
                        ? 'inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground'
                        : 'inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  >
                    {item.label}
                    {item.id !== 'all' && result
                      ? ` ${result.summary[item.id]}`
                      : ''}
                  </button>
                ))}
              </div>

              <ul className="m-0 max-h-[36rem] list-none space-y-1.5 overflow-y-auto p-0">
                {visible.map((issue) => (
                  <li
                    key={issue.id}
                    className={cn(
                      'rounded-lg border px-3 py-2',
                      SEVERITY_STYLE[issue.severity],
                    )}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase',
                          SEVERITY_BADGE[issue.severity],
                        )}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                        {issue.category}
                      </span>
                    </div>
                    <p className="m-0 mt-1 text-sm font-medium text-foreground">
                      {issue.title}
                    </p>
                    <p className="m-0 mt-0.5 text-xs opacity-90">{issue.detail}</p>
                    {issue.value ? (
                      <p className="m-0 mt-1 line-clamp-2 break-all font-mono text-[0.7rem] opacity-80">
                        {issue.value}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {visible.length === 0 ? (
                <p className="m-0 text-sm text-muted-foreground">
                  No issues in this filter.
                </p>
              ) : null}
            </>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">
              Fetch a page and get prioritized technical / on-page SEO checks.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
