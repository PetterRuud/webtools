import { useMemo, useState } from 'react'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import { jsonToXml, stringifyJson, xmlToJson } from '#/lib/xmlJson'

type Mode = 'xml-to-json' | 'json-to-xml'

const SAMPLE_XML = `<catalog id="1">
  <book sku="wt-01">
    <title>WebTools</title>
    <tags>
      <tag>xml</tag>
      <tag>json</tag>
    </tags>
  </book>
</catalog>`

const SAMPLE_JSON = `{
  "catalog": {
    "@id": "1",
    "book": {
      "@sku": "wt-01",
      "title": "WebTools",
      "tags": {
        "tag": ["xml", "json"]
      }
    }
  }
}`

export function XmlJsonTool() {
  const [mode, setMode] = useState<Mode>('xml-to-json')
  const [input, setInput] = useState('')
  const [pretty, setPretty] = useState(true)

  const result = useMemo(() => {
    if (!input.trim()) {
      return { value: '', error: null as string | null }
    }
    try {
      if (mode === 'xml-to-json') {
        return {
          value: stringifyJson(xmlToJson(input), pretty),
          error: null,
        }
      }
      return { value: jsonToXml(input), error: null }
    } catch (err) {
      return {
        value: '',
        error: err instanceof Error ? err.message : 'Conversion failed',
      }
    }
  }, [input, mode, pretty])

  function loadSample() {
    setInput(mode === 'xml-to-json' ? SAMPLE_XML : SAMPLE_JSON)
  }

  function swapMode(next: Mode) {
    setMode(next)
    // Keep input; conversion re-runs for the new direction.
  }

  const inputLabel = mode === 'xml-to-json' ? 'XML' : 'JSON'
  const outputLabel = mode === 'xml-to-json' ? 'JSON' : 'XML'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant={mode === 'xml-to-json' ? 'default' : 'outline'}
            onClick={() => swapMode('xml-to-json')}
          >
            XML → JSON
          </Button>
          <Button
            type="button"
            variant={mode === 'json-to-xml' ? 'default' : 'outline'}
            onClick={() => swapMode('json-to-xml')}
          >
            JSON → XML
          </Button>
          <Button type="button" variant="ghost" onClick={loadSample}>
            Sample
          </Button>
        </div>
        {mode === 'xml-to-json' ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>JSON</span>
            <Button
              type="button"
              size="sm"
              variant={pretty ? 'default' : 'outline'}
              onClick={() => setPretty(true)}
            >
              Pretty
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!pretty ? 'default' : 'outline'}
              onClick={() => setPretty(false)}
            >
              Minify
            </Button>
          </div>
        ) : null}
      </div>

      <DualTextareas
        leftHeader={<Label htmlFor="xml-json-input">{inputLabel}</Label>}
        rightHeader={
          <>
            <Label htmlFor="xml-json-output">{outputLabel}</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!result.value}
              onClick={() => void copyText(result.value, outputLabel)}
            >
              Copy
            </Button>
          </>
        }
        left={
          <Textarea
            id="xml-json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder={
              mode === 'xml-to-json' ? 'Paste XML…' : 'Paste JSON…'
            }
            className="min-h-64 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
            aria-invalid={Boolean(result.error)}
          />
        }
        right={
          <Textarea
            id="xml-json-output"
            value={result.value}
            readOnly
            spellCheck={false}
            placeholder={
              !input.trim()
                ? 'Result…'
                : result.error
                  ? 'Fix input…'
                  : ''
            }
            className="min-h-64 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
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
