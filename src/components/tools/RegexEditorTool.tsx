import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

const FLAG_OPTIONS = [
  { id: 'g', label: 'g', hint: 'Global' },
  { id: 'i', label: 'i', hint: 'Ignore case' },
  { id: 'm', label: 'm', hint: 'Multiline' },
  { id: 's', label: 's', hint: 'DotAll' },
  { id: 'u', label: 'u', hint: 'Unicode' },
] as const

type FlagId = (typeof FLAG_OPTIONS)[number]['id']

type MatchInfo = {
  index: number
  text: string
  groups: string[]
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

function renderHighlighted(text: string, matches: MatchInfo[]): ReactNode {
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
    nodes.push(
      <mark
        key={`m-${i}`}
        className="rounded-sm bg-spark/45 px-0.5 text-ink dark:bg-spark/35 dark:text-foreground"
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

export function RegexEditorTool() {
  const [pattern, setPattern] = useState('\\b[A-Z][a-z]+\\b')
  const [testString, setTestString] = useState(
    'WebTools ships JSON, Regex, Base64, and Diff helpers.',
  )
  const [flags, setFlags] = useState<Record<FlagId, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  })

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

  function toggleFlag(id: FlagId) {
    setFlags((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="regex-pattern">Pattern</Label>
        <Input
          id="regex-pattern"
          value={pattern}
          onValueChange={setPattern}
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
        ) : (
          <p className="m-0 font-mono text-sm text-muted-foreground">
            /{pattern || '…'}/{flagString}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="regex-test">Test string</Label>
        <Textarea
          id="regex-test"
          value={testString}
          onChange={(event) => setTestString(event.target.value)}
          spellCheck={false}
          placeholder="Text to match against…"
          className="min-h-36 font-mono text-[0.9rem] leading-6"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading m-0 text-lg text-ink">Matches</h2>
          <p className="m-0 text-sm text-muted-foreground">
            {regexError
              ? 'Fix the pattern to run'
              : !pattern
                ? 'Enter a pattern'
                : !testString
                  ? 'Add a test string'
                  : `${matches.length} match${matches.length === 1 ? '' : 'es'}`}
          </p>
        </div>
        <div className="min-h-28 whitespace-pre-wrap rounded-xl border border-border bg-card/60 px-3 py-3 font-mono text-[0.9rem] leading-7 text-foreground">
          {regexError ? (
            <span className="text-destructive">Pattern error — highlights paused.</span>
          ) : (
            renderHighlighted(testString, matches)
          )}
        </div>
        {matches.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {matches.slice(0, 20).map((match, index) => (
              <li
                key={`${match.index}-${index}`}
                className="rounded-lg border border-border/70 px-3 py-2 text-sm"
              >
                <span className="font-mono text-ink">
                  [{match.index}] {match.text || '(empty)'}
                </span>
                {match.groups.length > 0 ? (
                  <span className="mt-1 block text-muted-foreground">
                    groups: {match.groups.map((g) => JSON.stringify(g)).join(', ')}
                  </span>
                ) : null}
              </li>
            ))}
            {matches.length > 20 ? (
              <li className="text-sm text-muted-foreground">
                Showing first 20 of {matches.length} matches.
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
