import { useMemo, useState } from 'react'
import { CopyIcon } from 'lucide-react'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  generateTsInterfaces,
  type OutputKind,
} from '#/lib/tsInterface'

const SAMPLE = `{
  "id": 42,
  "name": "WebTools",
  "active": true,
  "tags": ["json", "typescript"],
  "owner": {
    "email": "dev@example.com",
    "roles": ["admin", "editor"]
  },
  "projects": [
    { "slug": "hub", "stars": 12 },
    { "slug": "cli", "stars": 3, "archived": true }
  ],
  "meta": null
}`

export function TsInterfaceTool() {
  const [input, setInput] = useState('')
  const [rootName, setRootName] = useState('Root')
  const [kind, setKind] = useState<OutputKind>('interface')
  const [optional, setOptional] = useState(false)
  const [readonly, setReadonly] = useState(false)
  const [exportTypes, setExportTypes] = useState(true)

  const result = useMemo(() => {
    if (!input.trim()) {
      return { value: '', error: null as string | null }
    }
    try {
      return {
        value: generateTsInterfaces(input, {
          rootName,
          kind,
          optional,
          readonly,
          exportTypes,
        }),
        error: null,
      }
    } catch (err) {
      return {
        value: '',
        error: err instanceof Error ? err.message : 'Generation failed',
      }
    }
  }, [exportTypes, input, kind, optional, readonly, rootName])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Label htmlFor="ts-root" className="text-sm text-muted-foreground">
            Root
          </Label>
          <Input
            id="ts-root"
            value={rootName}
            onChange={(event) => setRootName(event.target.value)}
            className="h-8 w-28 font-mono text-sm"
            spellCheck={false}
            aria-label="Root type name"
          />
          <Button
            type="button"
            size="sm"
            variant={kind === 'interface' ? 'default' : 'outline'}
            onClick={() => setKind('interface')}
          >
            interface
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kind === 'type' ? 'default' : 'outline'}
            onClick={() => setKind('type')}
          >
            type
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setInput(SAMPLE)}
          >
            Sample
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            <Checkbox
              checked={optional}
              onCheckedChange={(checked) => setOptional(checked === true)}
            />
            <span>Optional</span>
          </label>
          <label className="flex items-center gap-1.5">
            <Checkbox
              checked={readonly}
              onCheckedChange={(checked) => setReadonly(checked === true)}
            />
            <span>Readonly</span>
          </label>
          <label className="flex items-center gap-1.5">
            <Checkbox
              checked={exportTypes}
              onCheckedChange={(checked) => setExportTypes(checked === true)}
            />
            <span>Export</span>
          </label>
        </div>
      </div>

      <DualTextareas
        leftHeader={<Label htmlFor="ts-json-input">JSON</Label>}
        rightHeader={
          <>
            <Label htmlFor="ts-json-output">TypeScript</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyText(result.value, 'TypeScript')}
              disabled={!result.value}
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </>
        }
        left={
          <Textarea
            id="ts-json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder="Paste JSON…"
            className="min-h-72 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
            aria-invalid={Boolean(result.error)}
          />
        }
        right={
          <Textarea
            id="ts-json-output"
            value={result.value}
            readOnly
            spellCheck={false}
            placeholder={
              input.trim() ? 'Fix JSON to generate…' : 'Interfaces appear here…'
            }
            className="min-h-72 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
      />

      {result.error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </p>
      ) : result.value ? (
        <p className="m-0 text-xs text-muted-foreground">
          Live from sample JSON · nested objects become named types
        </p>
      ) : null}
    </div>
  )
}
