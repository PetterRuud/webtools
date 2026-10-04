import { CopyIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { copyText } from '#/lib/clipboard'
import {
  MIME_CATEGORIES,
  MIME_ENTRIES,
  filterMimeEntries,
  type MimeCategory,
} from '#/lib/mimeTypes'
import { cn } from '#/lib/utils'

type CategoryFilter = MimeCategory | 'all'

export function MimeLookupTool() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const visible = useMemo(
    () => filterMimeEntries(MIME_ENTRIES, { query, category }),
    [query, category],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <Input
          value={query}
          onValueChange={setQuery}
          placeholder="Extension, MIME, or label…"
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
        <p className="m-0 text-right text-xs text-muted-foreground tabular-nums md:min-w-20">
          {visible.length}/{MIME_ENTRIES.length}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="MIME category">
        {MIME_CATEGORIES.map((item) => {
          const selected = category === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setCategory(item.id)}
              className={cn(
                'inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-sm text-muted-foreground">
          No matches.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/80">
          <div className="hidden grid-cols-[7rem_minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-2 border-b border-border/70 bg-muted/40 px-3 py-1.5 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase md:grid">
            <span>Ext</span>
            <span>MIME</span>
            <span>Label</span>
            <span className="sr-only">Copy</span>
          </div>
          <ul className="m-0 max-h-[min(70vh,40rem)] list-none overflow-y-auto p-0">
            {visible.map((item) => (
              <li
                key={`${item.ext}-${item.mime}`}
                className="grid grid-cols-1 gap-1.5 border-b border-border/50 px-3 py-2 last:border-b-0 md:grid-cols-[7rem_minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center md:gap-2 md:py-1.5"
              >
                <button
                  type="button"
                  className="m-0 w-fit border-0 bg-transparent p-0 text-left font-mono text-sm font-medium text-ink hover:text-primary"
                  onClick={() => void copyText(`.${item.ext}`, 'extension')}
                  title="Copy extension"
                >
                  .{item.ext}
                </button>
                <button
                  type="button"
                  className="m-0 min-w-0 border-0 bg-transparent p-0 text-left font-mono text-xs break-all text-muted-foreground hover:text-foreground md:text-[0.8rem]"
                  onClick={() => void copyText(item.mime, 'MIME type')}
                  title="Copy MIME type"
                >
                  {item.mime}
                </button>
                <span className="text-sm text-muted-foreground md:truncate">
                  {item.label}
                  <span className="ml-1.5 text-[0.65rem] tracking-wide text-muted-foreground/80 uppercase md:hidden">
                    {item.category}
                  </span>
                </span>
                <div className="flex gap-1 md:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Copy ${item.mime}`}
                    onClick={() => void copyText(item.mime, 'MIME type')}
                  >
                    <CopyIcon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
