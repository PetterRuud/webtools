import { useMemo, useState } from 'react'
import * as Diff from 'diff'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { cn } from 'cn'

type ViewMode = 'split' | 'unified'

type DiffRow = {
  left?: { text: string; type: 'same' | 'removed' | 'empty' }
  right?: { text: string; type: 'same' | 'added' | 'empty' }
  unified?: { text: string; type: 'same' | 'added' | 'removed' }
}

function buildRows(left: string, right: string, view: ViewMode): DiffRow[] {
  const parts = Diff.diffLines(left, right)
  if (view === 'unified') {
    return parts.flatMap((part) => {
      const lines = part.value.replace(/\n$/, '').split('\n')
      if (part.value === '' || (part.value === '\n' && lines.length === 1 && lines[0] === '')) {
        return []
      }
      const type = part.added ? 'added' : part.removed ? 'removed' : 'same'
      return lines.map((text) => ({
        unified: { text, type: type as 'same' | 'added' | 'removed' },
      }))
    })
  }

  const rows: DiffRow[] = []
  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    const next = parts[i + 1]
    if (part.removed && next?.added) {
      const leftLines = part.value.replace(/\n$/, '').split('\n')
      const rightLines = next.value.replace(/\n$/, '').split('\n')
      const max = Math.max(leftLines.length, rightLines.length)
      for (let n = 0; n < max; n += 1) {
        rows.push({
          left:
            n < leftLines.length
              ? { text: leftLines[n], type: 'removed' }
              : { text: '', type: 'empty' },
          right:
            n < rightLines.length
              ? { text: rightLines[n], type: 'added' }
              : { text: '', type: 'empty' },
        })
      }
      i += 2
      continue
    }
    const lines = part.value.replace(/\n$/, '').split('\n')
    if (part.value.endsWith('\n') && lines.at(-1) === '') {
      // keep trailing empty from split behavior; already handled by replace
    }
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

function cellClass(type: 'same' | 'added' | 'removed' | 'empty') {
  if (type === 'added') {
    return 'bg-primary/15 text-foreground dark:bg-primary/25'
  }
  if (type === 'removed') {
    return 'bg-destructive/12 text-foreground dark:bg-destructive/20'
  }
  if (type === 'empty') {
    return 'bg-muted/40 text-transparent'
  }
  return 'bg-transparent'
}

export function TextDiffTool() {
  const [left, setLeft] = useState('alpha\nbeta\ngamma\n')
  const [right, setRight] = useState('alpha\nbeta edited\ndelta\n')
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

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="diff-left">Original</Label>
          <Textarea
            id="diff-left"
            value={left}
            onChange={(event) => setLeft(event.target.value)}
            spellCheck={false}
            placeholder="Original…"
            className="min-h-36 font-mono text-[0.85rem] leading-6"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="diff-right">Changed</Label>
          <Textarea
            id="diff-right"
            value={right}
            onChange={(event) => setRight(event.target.value)}
            spellCheck={false}
            placeholder="Changed…"
            className="min-h-36 font-mono text-[0.85rem] leading-6"
          />
        </div>
      </div>

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
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td
                      className={cn(
                        'whitespace-pre-wrap px-3 py-0.5 align-top',
                        cellClass(row.unified!.type),
                      )}
                    >
                      <span className="mr-2 inline-block w-3 text-muted-foreground">
                        {row.unified!.type === 'added'
                          ? '+'
                          : row.unified!.type === 'removed'
                            ? '−'
                            : ' '}
                      </span>
                      {row.unified!.text || ' '}
                    </td>
                  </tr>
                ))}
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
                {rows.map((row, index) => (
                  <tr key={index} className="border-t border-border/50">
                    <td
                      className={cn(
                        'w-1/2 whitespace-pre-wrap px-3 py-0.5 align-top',
                        cellClass(row.left!.type),
                      )}
                    >
                      {row.left!.text || ' '}
                    </td>
                    <td
                      className={cn(
                        'w-1/2 whitespace-pre-wrap px-3 py-0.5 align-top',
                        cellClass(row.right!.type),
                      )}
                    >
                      {row.right!.text || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
