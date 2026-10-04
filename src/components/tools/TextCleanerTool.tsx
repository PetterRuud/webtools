import { useMemo, useState } from 'react'
import { DualTextareas } from '#/components/tools/DualTextareas'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  cleanText,
  DEFAULT_TEXT_CLEAN_OPTIONS,
  textCleanStats,
  type TextCleanOptions,
} from '#/lib/textCleaner'

const SAMPLE = `  “Hello”   world  

<p>Line&nbsp;one</p>


　Ｆｕｌｌｗｉｄｔｈ　  
trailing  

`

type OptionDef = {
  key: keyof TextCleanOptions
  label: string
}

const OPTIONS: OptionDef[] = [
  { key: 'trimLines', label: 'Trim lines' },
  { key: 'collapseWhitespace', label: 'Collapse spaces' },
  { key: 'removeEmptyLines', label: 'Drop empty lines' },
  { key: 'normalizeLineBreaks', label: 'Normalize breaks' },
  { key: 'stripHtml', label: 'Strip HTML' },
  { key: 'smartQuotes', label: 'Straight quotes' },
  { key: 'fullwidthToHalfwidth', label: 'Full→half width' },
  { key: 'removeControlChars', label: 'Drop controls' },
  { key: 'removeLineBreaks', label: 'Join lines' },
]

export function TextCleanerTool() {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<TextCleanOptions>(DEFAULT_TEXT_CLEAN_OPTIONS)

  const output = useMemo(() => cleanText(input, options), [input, options])
  const stats = useMemo(() => textCleanStats(input, output), [input, output])
  const activeCount = OPTIONS.filter((option) => options[option.key]).length

  function toggle(key: keyof TextCleanOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {OPTIONS.map((option) => (
            <Button
              key={option.key}
              type="button"
              size="sm"
              variant={options[option.key] ? 'default' : 'outline'}
              aria-pressed={options[option.key]}
              onClick={() => toggle(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setInput(SAMPLE)}
          >
            Sample
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setOptions(DEFAULT_TEXT_CLEAN_OPTIONS)}
          >
            Defaults
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setInput('')}
          >
            Clear
          </Button>
        </div>
      </div>

      <p className="m-0 text-xs text-muted-foreground">
        {activeCount} option{activeCount === 1 ? '' : 's'} · {stats.charsIn}→
        {stats.charsOut} chars · {stats.linesIn}→{stats.linesOut} lines
      </p>

      <DualTextareas
        leftHeader={<Label htmlFor="text-cleaner-input">Input</Label>}
        rightHeader={
          <>
            <Label htmlFor="text-cleaner-output">Output</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!output}
              onClick={() => void copyText(output, 'cleaned text')}
            >
              Copy
            </Button>
          </>
        }
        left={
          <Textarea
            id="text-cleaner-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder="Paste messy text…"
            className="min-h-64 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
        right={
          <Textarea
            id="text-cleaner-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder={input ? '' : 'Cleaned text…'}
            className="min-h-64 field-sizing-fixed font-mono text-[0.85rem] leading-6 flex-1"
          />
        }
      />
    </div>
  )
}
