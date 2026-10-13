import { useState, type FormEvent } from 'react'
import { ArrowRightIcon, Loader2Icon, RouteIcon } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  HTTP_STATUS_CLASS_STYLES,
  type HttpStatusClass,
} from '#/lib/httpStatus'
import { checkRedirectsFn } from '#/lib/seoFns'
import { cn } from 'cn'

type RedirectResult = Awaited<ReturnType<typeof checkRedirectsFn>>

function statusClass(code: number): HttpStatusClass {
  if (code >= 500) return '5xx'
  if (code >= 400) return '4xx'
  if (code >= 300) return '3xx'
  if (code >= 200) return '2xx'
  return '1xx'
}

export function RedirectCheckerTool() {
  const checkRedirects = useServerFn(checkRedirectsFn)
  const [url, setUrl] = useState('https://example.com')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RedirectResult | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await checkRedirects({ data: { url } })
      setResult(data)
      toast.success(
        data.redirected
          ? `${data.hopCount} hop(s) · ${data.totalMs} ms`
          : `No redirect · ${data.totalMs} ms`,
      )
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Check failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 lg:gap-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="redirect-url"
              className="text-xs font-normal text-muted-foreground"
            >
              URL
            </Label>
            <Input
              id="redirect-url"
              value={url}
              onValueChange={setUrl}
              placeholder="https://example.com/old"
              autoComplete="url"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-fit">
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <RouteIcon data-icon="inline-start" />
            )}
            {busy ? 'Following…' : 'Follow redirects'}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {error ? (
            <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {result ? (
            <>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {result.hopCount} hop{result.hopCount === 1 ? '' : 's'}
                </span>
                <span className="font-mono tabular-nums">{result.totalMs} ms</span>
                <span>
                  {result.redirected ? 'Redirect chain' : 'Direct response'}
                </span>
              </div>

              <div className="rounded-xl border border-border/70 bg-card/40 px-3 py-2.5">
                <p className="m-0 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  Final destination
                </p>
                <p className="m-0 mt-0.5 break-all font-mono text-sm text-foreground">
                  {result.finalUrl}
                </p>
              </div>

              <ol className="m-0 list-none space-y-2 p-0">
                {result.hops.map((hop, index) => {
                  const klass =
                    hop.status > 0 ? statusClass(hop.status) : '5xx'
                  const styles = HTTP_STATUS_CLASS_STYLES[klass]
                  return (
                    <li key={`${hop.url}-${index}`} className="relative">
                      {index < result.hops.length - 1 ? (
                        <div
                          className="absolute top-9 left-4 flex h-[calc(100%-1.25rem)] items-start text-muted-foreground"
                          aria-hidden
                        >
                          <ArrowRightIcon className="mt-1 size-3.5 rotate-90 opacity-50" />
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          'rounded-lg border px-3 py-2',
                          hop.error
                            ? 'border-destructive/40 bg-destructive/10'
                            : styles.card,
                        )}
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-[0.65rem] font-medium text-muted-foreground tabular-nums">
                            #{index + 1}
                          </span>
                          {hop.status > 0 ? (
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tabular-nums',
                                styles.badge,
                              )}
                            >
                              {hop.status}
                            </span>
                          ) : (
                            <span className="rounded bg-destructive/20 px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold text-destructive">
                              ERR
                            </span>
                          )}
                          <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground">
                            {hop.ms} ms
                          </span>
                          {hop.redirected ? (
                            <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                              redirect
                            </span>
                          ) : null}
                        </div>
                        <p className="m-0 mt-1 break-all font-mono text-[0.75rem] text-foreground">
                          {hop.url}
                        </p>
                        {hop.location ? (
                          <p className="m-0 mt-0.5 break-all font-mono text-[0.7rem] text-muted-foreground">
                            → {hop.location}
                          </p>
                        ) : null}
                        {hop.error ? (
                          <p className="m-0 mt-1 text-xs text-destructive">
                            {hop.error}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">
              Enter a URL to walk the redirect chain with status and timing.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
