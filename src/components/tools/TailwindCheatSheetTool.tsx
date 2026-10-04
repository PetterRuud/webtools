import { useMemo, useState } from 'react'
import { Input } from '#/components/ui/input'
import { copyText } from '#/lib/clipboard'
import {
  TAILWIND_CATEGORIES,
  TAILWIND_UTILITIES,
  filterTailwindUtilities,
  groupUtilitiesByCategory,
  type CategoryFilter,
} from '#/lib/tailwindCheatSheet'
import { cn } from '#/lib/utils'

export function TailwindCheatSheetTool() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const visible = useMemo(
    () => filterTailwindUtilities(TAILWIND_UTILITIES, { query, category }),
    [query, category],
  )

  const groups = useMemo(() => groupUtilitiesByCategory(visible), [visible])

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search class, CSS, keyword…"
          spellCheck={false}
          autoComplete="off"
          aria-label="Search Tailwind utilities"
        />
        <p className="m-0 text-right text-xs text-muted-foreground tabular-nums md:min-w-24">
          {visible.length}/{TAILWIND_UTILITIES.length}
        </p>
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Utility category"
      >
        {TAILWIND_CATEGORIES.map((item) => {
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

      {groups.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-sm text-muted-foreground">
          No matches.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <section key={group.category.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-heading m-0 text-sm font-medium text-ink">
                  {group.category.label}
                </h2>
                <span className="text-[0.65rem] tabular-nums text-muted-foreground">
                  {group.utilities.length}
                </span>
              </div>
              <ul className="m-0 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {group.utilities.map((item) => (
                  <li key={`${item.category}-${item.className}`}>
                    <button
                      type="button"
                      onClick={() => copyText(item.className, item.className)}
                      className="group flex w-full items-start gap-2 rounded-md border border-border/70 bg-card/30 px-2.5 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      title="Copy class"
                    >
                      <code className="font-mono text-[0.8rem] leading-5 font-medium text-ink break-all">
                        {item.className}
                      </code>
                      <span className="min-w-0 flex-1 text-right text-[0.7rem] leading-4 text-muted-foreground">
                        {item.css}
                        {item.note ? (
                          <span className="mt-0.5 block text-[0.65rem] text-muted-foreground/80">
                            {item.note}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
