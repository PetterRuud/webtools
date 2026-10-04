import { useEffect, useState } from 'react'
import { CopyIcon, DownloadIcon } from 'lucide-react'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  SAMPLE_MARKDOWN,
  downloadTextFile,
  markdownToHtml,
  wrapHtmlDocument,
} from '#/lib/markdown'
import { cn } from 'cn'

type ViewMode = 'edit' | 'split' | 'preview' | 'html'

export function MarkdownTool() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN)
  const [view, setView] = useState<ViewMode>('split')
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (!source.trim()) {
      setHtml('')
      return
    }
    setHtml(markdownToHtml(source))
  }, [source])

  const charCount = source.length.toLocaleString()
  const hasSource = source.trim().length > 0

  function downloadHtml() {
    if (!hasSource) return
    downloadTextFile(
      'preview.html',
      wrapHtmlDocument(html, 'Markdown preview'),
      'text/html;charset=utf-8',
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['edit', 'Edit'],
              ['split', 'Split'],
              ['preview', 'Preview'],
              ['html', 'HTML'],
            ] as const
          ).map(([mode, label]) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={view === mode ? 'default' : 'outline'}
              onClick={() => setView(mode)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void copyText(source, 'Markdown')}
            disabled={!hasSource}
          >
            <CopyIcon data-icon="inline-start" />
            Copy MD
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void copyText(html, 'HTML')}
            disabled={!html}
          >
            <CopyIcon data-icon="inline-start" />
            Copy HTML
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={downloadHtml}
            disabled={!html}
          >
            <DownloadIcon data-icon="inline-start" />
            Download HTML
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSource(SAMPLE_MARKDOWN)}
          >
            Sample
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSource('')}
            disabled={!hasSource}
          >
            Clear
          </Button>
        </div>
      </div>

      {view === 'split' ? (
        <DualTextareas
          leftHeader={
            <>
              <Label htmlFor="md-input">Markdown</Label>
              <span className="text-xs text-muted-foreground">{charCount}</span>
            </>
          }
          rightHeader={<Label>Preview</Label>}
          left={
            <Textarea
              id="md-input"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              placeholder="Write Markdown…"
              className="min-h-[28rem] field-sizing-fixed flex-1 font-mono text-[0.85rem] leading-6"
            />
          }
          right={<PreviewPane html={html} empty={!hasSource} />}
        />
      ) : null}

      {view === 'edit' ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex h-8 items-center justify-between gap-2">
            <Label htmlFor="md-input-full">Markdown</Label>
            <span className="text-xs text-muted-foreground">{charCount}</span>
          </div>
          <Textarea
            id="md-input-full"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            placeholder="Write Markdown…"
            className="min-h-[32rem] field-sizing-fixed font-mono text-[0.85rem] leading-6"
          />
        </div>
      ) : null}

      {view === 'preview' ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex h-8 items-center">
            <Label>Preview</Label>
          </div>
          <PreviewPane html={html} empty={!hasSource} tall />
        </div>
      ) : null}

      {view === 'html' ? (
        <DualTextareas
          leftHeader={
            <>
              <Label htmlFor="md-input-html">Markdown</Label>
              <span className="text-xs text-muted-foreground">{charCount}</span>
            </>
          }
          rightHeader={
            <>
              <Label htmlFor="md-html-out">HTML</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void copyText(html, 'HTML')}
                disabled={!html}
              >
                <CopyIcon data-icon="inline-start" />
                Copy
              </Button>
            </>
          }
          left={
            <Textarea
              id="md-input-html"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              placeholder="Write Markdown…"
              className="min-h-[28rem] field-sizing-fixed flex-1 font-mono text-[0.85rem] leading-6"
            />
          }
          right={
            <Textarea
              id="md-html-out"
              value={html}
              readOnly
              spellCheck={false}
              placeholder={hasSource ? '' : 'Rendered HTML…'}
              className="min-h-[28rem] field-sizing-fixed flex-1 font-mono text-[0.8rem] leading-5"
            />
          }
        />
      ) : null}
    </div>
  )
}

function PreviewPane({
  html,
  empty,
  tall = false,
}: {
  html: string
  empty: boolean
  tall?: boolean
}) {
  return (
    <div
      className={cn(
        'skeuo-paper min-h-[28rem] flex-1 overflow-auto rounded-lg border border-border/80 px-4 py-3',
        tall && 'min-h-[32rem]',
      )}
    >
      {empty ? (
        <p className="m-0 text-sm text-muted-foreground">Preview…</p>
      ) : (
        <div
          className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-heading prose-pre:bg-muted/70 prose-code:before:content-none prose-code:after:content-none"
          dangerouslySetInnerHTML={{ __html: html }}
          suppressHydrationWarning
        />
      )}
    </div>
  )
}
