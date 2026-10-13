import { CheckIcon, CopyIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { copyText } from '#/lib/clipboard'
import {
  DEFAULT_GIT_PARAMS,
  GIT_CATEGORIES,
  GIT_CATEGORY_STYLES,
  GIT_COMMANDS,
  HEAD_PRESETS,
  SINCE_PRESETS,
  buildGitCommand,
  filterGitCommands,
  groupCommandsByCategory,
  type CategoryFilter,
  type GitCategoryId,
  type GitCommandParams,
} from '#/lib/gitCommands'
import { cn } from '#/lib/utils'

export function GitCommandsTool() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [params, setParams] = useState<GitCommandParams>(DEFAULT_GIT_PARAMS)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const visible = useMemo(
    () => filterGitCommands(GIT_COMMANDS, query, category),
    [query, category],
  )

  const groups = useMemo(() => groupCommandsByCategory(visible), [visible])

  const sincePresetActive = SINCE_PRESETS.some(
    (preset) => preset.value === params.since,
  )

  async function copyCommand(id: string, command: string) {
    await copyText(command, 'command')
    setCopiedId(id)
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current))
    }, 1200)
  }

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:items-start md:gap-4">
      <aside className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/30 p-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="git-search" className="text-xs text-muted-foreground">
            Search
          </Label>
          <Input
            id="git-search"
            value={query}
            onValueChange={setQuery}
            placeholder="reflog, stash, bisect…"
            spellCheck={false}
            autoComplete="off"
          />
          <p className="m-0 text-right text-[0.65rem] tabular-nums text-muted-foreground">
            {visible.length}/{GIT_COMMANDS.length}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Since</Label>
          <div className="flex flex-wrap gap-1">
            {SINCE_PRESETS.map((preset) => {
              const selected = params.since === preset.value
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setParams((prev) => ({ ...prev, since: preset.value }))
                  }
                  className={cn(
                    'inline-flex h-7 items-center rounded-md border px-2 text-[0.7rem] font-medium transition-colors',
                    selected
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
          <Input
            value={params.since}
            onValueChange={(since) => setParams((prev) => ({ ...prev, since }))}
            placeholder="1 year ago"
            spellCheck={false}
            autoComplete="off"
            aria-label="Custom since value"
            className={cn(!sincePresetActive && 'border-primary/50')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Head</Label>
          <div className="flex flex-wrap gap-1">
            {HEAD_PRESETS.map((head) => {
              const selected = params.head === head
              return (
                <button
                  key={head}
                  type="button"
                  onClick={() => setParams((prev) => ({ ...prev, head }))}
                  className={cn(
                    'inline-flex h-7 min-w-10 items-center justify-center rounded-md border px-2 font-mono text-[0.7rem] font-medium tabular-nums transition-colors',
                    selected
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {head}
                </button>
              )
            })}
          </div>
          <Input
            type="number"
            min={1}
            max={500}
            value={String(params.head)}
            onValueChange={(value) => {
              const next = Number(value)
              if (!Number.isFinite(next)) return
              setParams((prev) => ({
                ...prev,
                head: Math.min(500, Math.max(1, Math.floor(next))),
              }))
            }}
            aria-label="Head count"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bug-grep" className="text-xs text-muted-foreground">
            Bug grep
          </Label>
          <Input
            id="bug-grep"
            value={params.bugGrep}
            onValueChange={(bugGrep) =>
              setParams((prev) => ({ ...prev, bugGrep }))
            }
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fire-grep" className="text-xs text-muted-foreground">
            Firefight grep
          </Label>
          <Input
            id="fire-grep"
            value={params.fireGrep}
            onValueChange={(fireGrep) =>
              setParams((prev) => ({ ...prev, fireGrep }))
            }
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-xs"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start px-2 text-xs text-muted-foreground"
          onClick={() => setParams(DEFAULT_GIT_PARAMS)}
        >
          Reset params
        </Button>
      </aside>

      <div className="flex min-w-0 flex-col gap-3">
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Command category"
        >
          {GIT_CATEGORIES.map((item) => {
            const selected = category === item.id
            const tones =
              item.id === 'all'
                ? null
                : GIT_CATEGORY_STYLES[item.id as GitCategoryId]

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setCategory(item.id)}
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

        {groups.length === 0 ? (
          <p className="m-0 rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-sm text-muted-foreground">
            No matches.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => {
              const tones = GIT_CATEGORY_STYLES[group.category.id as GitCategoryId]
              return (
                <section key={group.category.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2
                      className={cn(
                        'font-heading m-0 text-[0.8rem] font-semibold tracking-wide uppercase',
                        tones.heading,
                      )}
                    >
                      {group.category.label}
                    </h2>
                    <span className="text-[0.65rem] tabular-nums text-muted-foreground">
                      {group.commands.length}
                    </span>
                  </div>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {group.commands.map((item) => {
                      const command = buildGitCommand(item.id, params)
                      const copied = copiedId === item.id
                      return (
                        <li
                          key={item.id}
                          className={cn(
                            'rounded-lg border border-border/70 border-l-[3px] bg-card/30 px-3 py-2.5',
                            tones.rail,
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-heading m-0 text-sm font-semibold tracking-tight text-foreground">
                                {item.title}
                              </h3>
                              <p className="m-0 mt-0.5 text-xs leading-4 text-muted-foreground">
                                {item.blurb}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0 gap-1.5"
                              onClick={() => copyCommand(item.id, command)}
                            >
                              {copied ? (
                                <CheckIcon className="size-3.5" aria-hidden />
                              ) : (
                                <CopyIcon className="size-3.5" aria-hidden />
                              )}
                              Copy
                            </Button>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyCommand(item.id, command)}
                            className="mt-2 block w-full rounded-md border border-border/60 bg-muted/35 px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-muted/55 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            title="Copy command"
                          >
                            <code className="font-mono text-[0.78rem] leading-5 break-all text-emerald-800 dark:text-emerald-300">
                              {command}
                            </code>
                          </button>
                          {item.params.length > 0 ? (
                            <p className="m-0 mt-1.5 text-[0.65rem] text-muted-foreground/80">
                              Uses{' '}
                              {item.params
                                .map((param) =>
                                  param === 'bugGrep'
                                    ? 'bug grep'
                                    : param === 'fireGrep'
                                      ? 'firefight grep'
                                      : param,
                                )
                                .join(' · ')}
                            </p>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
