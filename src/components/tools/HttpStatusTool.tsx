import { useMemo, useState } from 'react'
import { Input } from '#/components/ui/input'
import {
  HTTP_STATUS_CLASSES,
  HTTP_STATUS_CLASS_STYLES,
  HTTP_STATUS_CODES,
  filterHttpStatusCodes,
  type HttpStatusClass,
} from '#/lib/httpStatus'
import { cn } from '#/lib/utils'

type ClassFilter = HttpStatusClass | 'all'

export function HttpStatusTool() {
  const [query, setQuery] = useState('')
  const [klass, setKlass] = useState<ClassFilter>('all')

  const visible = useMemo(
    () => filterHttpStatusCodes(HTTP_STATUS_CODES, { query, klass }),
    [query, klass],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search code, phrase…"
          spellCheck={false}
          autoComplete="off"
        />
        <p className="m-0 text-right text-xs text-muted-foreground tabular-nums md:min-w-20">
          {visible.length}/{HTTP_STATUS_CODES.length}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Status class">
        {HTTP_STATUS_CLASSES.map((item) => {
          const selected = klass === item.id
          const tones =
            item.id === 'all' ? null : HTTP_STATUS_CLASS_STYLES[item.id]

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setKlass(item.id)}
              className={cn(
                'inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors',
                item.id === 'all'
                  ? selected
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                  : selected
                    ? tones!.chipActive
                    : cn('bg-card/40', tones!.chip),
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
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2">
          {visible.map((item) => {
            const tones = HTTP_STATUS_CLASS_STYLES[item.class]
            return (
              <li
                key={item.code}
                className={cn(
                  'rounded-lg border px-3 py-2.5',
                  tones.card,
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-heading text-base text-foreground">
                    <span
                      className={cn(
                        'inline-block rounded-sm border border-border/60 px-1.5 py-0.5 font-mono text-[0.95rem] font-bold tabular-nums tracking-tight',
                        tones.code,
                      )}
                    >
                      {item.code}
                    </span>{' '}
                    {item.phrase}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide tabular-nums uppercase',
                      tones.badge,
                    )}
                  >
                    {item.class}
                  </span>
                </div>
                <p className="mt-1 mb-0 text-sm leading-5 text-muted-foreground">
                  {item.meaning}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
