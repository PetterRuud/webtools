import { useMemo, useState } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  ALL_FAKE_FIELD_TYPES,
  DEFAULT_FAKE_FIELDS,
  FAKE_FIELD_GROUPS,
  MAX_FAKE_ROWS,
  MIN_FAKE_ROWS,
  createFieldId,
  defaultNameForType,
  downloadFakeOutput,
  fieldTypeLabel,
  formatFakeRows,
  generateFakeRows,
  type FakeField,
  type FakeFieldType,
  type FakeOutputFormat,
} from '#/lib/fakeData'
import { cn } from '#/lib/utils'

const FORMATS: Array<{ id: FakeOutputFormat; label: string }> = [
  { id: 'json', label: 'JSON' },
  { id: 'csv', label: 'CSV' },
  { id: 'sql', label: 'SQL' },
  { id: 'xml', label: 'XML' },
]

const SELECT_CLASS =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

export function FakeDataTool() {
  const [fields, setFields] = useState<FakeField[]>(DEFAULT_FAKE_FIELDS)
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<FakeOutputFormat>('json')
  const [tableName, setTableName] = useState('people')
  const [seed, setSeed] = useState(0)

  const result = useMemo(() => {
    void seed
    try {
      const rows = generateFakeRows(fields, count)
      return {
        output: formatFakeRows(rows, format, { tableName }),
        error: null as string | null,
      }
    } catch (err) {
      return {
        output: '',
        error: err instanceof Error ? err.message : 'Generation failed',
      }
    }
  }, [count, fields, format, seed, tableName])

  const { output, error } = result

  function patchField(id: string, patch: Partial<FakeField>) {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    )
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      {
        id: createFieldId(),
        name: defaultNameForType('word'),
        type: 'word',
      },
    ])
  }

  function removeField(id: string) {
    setFields((prev) => (prev.length <= 1 ? prev : prev.filter((f) => f.id !== id)))
  }

  function resetSchema() {
    setFields(DEFAULT_FAKE_FIELDS.map((field) => ({ ...field, id: createFieldId() })))
    setCount(10)
    setFormat('json')
    setTableName('people')
    setSeed((n) => n + 1)
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-24 flex-col gap-1">
            <Label htmlFor="fake-count">Rows</Label>
            <Input
              id="fake-count"
              type="number"
              min={MIN_FAKE_ROWS}
              max={MAX_FAKE_ROWS}
              value={count}
              onChange={(event) => {
                const next = Number(event.target.value)
                if (!Number.isFinite(next)) return
                setCount(
                  Math.min(MAX_FAKE_ROWS, Math.max(MIN_FAKE_ROWS, Math.floor(next))),
                )
              }}
              className="tabular-nums"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Label>Format</Label>
            <div className="flex flex-wrap gap-1">
              {FORMATS.map((entry) => (
                <Button
                  key={entry.id}
                  type="button"
                  size="xs"
                  variant={format === entry.id ? 'default' : 'outline'}
                  aria-pressed={format === entry.id}
                  onClick={() => setFormat(entry.id)}
                >
                  {entry.label}
                </Button>
              ))}
            </div>
          </div>
          {format === 'sql' ? (
            <div className="flex min-w-28 flex-col gap-1">
              <Label htmlFor="fake-table">Table</Label>
              <Input
                id="fake-table"
                value={tableName}
                onChange={(event) => setTableName(event.target.value)}
                spellCheck={false}
              />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Label>Schema</Label>
          <div className="flex flex-wrap gap-1">
            <Button type="button" size="xs" variant="outline" onClick={addField}>
              <PlusIcon data-icon="inline-start" />
              Field
            </Button>
            <Button type="button" size="xs" variant="ghost" onClick={resetSchema}>
              Reset
            </Button>
          </div>
        </div>

        <div className="flex max-h-[28rem] flex-col gap-1.5 overflow-auto pr-0.5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5"
            >
              <Input
                aria-label={`Field ${index + 1} name`}
                value={field.name}
                onChange={(event) =>
                  patchField(field.id, { name: event.target.value })
                }
                spellCheck={false}
                className="font-mono text-[0.8rem]"
              />
              <select
                aria-label={`Field ${index + 1} type`}
                value={field.type}
                onChange={(event) => {
                  const type = event.target.value as FakeFieldType
                  if (!ALL_FAKE_FIELD_TYPES.includes(type)) return
                  patchField(field.id, {
                    type,
                    name:
                      field.name === defaultNameForType(field.type)
                        ? defaultNameForType(type)
                        : field.name,
                  })
                }}
                className={cn(SELECT_CLASS, 'font-mono text-[0.8rem]')}
              >
                {FAKE_FIELD_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.types.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={`Remove ${field.name || `field ${index + 1}`}`}
                disabled={fields.length <= 1}
                onClick={() => removeField(field.id)}
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
        </div>

        <p className="m-0 text-xs text-muted-foreground">
          {fields.length} fields · {fieldTypeLabel(fields[0]?.type ?? 'uuid')}…
          synthetic only
        </p>
      </div>

      <div className="flex min-h-0 flex-col gap-1.5">
        <div className="flex h-8 shrink-0 items-center justify-between gap-2">
          <Label htmlFor="fake-output">Output</Label>
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSeed((n) => n + 1)}
            >
              Regenerate
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!output}
              onClick={() => void copyText(output, format.toUpperCase())}
            >
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!output}
              onClick={() => downloadFakeOutput(output, format)}
            >
              Download
            </Button>
          </div>
        </div>
        <Textarea
          id="fake-output"
          value={output}
          readOnly
          spellCheck={false}
          placeholder={error ? 'Fix schema…' : 'Generated rows…'}
          className="min-h-[28rem] field-sizing-fixed flex-1 font-mono text-[0.8rem] leading-5"
        />
        {error ? (
          <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
