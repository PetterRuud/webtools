import { useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { CopyIcon, Loader2Icon, SearchIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { copyText } from '#/lib/clipboard'
import { lookupIpFn } from '#/lib/networkFns'

type IpResult = Awaited<ReturnType<typeof lookupIpFn>>

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/70 bg-card/40 px-3 py-2">
      <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="break-all font-mono text-sm text-ink">{value}</span>
    </div>
  )
}

export function IpLookupTool() {
  const lookupIp = useServerFn(lookupIpFn)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<IpResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function lookup(ip?: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await lookupIp({
        data: ip?.trim() ? { ip: ip.trim() } : {},
      })
      setResult(data)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void lookup()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial yours-IP lookup once
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ip-query">IP</Label>
          <Input
            id="ip-query"
            value={query}
            onValueChange={setQuery}
            placeholder="Leave empty for yours"
            spellCheck={false}
            autoComplete="off"
            className="font-mono"
            onKeyDown={(event) => {
              if (event.key === 'Enter') void lookup(query)
            }}
          />
        </div>
        <Button type="button" disabled={loading} onClick={() => void lookup(query)}>
          {loading ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <SearchIcon data-icon="inline-start" />
          )}
          Lookup
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => {
            setQuery('')
            void lookup()
          }}
        >
          Mine
        </Button>
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl text-ink">{result.ip}</span>
              {result.yours ? (
                <span className="rounded-md bg-mist px-1.5 py-0.5 text-[0.7rem] font-medium text-primary">
                  you
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyText(result.ip, 'IP')}
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </div>
          {result.note ? (
            <p className="m-0 text-sm text-muted-foreground">{result.note}</p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Type" value={result.type} />
            <Field label="Country" value={result.country ?? result.countryCode} />
            <Field label="Region" value={result.region} />
            <Field label="City" value={result.city} />
            <Field label="Postal" value={result.postal} />
            <Field label="Continent" value={result.continent} />
            <Field label="ASN" value={result.asn} />
            <Field label="Org" value={result.org} />
            <Field label="ISP" value={result.isp} />
            <Field label="Timezone" value={result.timezone} />
            <Field label="UTC" value={result.utcOffset} />
            <Field
              label="Coords"
              value={
                result.latitude != null && result.longitude != null
                  ? `${result.latitude}, ${result.longitude}`
                  : null
              }
            />
            <Field label="CF country" value={result.cfCountry} />
            <Field label="CF-Ray" value={result.cfRay} />
          </div>
        </div>
      ) : loading ? (
        <p className="m-0 text-sm text-muted-foreground">Looking up…</p>
      ) : null}
    </div>
  )
}
