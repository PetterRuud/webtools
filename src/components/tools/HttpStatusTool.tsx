import { useMemo, useState } from 'react'
import { Input } from '#/components/ui/input'
import {
  HTTP_STATUS_CLASSES,
  HTTP_STATUS_CODES,
  filterHttpStatusCodes,
  type HttpStatusClass,
} from '#/lib/httpStatus'

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
        {HTTP_STATUS_CLASSES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={klass === item.id}
            onClick={() => setKlass(item.id)}
            className={
              klass === item.id
                ? 'inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground'
                : 'inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-sm text-muted-foreground">
          No matches.
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2">
          {visible.map((item) => (
            <li
              key={item.code}
              className="rounded-lg border border-border/70 bg-card/40 px-3 py-2.5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-heading text-base text-ink">
                  <span className="font-mono tabular-nums">{item.code}</span>{' '}
                  {item.phrase}
                </span>
                <span className="shrink-0 text-[0.7rem] text-muted-foreground">
                  {item.class}
                </span>
              </div>
              <p className="mt-1 mb-0 text-sm leading-5 text-muted-foreground">
                {item.meaning}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
