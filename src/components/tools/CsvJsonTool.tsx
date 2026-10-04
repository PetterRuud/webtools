import { useMemo, useState } from 'react'
import { CopyIcon } from 'lucide-react'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import { csvToJson, jsonToCsv } from '#/lib/csvJson'

type Mode = 'csv-to-json' | 'json-to-csv'

const SAMPLE_CSV = `name,ready,note
WebTools,true,"CSV, JSON"
Regex,false,Pattern test`

const SAMPLE_JSON = `[
  { "name": "WebTools", "ready": true, "note": "CSV, JSON" },
  { "name": "Regex", "ready": false, "note": "Pattern test" }
]`

export function CsvJsonTool() {
  const [mode, setMode] = useState<Mode>('csv-to-json')
  const [input, setInput] = useState('')
  const [headerRow, setHeaderRow] = useState(true)

  const result = useMemo(() => {
    if (!input.trim()) {
      return { value: '', error: null as string | null }
    }
    try {
      const value =
        mode === 'csv-to-json'
          ? csvToJson(input, { headerRow, pretty: true })
          : jsonToCsv(input, { headerRow })
      return { value, error: null }
    } catch (err) {
      return {
        value: '',
        error: err instanceof Error ? err.message : 'Conversion failed',
      }
    }
  }, [headerRow, input, mode])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant={mode === 'csv-to-json' ? 'default' : 'outline'}
          onClick={() => setMode('csv-to-json')}
        >
          CSV → JSON
        </Button>
        <Button
          type="button"
          variant={mode === 'json-to-csv' ? 'default' : 'outline'}
          onClick={() => setMode('json-to-csv')}
        >
          JSON → CSV
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setInput(mode === 'csv-to-json' ? SAMPLE_CSV : SAMPLE_JSON)
          }
        >
          Sample
        </Button>
        <label className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={headerRow}
            onChange={(event) => setHeaderRow(event.target.checked)}
            className="size-3.5 accent-primary"
          />
          Header row
        </label>
      </div>

      <DualTextareas
        leftHeader={
          <Label htmlFor="csv-json-input">
            {mode === 'csv-to-json' ? 'CSV' : 'JSON'}
          </Label>
        }
        rightHeader={
          <>
            <Label htmlFor="csv-json-output">
              {mode === 'csv-to-json' ? 'JSON' : 'CSV'}
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!result.value}
              onClick={() =>
                void copyText(
                  result.value,
                  mode === 'csv-to-json' ? 'JSON' : 'CSV',
                )
              }
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </>
        }
        left={
          <Textarea
            id="csv-json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder={
              mode === 'csv-to-json' ? 'Paste CSV…' : 'Paste JSON…'
            }
            className="min-h-56 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
            aria-invalid={Boolean(result.error)}
          />
        }
        right={
          <Textarea
            id="csv-json-output"
            value={result.value}
            readOnly
            spellCheck={false}
            placeholder={
              !input.trim() ? 'Result…' : result.error ? 'Fix input…' : ''
            }
            className="min-h-56 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
      />

      {result.error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </p>
      ) : null}
    </div>
  )
}
