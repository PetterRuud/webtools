import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { breakdownRegex, matchCoverage } from '#/lib/regexBreakdown'
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

type MatchInfo = {
  index: number
  text: string
  groups: Array<string | undefined>
}

const KIND_STYLES: Record<string, string> = {
  group: 'border-primary/30 bg-primary/10 text-primary',
  class: 'border-spark/40 bg-spark/20 text-ink dark:text-foreground',
  escape: 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200',
  quantifier: 'border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200',
  anchor: 'border-amber-500/35 bg-amber-500/15 text-amber-900 dark:text-amber-100',
  literal: 'border-border bg-muted/50 text-foreground',
  meta: 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200',
  flag: 'border-border bg-muted/50 text-foreground',
  unknown: 'border-destructive/40 bg-destructive/10 text-destructive',
}

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

function collectMatches(regex: RegExp, text: string): MatchInfo[] {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`
  const global = new RegExp(regex.source, flags)
  const matches: MatchInfo[] = []
  let match: RegExpExecArray | null
  let guard = 0
  while ((match = global.exec(text)) !== null) {
    matches.push({
      index: match.index,
      text: match[0],
      groups: match.slice(1),
    })
    if (match[0].length === 0) {
      global.lastIndex += 1
    }
    guard += 1
    if (guard > 5000) break
  }
  return matches
}

function renderHighlighted(
  text: string,
  matches: MatchInfo[],
  activeIndex: number | null,
): ReactNode {
  if (!text) {
    return (
      <span className="text-muted-foreground">Type a test string to see matches.</span>
    )
  }
  if (matches.length === 0) {
    return <span>{text}</span>
  }

  const nodes: ReactNode[] = []
  let cursor = 0
  matches.forEach((match, i) => {
    if (match.index > cursor) {
      nodes.push(<span key={`t-${i}`}>{text.slice(cursor, match.index)}</span>)
    }
    const active = activeIndex === i
    nodes.push(
      <mark
        key={`m-${i}`}
        className={cn(
          'rounded-sm px-0.5 text-ink dark:text-foreground',
          active
            ? 'bg-spark ring-2 ring-spark/60'
            : 'bg-spark/45 dark:bg-spark/35',
        )}
      >
        {match.text || '∅'}
      </mark>,
    )
    cursor = match.index + match.text.length
  })
  if (cursor < text.length) {
    nodes.push(<span key="tail">{text.slice(cursor)}</span>)
  }
  return nodes
}

function formatGroups(groups: Array<string | undefined>): string | null {
  const parts = groups
    .map((value, index) => {
      if (value === undefined) return null
      return `$${index + 1}: ${JSON.stringify(value)}`
    })
    .filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

export function RegexEditorTool() {
  const [pattern, setPattern] = useState('\\b[A-Z][a-z]+\\b')
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
    () => (regex && testString ? collectMatches(regex, testString) : []),
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Label htmlFor="regex-pattern">Pattern</Label>
          <p className="m-0 font-mono text-xs text-muted-foreground">
            /{pattern || '…'}/{flagString}
          </p>
        </div>
        <Input
          id="regex-pattern"
          value={pattern}
          onValueChange={(value) => {
            setActivePresetId(null)
            setPattern(value)
          }}
          spellCheck={false}
          placeholder="Enter a regular expression"
          className="font-mono text-[0.92rem]"
          aria-invalid={Boolean(regexError)}
        />
        <div className="flex flex-wrap gap-2 pt-1">
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
              <span className="ml-1 text-[0.7rem] opacity-70">{flag.hint}</span>
            </Button>
          ))}
        </div>
        {regexError ? (
          <p className="m-0 text-sm text-destructive">{regexError}</p>
        ) : null}
      </div>

      <section className="flex flex-col gap-2" aria-label="Common patterns">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
            Common patterns
          </h2>
          <p className="m-0 text-xs text-muted-foreground">Click to fill pattern & sample</p>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </section>

      <section className="flex flex-col gap-3" aria-label="Pattern breakdown">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading m-0 text-lg text-ink">Breakdown</h2>
          <p className="m-0 text-sm text-muted-foreground">
            {!pattern
              ? 'Enter a pattern'
              : `${tokens.length} token${tokens.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {!pattern ? (
          <p className="m-0 rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            Tokens appear here as you edit the pattern.
          </p>
        ) : (
          <ol className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {tokens.map((token, index) => (
              <li
                key={`${token.text}-${index}`}
                className="flex min-w-0 items-start gap-3 rounded-lg border border-border/70 bg-card/50 px-3 py-2"
              >
                <code
                  className={cn(
                    'shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[0.8rem]',
                    KIND_STYLES[token.kind] ?? KIND_STYLES.literal,
                  )}
                >
                  {token.text}
                </code>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{token.label}</span>
                  <span className="block text-xs leading-5 text-muted-foreground">
                    {token.meaning}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <Label htmlFor="regex-test">Test string</Label>
        <Textarea
          id="regex-test"
          value={testString}
          onChange={(event) => {
            setActivePresetId(null)
            setActiveMatch(null)
            setTestString(event.target.value)
          }}
          spellCheck={false}
          placeholder="Text to match against…"
          className="min-h-36 font-mono text-[0.9rem] leading-6"
        />
      </div>

      <section className="flex flex-col gap-3" aria-label="Matches">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-heading m-0 text-lg text-ink">Matches</h2>
          <p className="m-0 text-sm text-muted-foreground">
            {regexError
              ? 'Fix the pattern to run'
              : !pattern
                ? 'Enter a pattern'
                : !testString
                  ? 'Add a test string'
                  : `${matches.length} match${matches.length === 1 ? '' : 'es'}${
                      matches.length > 0
                        ? ` · ${coverage.covered}/${coverage.total} chars (${coverage.percent}%)`
                        : ''
                    }`}
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Highlight
          </p>
          <div className="min-h-28 whitespace-pre-wrap rounded-xl border border-border bg-card/60 px-3 py-3 font-mono text-[0.9rem] leading-7 text-foreground">
            {regexError ? (
              <span className="text-destructive">Pattern error — highlights paused.</span>
            ) : (
              renderHighlighted(testString, matches, activeMatch)
            )}
          </div>
        </div>

        {matches.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
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
                      'flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'border-spark/70 bg-spark/15'
                        : 'border-border/70 bg-transparent hover:bg-muted/40',
                    )}
                  >
                    <span className="mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-muted px-1.5 font-mono text-[0.7rem] text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-mono text-ink">
                        {match.text || '(empty)'}
                        <span className="ml-2 text-muted-foreground">@{match.index}</span>
                      </span>
                      {groups ? (
                        <span className="mt-1 block font-mono text-xs text-muted-foreground">
                          [{groups}]
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
            {matches.length > 40 ? (
              <li className="text-sm text-muted-foreground">
                Showing first 40 of {matches.length} matches.
              </li>
            ) : null}
          </ul>
        ) : !regexError && pattern && testString ? (
          <p className="m-0 rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
            No matches in the test string.
          </p>
        ) : null}
      </section>
    </div>
  )
}
