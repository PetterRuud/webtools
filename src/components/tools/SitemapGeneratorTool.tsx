import { useMemo, useState } from 'react'
import { CopyIcon, DownloadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  CHANGE_FREQS,
  PRIORITIES,
  buildSitemapXml,
  downloadSitemapXml,
  parseUrlLines,
  sampleSitemapUrls,
  todayLastmod,
  type ChangeFreq,
} from '#/lib/sitemap'

export function SitemapGeneratorTool() {
  const [urls, setUrls] = useState(sampleSitemapUrls)
  const [baseUrl, setBaseUrl] = useState('https://example.com')
  const [lastmod, setLastmod] = useState(todayLastmod)
  const [includeLastmod, setIncludeLastmod] = useState(true)
  const [changefreq, setChangefreq] = useState<ChangeFreq | ''>('weekly')
  const [priority, setPriority] = useState<string>('0.5')

  const parsed = useMemo(() => parseUrlLines(urls, baseUrl), [urls, baseUrl])

  const result = useMemo(() => {
    if (parsed.baseError) {
      return { xml: '', error: parsed.baseError }
    }
    if (!urls.trim()) {
      return { xml: '', error: null as string | null }
    }
    if (parsed.locs.length === 0) {
      return {
        xml: '',
        error: parsed.errors[0] ?? 'No valid URLs',
      }
    }
    try {
      return {
        xml: buildSitemapXml(parsed.locs, {
          lastmod: includeLastmod ? lastmod : null,
          changefreq,
          priority: priority === '' ? null : priority,
        }),
        error: null as string | null,
      }
    } catch (err) {
      return {
        xml: '',
        error: err instanceof Error ? err.message : 'Could not build sitemap',
      }
    }
  }, [
    parsed,
    urls,
    includeLastmod,
    lastmod,
    changefreq,
    priority,
  ])

  function clearAll() {
    setUrls('')
    setBaseUrl('')
  }

  function download() {
    if (!result.xml) {
      toast.error('Nothing to download')
      return
    }
    downloadSitemapXml(result.xml)
    toast.success('Downloaded sitemap.xml')
  }

  const invalidCount = parsed.lines.filter((line) => line.error).length

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label htmlFor="sitemap-base">Base URL</Label>
          <Input
            id="sitemap-base"
            value={baseUrl}
            onValueChange={setBaseUrl}
            placeholder="https://example.com"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(parsed.baseError)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex h-5 items-center justify-between gap-2">
            <Label htmlFor="sitemap-lastmod">lastmod</Label>
            <button
              type="button"
              className="text-[0.7rem] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              onClick={() => setIncludeLastmod((value) => !value)}
            >
              {includeLastmod ? 'On' : 'Off'}
            </button>
          </div>
          <Input
            id="sitemap-lastmod"
            value={lastmod}
            onValueChange={setLastmod}
            disabled={!includeLastmod}
            placeholder="YYYY-MM-DD"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="sitemap-changefreq">changefreq</Label>
            <select
              id="sitemap-changefreq"
              value={changefreq}
              onChange={(event) =>
                setChangefreq(event.target.value as ChangeFreq | '')
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">—</option>
              {CHANGE_FREQS.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="sitemap-priority">priority</Label>
            <select
              id="sitemap-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">—</option>
              {PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setUrls(sampleSitemapUrls())}
        >
          Sample
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setLastmod(todayLastmod())}
          disabled={!includeLastmod}
        >
          Today
        </Button>
        <p className="m-0 ml-auto text-xs text-muted-foreground tabular-nums">
          {parsed.locs.length} url{parsed.locs.length === 1 ? '' : 's'}
          {invalidCount > 0 ? ` · ${invalidCount} issue` : ''}
        </p>
      </div>

      <DualTextareas
        leftHeader={<Label htmlFor="sitemap-urls">URLs</Label>}
        rightHeader={
          <>
            <Label htmlFor="sitemap-xml">sitemap.xml</Label>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!result.xml}
                onClick={() => void copyText(result.xml, 'sitemap.xml')}
              >
                <CopyIcon data-icon="inline-start" />
                Copy
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!result.xml}
                onClick={download}
              >
                <DownloadIcon data-icon="inline-start" />
                Download
              </Button>
            </div>
          </>
        }
        left={
          <Textarea
            id="sitemap-urls"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
            spellCheck={false}
            placeholder={'https://example.com/\n/about\n/blog'}
            className="min-h-72 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
            aria-invalid={Boolean(result.error) && !result.xml}
          />
        }
        right={
          <Textarea
            id="sitemap-xml"
            value={result.xml}
            readOnly
            spellCheck={false}
            placeholder={
              !urls.trim()
                ? 'Paste URLs…'
                : result.error
                  ? 'Fix input…'
                  : ''
            }
            className="min-h-72 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
      />

      {result.error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </p>
      ) : parsed.errors.length > 0 ? (
        <p className="m-0 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Skipped {parsed.errors.length} line
          {parsed.errors.length === 1 ? '' : 's'}: {parsed.errors[0]}
          {parsed.errors.length > 1 ? ` (+${parsed.errors.length - 1} more)` : ''}
        </p>
      ) : null}
    </div>
  )
}
