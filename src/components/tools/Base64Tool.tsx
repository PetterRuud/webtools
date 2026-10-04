import { useMemo, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { decodeUtf8Base64, encodeUtf8Base64 } from '#/lib/base64'
import { copyText } from '#/lib/clipboard'

type Mode = 'encode' | 'decode'

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')

  const result = useMemo(() => {
    if (!input) {
      return { value: '', error: null as string | null }
    }
    try {
      const value =
        mode === 'encode' ? encodeUtf8Base64(input) : decodeUtf8Base64(input)
      return { value, error: null }
    } catch (err) {
      return {
        value: '',
        error:
          mode === 'decode'
            ? 'Not valid Base64 (or not UTF-8 text).'
            : err instanceof Error
              ? err.message
              : 'Could not encode',
      }
    }
  }, [input, mode])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => setMode('encode')}
        >
          Encode
        </Button>
        <Button
          type="button"
          variant={mode === 'decode' ? 'default' : 'outline'}
          onClick={() => setMode('decode')}
        >
          Decode
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setInput(mode === 'encode' ? 'Hei, WebTools 🌿' : 'SGVpLCBXZWJUb29scyDwn4ye')
          }
        >
          Sample
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="base64-input">
            {mode === 'encode' ? 'Text' : 'Base64'}
          </Label>
          <Textarea
            id="base64-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder={
              mode === 'encode'
                ? 'Type or paste text (UTF-8)…'
                : 'Paste a Base64 string…'
            }
            className="min-h-56 font-mono text-[0.85rem] leading-6"
            aria-invalid={Boolean(result.error)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="base64-output">
              {mode === 'encode' ? 'Base64' : 'Text'}
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!result.value}
              onClick={() => void copyText(result.value, mode === 'encode' ? 'Base64' : 'text')}
            >
              Copy
            </Button>
          </div>
          <Textarea
            id="base64-output"
            value={result.value}
            readOnly
            spellCheck={false}
            placeholder={
              !input
                ? 'Result updates as you type…'
                : result.error
                  ? 'Fix the input to see output.'
                  : ''
            }
            className="min-h-56 font-mono text-[0.85rem] leading-6"
          />
        </div>
      </div>

      {result.error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </p>
      ) : (
        <p className="m-0 text-sm text-muted-foreground">
          UTF-8 safe via TextEncoder / TextDecoder. Runs entirely in your browser.
        </p>
      )}
    </div>
  )
}
