export type RegexTokenKind =
  | 'group'
  | 'class'
  | 'escape'
  | 'quantifier'
  | 'anchor'
  | 'literal'
  | 'meta'
  | 'flag'
  | 'unknown'

export type RegexToken = {
  text: string
  label: string
  meaning: string
  kind: RegexTokenKind
}

/** Chip styles for the Breakdown list (border + bg + text). */
export const REGEX_TOKEN_KIND_STYLES: Record<RegexTokenKind, string> = {
  group: 'border-primary/30 bg-primary/10 text-primary',
  class: 'border-spark/40 bg-spark/20 text-ink dark:text-foreground',
  escape: 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200',
  quantifier:
    'border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200',
  anchor: 'border-amber-500/35 bg-amber-500/15 text-amber-900 dark:text-amber-100',
  literal: 'border-border bg-muted/50 text-foreground',
  meta: 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200',
  flag: 'border-border bg-muted/50 text-foreground',
  unknown: 'border-destructive/40 bg-destructive/10 text-destructive',
}

/**
 * Inline styles for the pattern input overlay — same palette as chips, but no
 * border/padding so character metrics stay aligned with the transparent input.
 */
export const REGEX_TOKEN_KIND_INLINE: Record<RegexTokenKind, string> = {
  group: 'bg-primary/10 text-primary',
  class: 'bg-spark/20 text-ink dark:text-foreground',
  escape: 'bg-sky-500/10 text-sky-800 dark:text-sky-200',
  quantifier: 'bg-violet-500/10 text-violet-800 dark:text-violet-200',
  anchor: 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
  literal: 'text-foreground',
  meta: 'bg-rose-500/10 text-rose-800 dark:text-rose-200',
  flag: 'text-foreground',
  unknown: 'bg-destructive/10 text-destructive',
}

export function tokenKindStyle(kind: RegexTokenKind): string {
  return REGEX_TOKEN_KIND_STYLES[kind] ?? REGEX_TOKEN_KIND_STYLES.literal
}

export function tokenKindInlineStyle(kind: RegexTokenKind): string {
  return REGEX_TOKEN_KIND_INLINE[kind] ?? REGEX_TOKEN_KIND_INLINE.literal
}

const ESCAPE_MEANINGS: Record<string, { label: string; meaning: string }> = {
  d: { label: 'Digit', meaning: 'Matches any digit [0-9]' },
  D: { label: 'Non-digit', meaning: 'Matches any non-digit' },
  w: { label: 'Word', meaning: 'Matches a word character [A-Za-z0-9_]' },
  W: { label: 'Non-word', meaning: 'Matches a non-word character' },
  s: { label: 'Whitespace', meaning: 'Matches a whitespace character' },
  S: { label: 'Non-whitespace', meaning: 'Matches a non-whitespace character' },
  b: { label: 'Word boundary', meaning: 'Matches a word boundary' },
  B: { label: 'Non-boundary', meaning: 'Matches where a word boundary does not' },
  n: { label: 'Newline', meaning: 'Matches a newline (\\n)' },
  r: { label: 'Carriage return', meaning: 'Matches a carriage return (\\r)' },
  t: { label: 'Tab', meaning: 'Matches a tab (\\t)' },
  f: { label: 'Form feed', meaning: 'Matches a form feed (\\f)' },
  v: { label: 'Vertical tab', meaning: 'Matches a vertical tab (\\v)' },
  '0': { label: 'NUL', meaning: 'Matches a null character' },
}

function describeEscape(escaped: string): { label: string; meaning: string; kind: RegexToken['kind'] } {
  if (ESCAPE_MEANINGS[escaped]) {
    const kind =
      escaped === 'b' || escaped === 'B' ? ('anchor' as const) : ('escape' as const)
    return { ...ESCAPE_MEANINGS[escaped], kind }
  }
  if (/^[1-9]$/.test(escaped)) {
    return {
      label: 'Backreference',
      meaning: `Refers to capturing group ${escaped}`,
      kind: 'meta',
    }
  }
  if (escaped === '') {
    return {
      label: 'Escape',
      meaning: 'Incomplete escape sequence',
      kind: 'unknown',
    }
  }
  return {
    label: 'Escaped',
    meaning: `Matches the literal character "${escaped}"`,
    kind: 'literal',
  }
}

function describeQuantifier(text: string): { label: string; meaning: string } {
  if (text === '*') return { label: 'Quantifier', meaning: 'Repeat 0 or more times' }
  if (text === '+') return { label: 'Quantifier', meaning: 'Repeat 1 or more times' }
  if (text === '?') return { label: 'Optional', meaning: 'Match 0 or 1 time' }
  if (text.endsWith('}?') || text.endsWith('+?') || text.endsWith('*?') || text.endsWith('??')) {
    return { label: 'Lazy quantifier', meaning: `Lazy: ${text}` }
  }
  const range = text.match(/^\{(\d+)(?:,(\d*))?\}(\?)?$/)
  if (range) {
    const min = range[1]
    const max = range[2]
    const lazy = range[3] ? ' (lazy)' : ''
    if (max === undefined) {
      return { label: 'Quantifier', meaning: `Repeat exactly ${min} time${min === '1' ? '' : 's'}${lazy}` }
    }
    if (max === '') {
      return { label: 'Quantifier', meaning: `Repeat ${min} or more times${lazy}` }
    }
    return { label: 'Quantifier', meaning: `Repeat between ${min} and ${max} times${lazy}` }
  }
  return { label: 'Quantifier', meaning: `Repeat ${text}` }
}

function readUntil(pattern: string, start: number, endChar: string): number {
  let i = start
  let depth = 0
  while (i < pattern.length) {
    const ch = pattern[i]
    if (ch === '\\') {
      i += 2
      continue
    }
    if (endChar === ']' && ch === ']' && i > start) return i
    if (endChar === ')') {
      if (ch === '(') depth += 1
      if (ch === ')') {
        if (depth === 0) return i
        depth -= 1
      }
    }
    i += 1
  }
  return -1
}

function describeGroupOpen(prefix: string): { label: string; meaning: string } {
  if (prefix === '(?:') {
    return { label: 'Non-capturing group', meaning: 'Groups without capturing' }
  }
  if (prefix === '(?=') {
    return { label: 'Lookahead', meaning: 'Positive lookahead — assert what follows' }
  }
  if (prefix === '(?!') {
    return { label: 'Negative lookahead', meaning: 'Negative lookahead — assert what does not follow' }
  }
  if (prefix === '(?<=') {
    return { label: 'Lookbehind', meaning: 'Positive lookbehind — assert what precedes' }
  }
  if (prefix === '(?<!') {
    return { label: 'Negative lookbehind', meaning: 'Negative lookbehind — assert what does not precede' }
  }
  const named = prefix.match(/^\(\?<([^>]+)>/)
  if (named) {
    return {
      label: 'Named group',
      meaning: `Capturing group named "${named[1]}"`,
    }
  }
  if (prefix.startsWith('(?')) {
    return { label: 'Group', meaning: 'Special group construct' }
  }
  return { label: 'Capturing group', meaning: 'Starts a capturing group' }
}

/**
 * Split a regex pattern into readable tokens with short explanations.
 * Best-effort for teaching/debugging — not a full ECMAScript grammar.
 */
export function breakdownRegex(pattern: string): RegexToken[] {
  if (!pattern) return []

  const tokens: RegexToken[] = []
  let i = 0

  while (i < pattern.length) {
    const ch = pattern[i]

    if (ch === '\\') {
      const next = pattern[i + 1] ?? ''
      if (next === 'x' && /^[0-9a-fA-F]{2}/.test(pattern.slice(i + 2))) {
        const hex = pattern.slice(i, i + 4)
        tokens.push({
          text: hex,
          label: 'Hex escape',
          meaning: `Matches the character with code ${hex.slice(2)}`,
          kind: 'escape',
        })
        i += 4
        continue
      }
      if (next === 'u' && /^[0-9a-fA-F]{4}/.test(pattern.slice(i + 2))) {
        const uni = pattern.slice(i, i + 6)
        tokens.push({
          text: uni,
          label: 'Unicode escape',
          meaning: `Matches the Unicode code point ${uni.slice(2)}`,
          kind: 'escape',
        })
        i += 6
        continue
      }
      if (next === 'u' && pattern[i + 2] === '{') {
        const end = pattern.indexOf('}', i + 3)
        if (end !== -1) {
          const uni = pattern.slice(i, end + 1)
          tokens.push({
            text: uni,
            label: 'Unicode escape',
            meaning: `Matches the Unicode code point ${uni.slice(3, -1)}`,
            kind: 'escape',
          })
          i = end + 1
          continue
        }
      }
      const desc = describeEscape(next)
      tokens.push({
        text: next ? `\\${next}` : '\\',
        ...desc,
      })
      i += next ? 2 : 1
      continue
    }

    if (ch === '[') {
      const end = readUntil(pattern, i + 1, ']')
      if (end === -1) {
        tokens.push({
          text: '[',
          label: 'Character class',
          meaning: 'Unclosed character class',
          kind: 'unknown',
        })
        i += 1
        continue
      }
      const text = pattern.slice(i, end + 1)
      const negated = text[1] === '^'
      tokens.push({
        text,
        label: negated ? 'Negated class' : 'Character class',
        meaning: negated
          ? 'Matches any character not listed in the class'
          : 'Matches any character listed in the class',
        kind: 'class',
      })
      i = end + 1
      continue
    }

    if (ch === '(') {
      let prefix = '('
      if (pattern.startsWith('(?:', i)) prefix = '(?:'
      else if (pattern.startsWith('(?=', i)) prefix = '(?='
      else if (pattern.startsWith('(?!', i)) prefix = '(?!'
      else if (pattern.startsWith('(?<=', i)) prefix = '(?<='
      else if (pattern.startsWith('(?<!', i)) prefix = '(?<!'
      else if (pattern.startsWith('(?<', i)) {
        const close = pattern.indexOf('>', i + 3)
        prefix = close === -1 ? '(?<' : pattern.slice(i, close + 1)
      } else if (pattern.startsWith('(?', i)) {
        prefix = pattern.slice(i, Math.min(i + 3, pattern.length))
      }

      const desc = describeGroupOpen(prefix)
      tokens.push({
        text: prefix,
        label: desc.label,
        meaning: desc.meaning,
        kind: 'group',
      })
      i += prefix.length
      continue
    }

    if (ch === ')') {
      tokens.push({
        text: ')',
        label: 'Group end',
        meaning: 'Ends the current group',
        kind: 'group',
      })
      i += 1
      continue
    }

    if (ch === '*' || ch === '+' || ch === '?') {
      let text = ch
      i += 1
      if (pattern[i] === '?') {
        text += '?'
        i += 1
      }
      const desc = describeQuantifier(text)
      tokens.push({ text, label: desc.label, meaning: desc.meaning, kind: 'quantifier' })
      continue
    }

    if (ch === '{') {
      const match = pattern.slice(i).match(/^\{\d+(?:,\d*)?\}(\?)?/)
      if (match) {
        const text = match[0]
        const desc = describeQuantifier(text)
        tokens.push({ text, label: desc.label, meaning: desc.meaning, kind: 'quantifier' })
        i += text.length
        continue
      }
    }

    if (ch === '^') {
      tokens.push({
        text: '^',
        label: 'Start',
        meaning: 'Matches the start of the string (or line with m)',
        kind: 'anchor',
      })
      i += 1
      continue
    }

    if (ch === '$') {
      tokens.push({
        text: '$',
        label: 'End',
        meaning: 'Matches the end of the string (or line with m)',
        kind: 'anchor',
      })
      i += 1
      continue
    }

    if (ch === '.') {
      tokens.push({
        text: '.',
        label: 'Any char',
        meaning: 'Matches any character except newline (unless s/DotAll)',
        kind: 'meta',
      })
      i += 1
      continue
    }

    if (ch === '|') {
      tokens.push({
        text: '|',
        label: 'Alternation',
        meaning: 'Matches either the left or the right expression',
        kind: 'meta',
      })
      i += 1
      continue
    }

    // Collapse consecutive literal characters into one token for readability.
    let literal = ch
    i += 1
    while (i < pattern.length) {
      const next = pattern[i]
      if ('\\[](){}*+?^$.|'.includes(next)) break
      literal += next
      i += 1
    }
    tokens.push({
      text: literal,
      label: 'Literal',
      meaning:
        literal.length === 1
          ? `Matches the character "${literal}"`
          : `Matches the text "${literal}"`,
      kind: 'literal',
    })
  }

  return tokens
}

export function matchCoverage(text: string, matches: { index: number; text: string }[]): {
  covered: number
  total: number
  percent: number
} {
  if (!text) return { covered: 0, total: 0, percent: 0 }
  const covered = new Set<number>()
  for (const match of matches) {
    for (let i = 0; i < match.text.length; i += 1) {
      covered.add(match.index + i)
    }
  }
  const total = text.length
  const count = covered.size
  return {
    covered: count,
    total,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
  }
}
