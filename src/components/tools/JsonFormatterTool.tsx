import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'

const SAMPLE = `{
  "name": "WebTools",
  "ready": true,
  "formats": ["pretty", "minify"]
}`

type Indent = 2 | 4

function formatJson(input: string, indent: Indent): string {
  return JSON.stringify(JSON.parse(input), null, indent)
}

function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input))
}

export function JsonFormatterTool() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState<Indent>(2)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const status = useMemo(() => {
    if (!input.trim()) return 'empty' as const
    if (error) return 'error' as const
    if (output) return 'ready' as const
    return 'idle' as const
  }, [error, input, output])

  function run(mode: 'pretty' | 'minify') {
    if (!input.trim()) {
      setOutput('')
      setError('Paste JSON first.')
      return
    }
    try {
      const next = mode === 'pretty' ? formatJson(input, indent) : minifyJson(input)
      setOutput(next)
      setError(null)
      toast.success(mode === 'pretty' ? 'Formatted' : 'Minified')
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  function validateOnly() {
    if (!input.trim()) {
      setError('Paste JSON first.')
      setOutput('')
      return
    }
    try {
      JSON.parse(input)
      setError(null)
      toast.success('Valid JSON')
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" onClick={() => run('pretty')}>
            Pretty
          </Button>
          <Button type="button" variant="outline" onClick={() => run('minify')}>
            Minify
          </Button>
          <Button type="button" variant="secondary" onClick={validateOnly}>
            Validate
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setInput(SAMPLE)
              setOutput('')
              setError(null)
            }}
          >
            Sample
          </Button>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Indent</span>
          {([2, 4] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={indent === value ? 'default' : 'outline'}
              onClick={() => setIndent(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <DualTextareas
        leftHeader={<Label htmlFor="json-input">Input</Label>}
        rightHeader={
          <>
            <Label htmlFor="json-output">Output</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyText(output, 'JSON')}
              disabled={!output}
            >
              Copy
            </Button>
          </>
        }
        left={
          <Textarea
            id="json-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setError(null)
            }}
            spellCheck={false}
            placeholder="Paste JSON…"
            className="min-h-64 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
            aria-invalid={Boolean(error)}
          />
        }
        right={
          <Textarea
            id="json-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder={
              status === 'empty' ? 'Result…' : 'Run Pretty or Minify…'
            }
            className="min-h-64 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
      />

      {error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : status === 'ready' ? (
        <p className="m-0 text-xs text-muted-foreground">
          {output.length.toLocaleString()} characters
        </p>
      ) : null}
    </div>
  )
}
