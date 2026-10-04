import { useEffect, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { copyText } from '#/lib/clipboard'
import {
  charsetFromFlags,
  flipCoin,
  parseList,
  randomNumbers,
  randomPassword,
  randomPick,
  randomString,
  randomUuids,
  rollDice,
  shuffle,
  type CharsetFlags,
} from '#/lib/random'
import { cn } from '#/lib/utils'

type Mode =
  | 'number'
  | 'string'
  | 'uuid'
  | 'password'
  | 'coin'
  | 'dice'
  | 'list'

type ListAction = 'pick' | 'shuffle'

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'number', label: 'Number' },
  { id: 'string', label: 'String' },
  { id: 'uuid', label: 'UUID' },
  { id: 'password', label: 'Password' },
  { id: 'coin', label: 'Coin' },
  { id: 'dice', label: 'Dice' },
  { id: 'list', label: 'List' },
]

const DEFAULT_FLAGS: CharsetFlags = {
  lower: true,
  upper: true,
  digits: true,
  symbols: false,
}

const PASSWORD_FLAGS: CharsetFlags = {
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
}

const SAMPLE_LIST = `Alice
Bob
Carol
Dave
Eve`

const HISTORY_LIMIT = 12

type ToolState = {
  mode: Mode
  numMin: string
  numMax: string
  numCount: string
  numUnique: boolean
  numIntegers: boolean
  numDecimals: string
  strLength: string
  strFlags: CharsetFlags
  strCount: string
  uuidCount: string
  pwLength: string
  pwFlags: CharsetFlags
  pwCount: string
  diceCount: string
  diceSides: string
  listRaw: string
  listAction: ListAction
}

const INITIAL: ToolState = {
  mode: 'number',
  numMin: '1',
  numMax: '100',
  numCount: '1',
  numUnique: false,
  numIntegers: true,
  numDecimals: '2',
  strLength: '16',
  strFlags: DEFAULT_FLAGS,
  strCount: '1',
  uuidCount: '1',
  pwLength: '20',
  pwFlags: PASSWORD_FLAGS,
  pwCount: '1',
  diceCount: '2',
  diceSides: '6',
  listRaw: SAMPLE_LIST,
  listAction: 'pick',
}

function tryBuild(state: ToolState): { value: string; error: string | null } {
  try {
    return { value: buildResult(state), error: null }
  } catch (err) {
    return {
      value: '',
      error: err instanceof Error ? err.message : 'Could not generate',
    }
  }
}

export function RandomTool() {
  const [state, setState] = useState<ToolState>(INITIAL)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  const {
    mode,
    numMin,
    numMax,
    numCount,
    numUnique,
    numIntegers,
    numDecimals,
    strLength,
    strFlags,
    strCount,
    uuidCount,
    pwLength,
    pwFlags,
    pwCount,
    diceCount,
    diceSides,
    listRaw,
    listAction,
  } = state

  function patch(partial: Partial<ToolState>) {
    setState((prev) => ({ ...prev, ...partial }))
  }

  function commit(value: string) {
    setOutput(value)
    setError(null)
    setHistory((prev) =>
      [value, ...prev.filter((item) => item !== value)].slice(0, HISTORY_LIMIT),
    )
  }

  function generate(next: ToolState = state) {
    if (typeof crypto === 'undefined') return
    const result = tryBuild(next)
    if (result.error) {
      setError(result.error)
      return
    }
    commit(result.value)
  }

  function selectMode(nextMode: Mode) {
    const next = { ...state, mode: nextMode }
    setState(next)
    generate(next)
  }

  useEffect(() => {
    setReady(true)
    const result = tryBuild(INITIAL)
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.value)
    setError(null)
    setHistory([result.value])
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Generator">
        {MODES.map((item) => {
          const selected = mode === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectMode(item.id)}
              className={cn(
                'inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/30 p-3">
          {mode === 'number' ? (
            <NumberControls
              min={numMin}
              max={numMax}
              count={numCount}
              unique={numUnique}
              integers={numIntegers}
              decimals={numDecimals}
              onMin={(value) => patch({ numMin: value })}
              onMax={(value) => patch({ numMax: value })}
              onCount={(value) => patch({ numCount: value })}
              onUnique={(value) => patch({ numUnique: value })}
              onIntegers={(value) => patch({ numIntegers: value })}
              onDecimals={(value) => patch({ numDecimals: value })}
            />
          ) : null}
          {mode === 'string' ? (
            <CharsetControls
              length={strLength}
              count={strCount}
              flags={strFlags}
              onLength={(value) => patch({ strLength: value })}
              onCount={(value) => patch({ strCount: value })}
              onFlags={(value) => patch({ strFlags: value })}
              lengthLabel="Length"
              countLabel="How many"
            />
          ) : null}
          {mode === 'uuid' ? (
            <Field
              id="uuid-count"
              label="How many"
              value={uuidCount}
              onValueChange={(value) => patch({ uuidCount: value })}
              inputMode="numeric"
            />
          ) : null}
          {mode === 'password' ? (
            <CharsetControls
              length={pwLength}
              count={pwCount}
              flags={pwFlags}
              onLength={(value) => patch({ pwLength: value })}
              onCount={(value) => patch({ pwCount: value })}
              onFlags={(value) => patch({ pwFlags: value })}
              lengthLabel="Length"
              countLabel="How many"
            />
          ) : null}
          {mode === 'coin' ? (
            <p className="m-0 text-sm text-muted-foreground">
              Fair coin flip. Heads or tails — locally generated.
            </p>
          ) : null}
          {mode === 'dice' ? (
            <div className="grid grid-cols-2 gap-2">
              <Field
                id="dice-count"
                label="Dice"
                value={diceCount}
                onValueChange={(value) => patch({ diceCount: value })}
                inputMode="numeric"
              />
              <Field
                id="dice-sides"
                label="Sides"
                value={diceSides}
                onValueChange={(value) => patch({ diceSides: value })}
                inputMode="numeric"
              />
            </div>
          ) : null}
          {mode === 'list' ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant={listAction === 'pick' ? 'default' : 'outline'}
                  onClick={() => patch({ listAction: 'pick' })}
                >
                  Pick one
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={listAction === 'shuffle' ? 'default' : 'outline'}
                  onClick={() => patch({ listAction: 'shuffle' })}
                >
                  Shuffle
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => patch({ listRaw: SAMPLE_LIST })}
                >
                  Sample
                </Button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="random-list">Choices (line or comma)</Label>
                <Textarea
                  id="random-list"
                  value={listRaw}
                  onChange={(event) => patch({ listRaw: event.target.value })}
                  spellCheck={false}
                  className="min-h-36 font-mono text-[0.8rem] leading-5"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            <Button type="button" onClick={() => generate()}>
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!output}
              onClick={() => void copyText(output, modeLabel(mode))}
            >
              Copy
            </Button>
          </div>
          {error ? (
            <p className="m-0 text-sm text-destructive">{error}</p>
          ) : (
            <p className="m-0 text-xs text-muted-foreground">
              Cryptographically random in this browser. Nothing is uploaded.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="random-output">Result</Label>
              <span className="text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                {modeLabel(mode)}
              </span>
            </div>
            <Textarea
              id="random-output"
              value={ready ? output : ''}
              readOnly
              spellCheck={false}
              placeholder="Generate to see a result…"
              className="min-h-48 font-mono text-[0.85rem] leading-5"
            />
          </div>

          <div className="rounded-lg border border-border/70 bg-card/30">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-1.5">
              <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                Recent
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                disabled={history.length === 0}
                onClick={() => setHistory([])}
              >
                Clear
              </Button>
            </div>
            {history.length === 0 ? (
              <p className="m-0 px-3 py-4 text-sm text-muted-foreground">
                History appears after you generate.
              </p>
            ) : (
              <ul className="m-0 max-h-48 list-none overflow-y-auto p-0">
                {history.map((item, index) => (
                  <li
                    key={`${index}-${item.slice(0, 24)}`}
                    className="flex items-start gap-2 border-b border-border/50 px-3 py-1.5 last:border-b-0"
                  >
                    <button
                      type="button"
                      className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-left font-mono text-xs break-all text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setOutput(item)
                        void copyText(item, 'result')
                      }}
                      title="Copy"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function modeLabel(mode: Mode): string {
  return MODES.find((item) => item.id === mode)?.label ?? mode
}

function NumberControls(props: {
  min: string
  max: string
  count: string
  unique: boolean
  integers: boolean
  decimals: string
  onMin: (value: string) => void
  onMax: (value: string) => void
  onCount: (value: string) => void
  onUnique: (value: boolean) => void
  onIntegers: (value: boolean) => void
  onDecimals: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Field
          id="num-min"
          label="Min"
          value={props.min}
          onValueChange={props.onMin}
          inputMode="decimal"
        />
        <Field
          id="num-max"
          label="Max"
          value={props.max}
          onValueChange={props.onMax}
          inputMode="decimal"
        />
        <Field
          id="num-count"
          label="Count"
          value={props.count}
          onValueChange={props.onCount}
          inputMode="numeric"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Toggle
          id="num-integers"
          label="Integers"
          checked={props.integers}
          onCheckedChange={props.onIntegers}
        />
        <Toggle
          id="num-unique"
          label="Unique"
          checked={props.unique}
          onCheckedChange={props.onUnique}
          disabled={!props.integers}
        />
      </div>
      {!props.integers ? (
        <Field
          id="num-decimals"
          label="Decimals"
          value={props.decimals}
          onValueChange={props.onDecimals}
          inputMode="numeric"
        />
      ) : null}
    </div>
  )
}

function CharsetControls(props: {
  length: string
  count: string
  flags: CharsetFlags
  onLength: (value: string) => void
  onCount: (value: string) => void
  onFlags: (value: CharsetFlags) => void
  lengthLabel: string
  countLabel: string
}) {
  function patch(key: keyof CharsetFlags, checked: boolean) {
    props.onFlags({ ...props.flags, [key]: checked })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Field
          id="charset-length"
          label={props.lengthLabel}
          value={props.length}
          onValueChange={props.onLength}
          inputMode="numeric"
        />
        <Field
          id="charset-count"
          label={props.countLabel}
          value={props.count}
          onValueChange={props.onCount}
          inputMode="numeric"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Toggle
          id="charset-lower"
          label="a–z"
          checked={props.flags.lower}
          onCheckedChange={(checked) => patch('lower', checked)}
        />
        <Toggle
          id="charset-upper"
          label="A–Z"
          checked={props.flags.upper}
          onCheckedChange={(checked) => patch('upper', checked)}
        />
        <Toggle
          id="charset-digits"
          label="0–9"
          checked={props.flags.digits}
          onCheckedChange={(checked) => patch('digits', checked)}
        />
        <Toggle
          id="charset-symbols"
          label="Symbols"
          checked={props.flags.symbols}
          onCheckedChange={(checked) => patch('symbols', checked)}
        />
      </div>
    </div>
  )
}

function Field(props: {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  inputMode?: 'numeric' | 'decimal' | 'text'
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input
        id={props.id}
        value={props.value}
        onValueChange={props.onValueChange}
        inputMode={props.inputMode}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  )
}

function Toggle(props: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={props.id}
      className={cn(
        'flex cursor-pointer items-center gap-2 text-sm',
        props.disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <Checkbox
        id={props.id}
        checked={props.checked}
        disabled={props.disabled}
        onCheckedChange={(checked) => props.onCheckedChange(checked === true)}
      />
      <span>{props.label}</span>
    </label>
  )
}

function buildResult(input: {
  mode: Mode
  numMin: string
  numMax: string
  numCount: string
  numUnique: boolean
  numIntegers: boolean
  numDecimals: string
  strLength: string
  strFlags: CharsetFlags
  strCount: string
  uuidCount: string
  pwLength: string
  pwFlags: CharsetFlags
  pwCount: string
  diceCount: string
  diceSides: string
  listRaw: string
  listAction: ListAction
}): string {
  switch (input.mode) {
    case 'number': {
      const values = randomNumbers({
        min: Number(input.numMin),
        max: Number(input.numMax),
        count: Number(input.numCount),
        unique: input.numUnique,
        integers: input.numIntegers,
        decimals: Number(input.numDecimals),
      })
      return values.join('\n')
    }
    case 'string': {
      const charset = charsetFromFlags(input.strFlags)
      const count = Math.min(100, Math.max(1, Math.floor(Number(input.strCount) || 1)))
      return Array.from({ length: count }, () =>
        randomString(Number(input.strLength), charset),
      ).join('\n')
    }
    case 'uuid':
      return randomUuids(Number(input.uuidCount)).join('\n')
    case 'password': {
      const count = Math.min(100, Math.max(1, Math.floor(Number(input.pwCount) || 1)))
      return Array.from({ length: count }, () =>
        randomPassword(Number(input.pwLength), input.pwFlags),
      ).join('\n')
    }
    case 'coin':
      return flipCoin()
    case 'dice': {
      const rolls = rollDice(Number(input.diceCount), Number(input.diceSides))
      const total = rolls.reduce((sum, n) => sum + n, 0)
      return rolls.length === 1
        ? String(rolls[0])
        : `${rolls.join(' + ')} = ${total}`
    }
    case 'list': {
      const items = parseList(input.listRaw)
      if (items.length === 0) throw new Error('Add at least one choice')
      if (input.listAction === 'pick') return randomPick(items)
      return shuffle(items).join('\n')
    }
    default:
      return ''
  }
}
