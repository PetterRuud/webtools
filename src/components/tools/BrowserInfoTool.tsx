import { useEffect, useState } from 'react'
import { Button } from '#/components/ui/button'
import { copyText } from '#/lib/clipboard'
import { cn } from '#/lib/utils'

type InfoRow = { label: string; value: string }

function booleanValueClass(value: string): string | undefined {
  if (value === 'true') return 'text-emerald-800 dark:text-emerald-300'
  if (value === 'false') return 'text-red-800 dark:text-red-300'
  return undefined
}

function collect(): InfoRow[] {
  const nav = navigator
  const conn = (
    nav as Navigator & {
      connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean }
      deviceMemory?: number
      userAgentData?: { brands?: Array<{ brand: string; version: string }>; mobile?: boolean; platform?: string }
    }
  ).connection
  const uaData = (nav as Navigator & { userAgentData?: { brands?: Array<{ brand: string; version: string }>; mobile?: boolean; platform?: string } }).userAgentData
  const memory = (nav as Navigator & { deviceMemory?: number }).deviceMemory

  let localStorageOk = false
  let sessionStorageOk = false
  try {
    localStorageOk = Boolean(window.localStorage)
    window.localStorage.setItem('__wt', '1')
    window.localStorage.removeItem('__wt')
  } catch {
    localStorageOk = false
  }
  try {
    sessionStorageOk = Boolean(window.sessionStorage)
    window.sessionStorage.setItem('__wt', '1')
    window.sessionStorage.removeItem('__wt')
  } catch {
    sessionStorageOk = false
  }

  const rows: InfoRow[] = [
    { label: 'User agent', value: nav.userAgent },
    { label: 'Platform', value: uaData?.platform || nav.platform || '—' },
    { label: 'Languages', value: nav.languages?.join(', ') || nav.language || '—' },
    { label: 'Language', value: nav.language || '—' },
    { label: 'Cookies', value: String(nav.cookieEnabled) },
    { label: 'Online', value: String(nav.onLine) },
    { label: 'Do Not Track', value: nav.doNotTrack ?? '—' },
    { label: 'Hardware concurrency', value: String(nav.hardwareConcurrency ?? '—') },
    { label: 'Device memory (GB)', value: memory != null ? String(memory) : '—' },
    { label: 'Max touch points', value: String(nav.maxTouchPoints ?? 0) },
    { label: 'Viewport', value: `${window.innerWidth} × ${window.innerHeight}` },
    { label: 'Screen', value: `${window.screen.width} × ${window.screen.height}` },
    {
      label: 'Avail screen',
      value: `${window.screen.availWidth} × ${window.screen.availHeight}`,
    },
    { label: 'Color depth', value: String(window.screen.colorDepth) },
    { label: 'Pixel ratio', value: String(window.devicePixelRatio) },
    { label: 'Timezone', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
    { label: 'Locale', value: Intl.DateTimeFormat().resolvedOptions().locale },
    { label: 'localStorage', value: String(localStorageOk) },
    { label: 'sessionStorage', value: String(sessionStorageOk) },
    { label: 'indexedDB', value: String(Boolean(window.indexedDB)) },
    { label: 'serviceWorker', value: String('serviceWorker' in nav) },
    { label: 'WebGL', value: String(!!document.createElement('canvas').getContext('webgl')) },
  ]

  if (uaData?.brands?.length) {
    rows.splice(1, 0, {
      label: 'UA brands',
      value: uaData.brands.map((b) => `${b.brand} ${b.version}`).join(', '),
    })
    rows.splice(2, 0, { label: 'Mobile UA', value: String(Boolean(uaData.mobile)) })
  }

  if (conn) {
    rows.push(
      { label: 'Network type', value: conn.effectiveType ?? '—' },
      { label: 'Downlink (Mb/s)', value: conn.downlink != null ? String(conn.downlink) : '—' },
      { label: 'RTT (ms)', value: conn.rtt != null ? String(conn.rtt) : '—' },
      { label: 'Save data', value: String(Boolean(conn.saveData)) },
    )
  }

  return rows
}

export function BrowserInfoTool() {
  const [rows, setRows] = useState<InfoRow[]>([])

  useEffect(() => {
    const refresh = () => setRows(collect())
    refresh()
    window.addEventListener('resize', refresh)
    return () => window.removeEventListener('resize', refresh)
  }, [])

  const asText = rows.map((row) => `${row.label}: ${row.value}`).join('\n')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={rows.length === 0}
          onClick={() => void copyText(asText, 'browser info')}
        >
          Copy all
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 rounded-lg border border-border/70 bg-card/40 px-3 py-2"
          >
            <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
              {row.label}
            </span>
            <span
              className={cn(
                'break-all font-mono text-[0.8rem] leading-5 text-ink',
                booleanValueClass(row.value),
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
