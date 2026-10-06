import { useState, type FormEvent, type ReactNode } from 'react'
import { Loader2Icon, Share2Icon } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { hostnameOf, type OgPreviewFields } from '#/lib/ogPreview'
import { fetchPageMetaFn } from '#/lib/seoFns'
import { cn } from 'cn'

function CardShell({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
      <h2 className="m-0 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </h2>
      {children}
    </section>
  )
}

function FacebookCard({ fields }: { fields: OgPreviewFields }) {
  const host = hostnameOf(fields.url || 'https://example.com')
  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-background">
      {fields.image ? (
        <div className="aspect-[1.91/1] bg-muted">
          <img
            src={fields.image}
            alt=""
            className="size-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="flex aspect-[1.91/1] items-center justify-center bg-muted text-xs text-muted-foreground">
          No og:image
        </div>
      )}
      <div className="space-y-0.5 border-t border-border/60 bg-muted/40 px-3 py-2">
        <p className="m-0 truncate text-[0.7rem] tracking-wide text-muted-foreground uppercase">
          {host}
        </p>
        <p className="m-0 truncate text-sm font-semibold text-ink">
          {fields.title || 'Title'}
        </p>
        <p className="m-0 line-clamp-2 text-xs text-muted-foreground">
          {fields.description || 'Description'}
        </p>
      </div>
    </div>
  )
}

function XCard({ fields }: { fields: OgPreviewFields }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-background">
      {fields.image ? (
        <div className="aspect-[1.91/1] bg-muted">
          <img
            src={fields.image}
            alt=""
            className="size-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="flex aspect-[1.91/1] items-center justify-center bg-muted text-xs text-muted-foreground">
          No image
        </div>
      )}
      <div className="space-y-0.5 px-3 py-2">
        <p className="m-0 truncate text-sm font-semibold text-ink">
          {fields.title || 'Title'}
        </p>
        <p className="m-0 line-clamp-2 text-xs text-muted-foreground">
          {fields.description || 'Description'}
        </p>
        <p className="m-0 truncate text-xs text-muted-foreground">
          {hostnameOf(fields.url || 'https://example.com')}
        </p>
      </div>
    </div>
  )
}

function LinkedInCard({ fields }: { fields: OgPreviewFields }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-background">
      {fields.image ? (
        <div className="aspect-[1.91/1] bg-muted">
          <img
            src={fields.image}
            alt=""
            className="size-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="flex aspect-[1.91/1] items-center justify-center bg-muted text-xs text-muted-foreground">
          No image
        </div>
      )}
      <div className="space-y-0.5 px-3 py-2">
        <p className="m-0 truncate text-sm font-semibold text-ink">
          {fields.title || 'Title'}
        </p>
        <p className="m-0 truncate text-xs text-muted-foreground">
          {hostnameOf(fields.url || 'https://example.com')}
        </p>
      </div>
    </div>
  )
}

type MetaResult = Awaited<ReturnType<typeof fetchPageMetaFn>>

export function OgPreviewTool() {
  const fetchMeta = useServerFn(fetchPageMetaFn)
  const [url, setUrl] = useState('https://example.com')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MetaResult | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await fetchMeta({ data: { url } })
      setResult(data)
      toast.success('OG tags loaded')
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Fetch failed')
    } finally {
      setBusy(false)
    }
  }

  const fields = result?.fields

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 lg:gap-4">
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3 sm:flex-row sm:items-end sm:gap-3 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor="og-url" className="text-xs font-normal text-muted-foreground">
            URL
          </Label>
          <Input
            id="og-url"
            type="url"
            value={url}
            onValueChange={setUrl}
            placeholder="https://example.com"
            required
          />
        </div>
        <Button type="submit" disabled={busy || !url.trim()} className="shrink-0">
          {busy ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <Share2Icon data-icon="inline-start" />
          )}
          {busy ? 'Fetching…' : 'Preview'}
        </Button>
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {result ? (
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl border border-border/70 bg-card/40 p-3 text-sm sm:p-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="m-0 font-mono tabular-nums">{result.status ?? '—'}</dd>
          <dt className="text-muted-foreground">Final URL</dt>
          <dd className="m-0 truncate font-mono text-[0.8rem]">{result.finalUrl}</dd>
          <dt className="text-muted-foreground">Canonical</dt>
          <dd className="m-0 truncate font-mono text-[0.8rem]">
            {result.canonical || '—'}
          </dd>
          <dt className="text-muted-foreground">og:title</dt>
          <dd className="m-0 truncate">{fields?.title || '—'}</dd>
          <dt className="text-muted-foreground">og:description</dt>
          <dd className="m-0 line-clamp-2">{fields?.description || '—'}</dd>
          <dt className="text-muted-foreground">og:image</dt>
          <dd className="m-0 truncate font-mono text-[0.8rem]">
            {fields?.image || '—'}
          </dd>
          <dt className="text-muted-foreground">twitter:card</dt>
          <dd className="m-0 font-mono text-[0.8rem]">
            {fields?.twitterCard || '—'}
          </dd>
        </dl>
      ) : null}

      <div
        className={cn(
          'grid gap-3',
          fields ? 'md:grid-cols-3' : '',
        )}
      >
        {fields ? (
          <>
            <CardShell label="Facebook">
              <FacebookCard fields={fields} />
            </CardShell>
            <CardShell label="X">
              <XCard fields={fields} />
            </CardShell>
            <CardShell label="LinkedIn">
              <LinkedInCard fields={fields} />
            </CardShell>
          </>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">
            Fetch a URL to preview social cards.
          </p>
        )}
      </div>
    </form>
  )
}
