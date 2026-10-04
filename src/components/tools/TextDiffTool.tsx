import { useMemo, useState, type ReactNode } from 'react'
import * as Diff from 'diff'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { cn } from 'cn'

type ViewMode = 'split' | 'unified'
type LineKind = 'same' | 'added' | 'removed' | 'empty'
type SegmentKind = 'same' | 'added' | 'removed'

type Segment = {
  text: string
  type: SegmentKind
}

type DiffCell = {
  text: string
  type: LineKind
  segments?: Segment[]
}

type DiffRow = {
  left?: DiffCell
  right?: DiffCell
  unified?: DiffCell
}

function splitLines(value: string): string[] {
  if (value === '') return []
  return value.replace(/\n$/, '').split('\n')
}

/** True when tokens share enough characters to justify char-level marks. */
function similarEnough(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return true
  if (maxLen > 48) return false
  if (/\s/.test(a) || /\s/.test(b)) return false
  let same = 0
  for (const part of Diff.diffChars(a, b)) {
    if (!part.added && !part.removed) same += part.value.length
  }
  return same / maxLen >= 0.45
}

/** Prefer word-level hunks; refine similar single-token edits with char LCS. */
function inlineSegments(before: string, after: string): {
  left: Segment[]
  right: Segment[]
} {
  const parts = Diff.diffWordsWithSpace(before, after)
  const left: Segment[] = []
  const right: Segment[] = []

  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    const next = parts[i + 1]

    if (part.removed && next?.added) {
      const removed = part.value
      const added = next.value

      if (similarEnough(removed, added)) {
        for (const sub of Diff.diffChars(removed, added)) {
          if (sub.added) {
            right.push({ text: sub.value, type: 'added' })
          } else if (sub.removed) {
            left.push({ text: sub.value, type: 'removed' })
          } else {
            left.push({ text: sub.value, type: 'same' })
            right.push({ text: sub.value, type: 'same' })
          }
        }
      } else {
        left.push({ text: removed, type: 'removed' })
        right.push({ text: added, type: 'added' })
      }
      i += 2
      continue
    }

    if (part.added) {
      right.push({ text: part.value, type: 'added' })
    } else if (part.removed) {
      left.push({ text: part.value, type: 'removed' })
    } else {
      left.push({ text: part.value, type: 'same' })
      right.push({ text: part.value, type: 'same' })
    }
    i += 1
  }

  return { left, right }
}

function buildRows(left: string, right: string, view: ViewMode): DiffRow[] {
  const parts = Diff.diffLines(left, right)

  if (view === 'unified') {
    const rows: DiffRow[] = []
    let i = 0
    while (i < parts.length) {
      const part = parts[i]
      const next = parts[i + 1]

      if (part.removed && next?.added) {
        const leftLines = splitLines(part.value)
        const rightLines = splitLines(next.value)
        const max = Math.max(leftLines.length, rightLines.length)
        for (let n = 0; n < max; n += 1) {
          const hasLeft = n < leftLines.length
          const hasRight = n < rightLines.length
          if (hasLeft && hasRight) {
            const { left: leftSegs, right: rightSegs } = inlineSegments(
              leftLines[n],
              rightLines[n],
            )
            rows.push({
              unified: {
                text: leftLines[n],
                type: 'removed',
                segments: leftSegs,
              },
            })
            rows.push({
              unified: {
                text: rightLines[n],
                type: 'added',
                segments: rightSegs,
              },
            })
          } else if (hasLeft) {
            rows.push({
              unified: { text: leftLines[n], type: 'removed' },
            })
          } else {
            rows.push({
              unified: { text: rightLines[n], type: 'added' },
            })
          }
        }
        i += 2
        continue
      }

      const lines = splitLines(part.value)
      if (part.value === '' || (part.value === '\n' && lines.length === 1 && lines[0] === '')) {
        i += 1
        continue
      }
      const type: SegmentKind = part.added ? 'added' : part.removed ? 'removed' : 'same'
      for (const text of lines) {
        rows.push({ unified: { text, type } })
      }
      i += 1
    }
    return rows
  }

  const rows: DiffRow[] = []
  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    const next = parts[i + 1]
    if (part.removed && next?.added) {
      const leftLines = splitLines(part.value)
      const rightLines = splitLines(next.value)
      const max = Math.max(leftLines.length, rightLines.length)
      for (let n = 0; n < max; n += 1) {
        const hasLeft = n < leftLines.length
        const hasRight = n < rightLines.length
        if (hasLeft && hasRight) {
          const { left: leftSegs, right: rightSegs } = inlineSegments(
            leftLines[n],
            rightLines[n],
          )
          rows.push({
            left: { text: leftLines[n], type: 'removed', segments: leftSegs },
            right: { text: rightLines[n], type: 'added', segments: rightSegs },
          })
        } else if (hasLeft) {
          rows.push({
            left: { text: leftLines[n], type: 'removed' },
            right: { text: '', type: 'empty' },
          })
        } else {
          rows.push({
            left: { text: '', type: 'empty' },
            right: { text: rightLines[n], type: 'added' },
          })
        }
      }
      i += 2
      continue
    }

    const lines = splitLines(part.value)
    for (const text of lines) {
      if (part.added) {
        rows.push({
          left: { text: '', type: 'empty' },
          right: { text, type: 'added' },
        })
      } else if (part.removed) {
        rows.push({
          left: { text, type: 'removed' },
          right: { text: '', type: 'empty' },
        })
      } else {
        rows.push({
          left: { text, type: 'same' },
          right: { text, type: 'same' },
        })
      }
    }
    i += 1
  }
  return rows
}

function lineClass(type: LineKind, segments?: Segment[]) {
  if (type === 'empty') {
    return 'bg-muted/40 text-transparent'
  }
  // Intra-line mode: keep the row neutral; only <mark> spans carry color.
  if (segments?.length) {
    return 'bg-transparent'
  }
  if (type === 'added') {
    return 'bg-primary/15 dark:bg-primary/25'
  }
  if (type === 'removed') {
    return 'bg-destructive/12 dark:bg-destructive/20'
  }
  return 'bg-transparent'
}

function segmentClass(type: SegmentKind) {
  if (type === 'added') {
    return 'rounded-[2px] bg-primary/35 text-foreground dark:bg-primary/45'
  }
  if (type === 'removed') {
    return 'rounded-[2px] bg-destructive/30 text-foreground dark:bg-destructive/40'
  }
  return undefined
}

function renderSegments(segments: Segment[] | undefined, fallback: string): ReactNode {
  if (!segments || segments.length === 0) {
    return fallback || ' '
  }
  return segments.map((segment, index) => {
    const mark = segmentClass(segment.type)
    if (!mark) {
      return <span key={index}>{segment.text}</span>
    }
    return (
      <mark key={index} className={cn(mark, 'text-inherit')}>
        {segment.text}
      </mark>
    )
  })
}

export function TextDiffTool() {
  const [left, setLeft] = useState('alpha\nbeta\ncolour\ngamma\n')
  const [right, setRight] = useState('alpha\nbeta edited\ncolor\ndelta\n')
  const [view, setView] = useState<ViewMode>('split')

  const rows = useMemo(() => buildRows(left, right, view), [left, right, view])
  const hasInput = left.length > 0 || right.length > 0
  const changeCount = useMemo(
    () =>
      rows.filter((row) => {
        if (row.unified) return row.unified.type !== 'same'
        const leftType = row.left?.type
        const rightType = row.right?.type
        return leftType === 'removed' || rightType === 'added'
      }).length,
    [rows],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant={view === 'split' ? 'default' : 'outline'}
          onClick={() => setView('split')}
        >
          Side by side
        </Button>
        <Button
          type="button"
          variant={view === 'unified' ? 'default' : 'outline'}
          onClick={() => setView('unified')}
        >
          Unified
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setLeft(right)
            setRight(left)
          }}
        >
          Swap
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setLeft('')
            setRight('')
          }}
        >
          Clear
        </Button>
      </div>

      <DualTextareas
        leftHeader={<Label htmlFor="diff-left">Original</Label>}
        rightHeader={<Label htmlFor="diff-right">Changed</Label>}
        left={
          <Textarea
            id="diff-left"
            value={left}
            onChange={(event) => setLeft(event.target.value)}
            spellCheck={false}
            placeholder="Original…"
            className="min-h-36 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
        right={
          <Textarea
            id="diff-right"
            value={right}
            onChange={(event) => setRight(event.target.value)}
            spellCheck={false}
            placeholder="Changed…"
            className="min-h-36 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
            Diff
          </h2>
          <p className="m-0 text-xs text-muted-foreground">
            {!hasInput
              ? '—'
              : changeCount === 0
                ? 'No differences'
                : `${changeCount} changed line${changeCount === 1 ? '' : 's'}`}
          </p>
        </div>

        {!hasInput ? (
          <p className="m-0 rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            Paste both sides to diff
          </p>
        ) : view === 'unified' ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse font-mono text-[0.8rem] leading-6">
              <tbody>
                {rows.map((row, index) => {
                  const cell = row.unified!
                  return (
                    <tr key={index}>
                      <td
                        className={cn(
                          'whitespace-pre-wrap px-3 py-0.5 align-top',
                          lineClass(cell.type, cell.segments),
                        )}
                      >
                        <span className="mr-2 inline-block w-3 text-muted-foreground">
                          {cell.type === 'added'
                            ? '+'
                            : cell.type === 'removed'
                              ? '−'
                              : ' '}
                        </span>
                        {renderSegments(cell.segments, cell.text)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[36rem] border-collapse font-mono text-[0.8rem] leading-6">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Original</th>
                  <th className="px-3 py-2 font-medium">Changed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const leftCell = row.left!
                  const rightCell = row.right!
                  return (
                    <tr key={index} className="border-t border-border/50">
                      <td
                        className={cn(
                          'w-1/2 whitespace-pre-wrap px-3 py-0.5 align-top',
                          lineClass(leftCell.type, leftCell.segments),
                        )}
                      >
                        {renderSegments(leftCell.segments, leftCell.text)}
                      </td>
                      <td
                        className={cn(
                          'w-1/2 whitespace-pre-wrap px-3 py-0.5 align-top',
                          lineClass(rightCell.type, rightCell.segments),
                        )}
                      >
                        {renderSegments(rightCell.segments, rightCell.text)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
