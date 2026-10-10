import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import {
  RegexGroupLegend,
  RegexHighlightField,
} from '#/components/tools/RegexHighlightField'
import { RegexPatternField } from '#/components/tools/RegexPatternField'
import {
  breakdownRegex,
  matchCoverage,
  tokenKindStyle,
} from '#/lib/regexBreakdown'
import {
  REGEX_GROUP_ACTIVE_RING,
  buildHighlightSegments,
  collectRegexMatches,
  groupBgClass,
  type RegexMatchInfo,
} from '#/lib/regexHighlight'
import {
  COMMON_REGEX_PATTERNS,
  type CommonRegexPattern,
  type RegexFlagId,
} from '#/lib/regexPatterns'
import { cn } from '#/lib/utils'

const FLAG_OPTIONS = [
  { id: 'g', label: 'g', hint: 'Global' },
  { id: 'i', label: 'i', hint: 'Ignore case' },
  { id: 'm', label: 'm', hint: 'Multiline' },
  { id: 's', label: 's', hint: 'DotAll' },
  { id: 'u', label: 'u', hint: 'Unicode' },
] as const satisfies ReadonlyArray<{ id: RegexFlagId; label: string; hint: string }>

function emptyFlags(): Record<RegexFlagId, boolean> {
  return { g: true, i: false, m: false, s: false, u: false }
}

function flagsFromList(list: RegexFlagId[]): Record<RegexFlagId, boolean> {
  const next = emptyFlags()
  for (const id of Object.keys(next) as RegexFlagId[]) {
    next[id] = false
  }
  for (const id of list) next[id] = true
  return next
}

function buildRegex(pattern: string, flags: string): RegExp | null {
  if (!pattern) return null
  try {
    return new RegExp(pattern, flags)
  } catch {
    return null
  }
}

function renderHighlighted(
  text: string,
  matches: RegexMatchInfo[],
  activeIndex: number | null,
): ReactNode {
  if (!text) {
    return <span className="text-muted-foreground">Add a test string…</span>
  }
  if (matches.length === 0) {
    return <span>{text}</span>
  }

  const segments = buildHighlightSegments(matches)
  const nodes: ReactNode[] = []
  let cursor = 0
  segments.forEach((segment, i) => {
    if (segment.start > cursor) {
      nodes.push(<span key={`t-${i}`}>{text.slice(cursor, segment.start)}</span>)
    }
    const active = activeIndex === segment.matchIndex
    nodes.push(
      <mark
        key={`m-${i}-${segment.start}`}
        className={cn(
          'rounded-sm px-0.5 text-ink dark:text-foreground',
          groupBgClass(segment.group),
          active && REGEX_GROUP_ACTIVE_RING,
        )}
      >
        {text.slice(segment.start, segment.end) || '∅'}
      </mark>,
    )
    cursor = segment.end
  })
  if (cursor < text.length) {
    nodes.push(<span key="tail">{text.slice(cursor)}</span>)
  }
  return nodes
}

function formatGroups(groups: Array<string | undefined>): ReactNode {
  const parts = groups
    .map((value, index) => {
      if (value === undefined) return null
      return (
        <span key={index} className="inline-flex items-center gap-1">
          <span
            className={cn(
              'inline-block size-1.5 rounded-sm',
              groupBgClass(index + 1),
            )}
            aria-hidden
          />
          <span>
            ${index + 1}: {JSON.stringify(value)}
          </span>
        </span>
      )
    })
    .filter(Boolean)
  if (parts.length === 0) return null
  return (
    <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[0.7rem] text-muted-foreground">
      {parts}
    </span>
  )
}

export function RegexEditorTool() {
  const [pattern, setPattern] = useState('\\b([A-Z][a-z]+)\\b')
  const [testString, setTestString] = useState(
    'WebTools ships JSON, Regex, Base64, and Diff helpers.',
  )
  const [flags, setFlags] = useState<Record<RegexFlagId, boolean>>(emptyFlags)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [activeMatch, setActiveMatch] = useState<number | null>(null)

  const flagString = FLAG_OPTIONS.filter((flag) => flags[flag.id])
    .map((flag) => flag.id)
    .join('')

  const regexError = useMemo(() => {
    if (!pattern) return null
    try {
      void new RegExp(pattern, flagString)
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Invalid regular expression'
    }
  }, [flagString, pattern])

  const regex = useMemo(
    () => (regexError ? null : buildRegex(pattern, flagString)),
    [flagString, pattern, regexError],
  )

  const matches = useMemo(
    () => (regex && testString ? collectRegexMatches(regex, testString) : []),
    [regex, testString],
  )

  const tokens = useMemo(() => breakdownRegex(pattern), [pattern])
  const coverage = useMemo(
    () => matchCoverage(testString, matches),
    [matches, testString],
  )

  function toggleFlag(id: RegexFlagId) {
    setActivePresetId(null)
    setFlags((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function applyPreset(preset: CommonRegexPattern) {
    setPattern(preset.pattern)
    setFlags(flagsFromList(preset.flags))
    setTestString(preset.sample)
    setActivePresetId(preset.id)
    setActiveMatch(null)
  }

  const matchSummary = regexError
    ? 'Fix pattern'
    : !pattern
      ? '—'
      : !testString
        ? '—'
        : `${matches.length} match${matches.length === 1 ? '' : 'es'}${
            matches.length > 0
              ? ` · ${coverage.covered}/${coverage.total} (${coverage.percent}%)`
              : ''
          }`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {COMMON_REGEX_PATTERNS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            size="sm"
            variant={activePresetId === preset.id ? 'default' : 'outline'}
            title={preset.description}
            onClick={() => applyPreset(preset)}
            aria-pressed={activePresetId === preset.id}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Label htmlFor="regex-pattern">Pattern</Label>
              <p className="m-0 font-mono text-xs text-muted-foreground">
                /{pattern || '…'}/{flagString}
              </p>
            </div>
            <RegexPatternField
              id="regex-pattern"
              value={pattern}
              onValueChange={(value) => {
                setActivePresetId(null)
                setPattern(value)
              }}
              placeholder="Regular expression"
              aria-invalid={Boolean(regexError)}
            />
            <div className="flex flex-wrap gap-1.5">
              {FLAG_OPTIONS.map((flag) => (
                <Button
                  key={flag.id}
                  type="button"
                  size="sm"
                  variant={flags[flag.id] ? 'default' : 'outline'}
                  onClick={() => toggleFlag(flag.id)}
                  title={flag.hint}
                  aria-pressed={flags[flag.id]}
                >
                  {flag.label}
                </Button>
              ))}
            </div>
            {regexError ? (
              <p className="m-0 text-sm text-destructive">{regexError}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Label htmlFor="regex-test">Test string</Label>
              <RegexGroupLegend matches={matches} />
            </div>
            <RegexHighlightField
              id="regex-test"
              value={testString}
              matches={matches}
              activeMatch={activeMatch}
              onValueChange={(value) => {
                setActivePresetId(null)
                setActiveMatch(null)
                setTestString(value)
              }}
              placeholder="Text to match…"
              aria-invalid={Boolean(regexError)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <section className="flex flex-col gap-1.5" aria-label="Pattern breakdown">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
                Breakdown
              </h2>
              <p className="m-0 text-xs text-muted-foreground">
                {!pattern
                  ? '—'
                  : `${tokens.length} token${tokens.length === 1 ? '' : 's'}`}
              </p>
            </div>
            {!pattern ? (
              <p className="m-0 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
                Tokens appear as you type.
              </p>
            ) : (
              <ol className="m-0 grid max-h-48 list-none gap-1.5 overflow-y-auto p-0 sm:grid-cols-2 lg:max-h-56">
                {tokens.map((token, index) => (
                  <li
                    key={`${token.text}-${index}`}
                    className="flex min-w-0 items-start gap-2 rounded-md border border-border/70 bg-card/50 px-2 py-1.5"
                  >
                    <code
                      className={cn(
                        'shrink-0 rounded border px-1 py-0.5 font-mono text-[0.75rem]',
                        tokenKindStyle(token.kind),
                      )}
                    >
                      {token.text}
                    </code>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-ink">
                        {token.label}
                      </span>
                      <span className="block text-[0.7rem] leading-4 text-muted-foreground">
                        {token.meaning}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="flex flex-col gap-1.5" aria-label="Matches">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
                Matches
              </h2>
              <p className="m-0 text-xs text-muted-foreground">{matchSummary}</p>
            </div>

            <div className="min-h-24 whitespace-pre-wrap rounded-lg border border-border bg-card/60 px-3 py-2 font-mono text-[0.85rem] leading-6 text-foreground">
              {regexError ? (
                <span className="text-destructive">Pattern error</span>
              ) : (
                renderHighlighted(testString, matches, activeMatch)
              )}
            </div>

            {matches.length > 0 ? (
              <ul className="m-0 flex max-h-52 list-none flex-col gap-1 overflow-y-auto p-0">
                {matches.slice(0, 40).map((match, index) => {
                  const groups = formatGroups(match.groups)
                  const selected = activeMatch === index
                  return (
                    <li key={`${match.index}-${index}`}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMatch((prev) => (prev === index ? null : index))
                        }
                        className={cn(
                          'flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition-colors',
                          selected
                            ? 'border-spark/70 bg-spark/15'
                            : 'border-border/70 bg-transparent hover:bg-muted/40',
                        )}
                      >
                        <span className="mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-muted px-1 font-mono text-[0.65rem] text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-mono text-sm text-ink">
                            <mark
                              className={cn(
                                'rounded-sm px-0.5',
                                groupBgClass(0),
                              )}
                            >
                              {match.text || '(empty)'}
                            </mark>
                            <span className="ml-2 text-muted-foreground">
                              @{match.index}
                            </span>
                          </span>
                          {groups}
                        </span>
                      </button>
                    </li>
                  )
                })}
                {matches.length > 40 ? (
                  <li className="text-xs text-muted-foreground">
                    First 40 of {matches.length}
                  </li>
                ) : null}
              </ul>
            ) : !regexError && pattern && testString ? (
              <p className="m-0 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                No matches
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
