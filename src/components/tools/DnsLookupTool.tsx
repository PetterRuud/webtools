import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { lookupDnsFn } from '#/lib/networkFns'

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'CAA'] as const

type DnsResult = Awaited<ReturnType<typeof lookupDnsFn>>
type DnsRecord = DnsResult['answer'][number]

function RecordTable({ title, rows }: { title: string; rows: DnsRecord[] }) {
  if (rows.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-border/70">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted/50 text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">TTL</th>
              <th className="px-3 py-2 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.name}-${row.data}-${index}`} className="border-t border-border/60">
                <td className="px-3 py-2 font-mono text-[0.8rem]">{row.name}</td>
                <td className="px-3 py-2 font-mono text-[0.8rem] tabular-nums">{row.TTL}</td>
                <td className="px-3 py-2 break-all font-mono text-[0.8rem]">{row.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DnsLookupTool() {
  const lookupDns = useServerFn(lookupDnsFn)
  const [name, setName] = useState('cloudflare.com')
  const [type, setType] = useState<(typeof RECORD_TYPES)[number]>('A')
  const [result, setResult] = useState<DnsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function lookup() {
    const host = name.trim()
    if (!host) {
      setError('Enter a hostname')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await lookupDns({ data: { name: host, type } })
      setResult(data)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dns-name">Name</Label>
          <Input
            id="dns-name"
            value={name}
            onValueChange={setName}
            spellCheck={false}
            autoComplete="off"
            className="font-mono"
            onKeyDown={(event) => {
              if (event.key === 'Enter') void lookup()
            }}
          />
        </div>
        <Button type="button" disabled={loading} onClick={() => void lookup()}>
          {loading ? '…' : 'Lookup'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {RECORD_TYPES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setType(item)}
            className={
              type === item
                ? 'inline-flex h-7 items-center rounded-md bg-primary px-2.5 font-mono text-xs font-medium text-primary-foreground'
                : 'inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 font-mono text-xs text-muted-foreground hover:bg-muted hover:text-foreground'
            }
          >
            {item}
          </button>
        ))}
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
              <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                Status
              </p>
              <p className="m-0 font-mono text-sm text-ink">
                {result.statusText} ({result.status})
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
              <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                Query
              </p>
              <p className="m-0 break-all font-mono text-sm text-ink">
                {result.name} · {result.type}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
              <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                Resolver
              </p>
              <p className="m-0 font-mono text-sm text-ink">{result.resolver}</p>
            </div>
            {result.answer.length === 0 &&
            result.authority.length === 0 &&
            result.additional.length === 0 ? (
              <p className="m-0 text-sm text-muted-foreground">No records.</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            <RecordTable title="Answer" rows={result.answer} />
            <RecordTable title="Authority" rows={result.authority} />
            <RecordTable title="Additional" rows={result.additional} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
