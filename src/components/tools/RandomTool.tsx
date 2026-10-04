import { useEffect, useRef, useState } from 'react'
import {
  CoinsIcon,
  CopyIcon,
  DicesIcon,
  RotateCwIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  CoinVisual,
  DiceVisual,
  DnDVisual,
  RouletteVisual,
} from '#/components/tools/RandomVisuals'
import { copyText } from '#/lib/clipboard'
import {
  charsetFromFlags,
  DND_DIE_SIDES,
  flipCoin,
  formatDnDRoll,
  parseList,
  randomInt,
  randomNumbers,
  randomPassword,
  randomPick,
  randomString,
  randomUuids,
  rollDice,
  rollDnD,
  shuffle,
  type CharsetFlags,
  type CoinSide,
  type DnDAdvantage,
  type DnDDieSides,
  type DnDRollResult,
} from '#/lib/random'
import { cn } from '#/lib/utils'

type Mode =
  | 'number'
  | 'string'
  | 'uuid'
  | 'password'
  | 'coin'
  | 'dice'
  | 'dnd'
  | 'list'
  | 'roulette'

type ListAction = 'pick' | 'shuffle'

type RouletteEntry = { id: string; text: string }

type VisualState =
  | { kind: 'coin'; side: CoinSide; key: number }
  | { kind: 'dice'; rolls: number[]; sides: number; key: number }
  | { kind: 'dnd'; result: DnDRollResult; key: number }
  | {
      kind: 'roulette'
      options: string[]
      winner: string | null
      spinning: boolean
      highlightIndex: number
    }
  | null

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'number', label: 'Number' },
  { id: 'string', label: 'String' },
  { id: 'uuid', label: 'UUID' },
  { id: 'password', label: 'Password' },
  { id: 'coin', label: 'Coin' },
  { id: 'dice', label: 'Dice' },
  { id: 'dnd', label: 'D&D' },
  { id: 'list', label: 'List' },
  { id: 'roulette', label: 'Roulette' },
]

const DND_ADVANTAGE: Array<{ id: DnDAdvantage; label: string }> = [
  { id: 'normal', label: 'Normal' },
  { id: 'advantage', label: 'Adv' },
  { id: 'disadvantage', label: 'Dis' },
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

const DEFAULT_ROULETTE: RouletteEntry[] = [
  { id: 'r1', text: 'Pizza' },
  { id: 'r2', text: 'Sushi' },
  { id: 'r3', text: 'Tacos' },
  { id: 'r4', text: 'Burgers' },
]

const ROULETTE_KEY = 'webtools.random.roulette'
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
  dndSides: DnDDieSides
  dndCount: string
  dndModifier: string
  dndAdvantage: DnDAdvantage
  dndDropLowest: string
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
  dndSides: 20,
  dndCount: '1',
  dndModifier: '0',
  dndAdvantage: 'normal',
  dndDropLowest: '0',
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

function loadRoulette(): RouletteEntry[] {
  try {
    const raw = localStorage.getItem(ROULETTE_KEY)
    if (!raw) return DEFAULT_ROULETTE
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_ROULETTE
    const entries = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const record = item as { id?: unknown; text?: unknown }
        const text = typeof record.text === 'string' ? record.text.trim() : ''
        if (!text) return null
        const id =
          typeof record.id === 'string' && record.id
            ? record.id
            : `r-${Math.random().toString(36).slice(2, 9)}`
        return { id, text }
      })
      .filter((item): item is RouletteEntry => item != null)
    return entries.length > 0 ? entries : DEFAULT_ROULETTE
  } catch {
    return DEFAULT_ROULETTE
  }
}

function saveRoulette(entries: RouletteEntry[]) {
  try {
    localStorage.setItem(ROULETTE_KEY, JSON.stringify(entries))
  } catch {
    // ignore quota / private mode
  }
}

function newEntryId() {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function RandomTool() {
  const [state, setState] = useState<ToolState>(INITIAL)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [visual, setVisual] = useState<VisualState>(null)
  const [visualKey, setVisualKey] = useState(0)
  const [roulette, setRoulette] = useState<RouletteEntry[]>(DEFAULT_ROULETTE)
  const [rouletteDraft, setRouletteDraft] = useState('')
  const [rouletteSpinning, setRouletteSpinning] = useState(false)
  const spinTimer = useRef<ReturnType<typeof setInterval> | null>(null)

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
    dndSides,
    dndCount,
    dndModifier,
    dndAdvantage,
    dndDropLowest,
    listRaw,
    listAction,
  } = state

  function patch(partial: Partial<ToolState>) {
    setState((prev) => ({ ...prev, ...partial }))
  }

  function applyDnDPreset(partial: Partial<ToolState>) {
    const next = { ...state, mode: 'dnd' as const, ...partial }
    setState(next)
    generate(next)
  }

  function commit(value: string) {
    setOutput(value)
    setError(null)
    setHistory((prev) =>
      [value, ...prev.filter((item) => item !== value)].slice(0, HISTORY_LIMIT),
    )
  }

  function clearSpinTimer() {
    if (spinTimer.current) {
      clearInterval(spinTimer.current)
      spinTimer.current = null
    }
  }

  function setRouletteEntries(entries: RouletteEntry[]) {
    setRoulette(entries)
    saveRoulette(entries)
  }

  function generate(next: ToolState = state) {
    if (typeof crypto === 'undefined') return
    if (next.mode === 'roulette') {
      spinRoulette()
      return
    }

    clearSpinTimer()
    setRouletteSpinning(false)

    if (next.mode === 'coin') {
      const side = flipCoin()
      const key = visualKey + 1
      setVisualKey(key)
      setVisual({ kind: 'coin', side, key })
      commit(side)
      return
    }

    if (next.mode === 'dice') {
      try {
        const rolls = rollDice(Number(next.diceCount), Number(next.diceSides))
        const sides = Math.max(2, Math.floor(Number(next.diceSides) || 6))
        const total = rolls.reduce((sum, n) => sum + n, 0)
        const key = visualKey + 1
        setVisualKey(key)
        setVisual({ kind: 'dice', rolls, sides, key })
        commit(
          rolls.length === 1 ? String(rolls[0]) : `${rolls.join(' + ')} = ${total}`,
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not generate')
      }
      return
    }

    if (next.mode === 'dnd') {
      try {
        const modifier = Number(next.dndModifier)
        if (!Number.isFinite(modifier)) throw new Error('Modifier must be a number')
        const result = rollDnD({
          sides: next.dndSides,
          count: Number(next.dndCount),
          modifier,
          advantage: next.dndAdvantage,
          dropLowest: Number(next.dndDropLowest) || 0,
        })
        const key = visualKey + 1
        setVisualKey(key)
        setVisual({ kind: 'dnd', result, key })
        commit(formatDnDRoll(result))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not generate')
      }
      return
    }

    setVisual(null)
    const built = tryBuild(next)
    if (built.error) {
      setError(built.error)
      return
    }
    commit(built.value)
  }

  function spinRoulette() {
    const options = roulette.map((entry) => entry.text)
    if (options.length === 0) {
      setError('Add at least one option')
      setVisual({
        kind: 'roulette',
        options: [],
        winner: null,
        spinning: false,
        highlightIndex: 0,
      })
      return
    }

    clearSpinTimer()
    const winnerIndex = randomInt(0, options.length - 1)
    const winner = options[winnerIndex]!
    const totalTicks = 16 + winnerIndex + options.length
    let ticks = 0
    setRouletteSpinning(true)
    setError(null)
    setVisual({
      kind: 'roulette',
      options,
      winner: null,
      spinning: true,
      highlightIndex: 0,
    })

    spinTimer.current = setInterval(() => {
      ticks += 1
      const highlightIndex = ticks % options.length
      if (ticks >= totalTicks) {
        clearSpinTimer()
        setRouletteSpinning(false)
        setVisual({
          kind: 'roulette',
          options,
          winner,
          spinning: false,
          highlightIndex: winnerIndex,
        })
        commit(winner)
        return
      }
      setVisual({
        kind: 'roulette',
        options,
        winner: null,
        spinning: true,
        highlightIndex,
      })
    }, 55)
  }

  function selectMode(nextMode: Mode) {
    clearSpinTimer()
    setRouletteSpinning(false)
    const next = { ...state, mode: nextMode }
    setState(next)
    if (nextMode === 'roulette') {
      setVisual({
        kind: 'roulette',
        options: roulette.map((entry) => entry.text),
        winner: null,
        spinning: false,
        highlightIndex: 0,
      })
      setOutput('')
      setError(null)
      return
    }
    generate(next)
  }

  function addRouletteOption() {
    const text = rouletteDraft.trim()
    if (!text) return
    if (roulette.some((entry) => entry.text === text)) {
      setError('That option is already in the list')
      return
    }
    setError(null)
    const entries = [...roulette, { id: newEntryId(), text }]
    setRouletteEntries(entries)
    setRouletteDraft('')
    setVisual({
      kind: 'roulette',
      options: entries.map((entry) => entry.text),
      winner: visual?.kind === 'roulette' ? visual.winner : null,
      spinning: false,
      highlightIndex: 0,
    })
  }

  function removeRouletteOption(id: string) {
    const entries = roulette.filter((entry) => entry.id !== id)
    setRouletteEntries(entries)
    setVisual({
      kind: 'roulette',
      options: entries.map((entry) => entry.text),
      winner: null,
      spinning: false,
      highlightIndex: 0,
    })
  }

  useEffect(() => {
    setReady(true)
    setRoulette(loadRoulette())
    const result = tryBuild(INITIAL)
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.value)
    setError(null)
    setHistory([result.value])
    return () => {
      clearSpinTimer()
    }
  }, [])

  const showVisual =
    mode === 'coin' || mode === 'dice' || mode === 'dnd' || mode === 'roulette'

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
            <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-center font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Heads · Tails
            </div>
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
          {mode === 'dnd' ? (
            <DnDControls
              sides={dndSides}
              count={dndCount}
              modifier={dndModifier}
              advantage={dndAdvantage}
              dropLowest={dndDropLowest}
              onSides={(value) =>
                patch({
                  dndSides: value,
                  dndAdvantage: value === 20 ? dndAdvantage : 'normal',
                })
              }
              onCount={(value) => patch({ dndCount: value })}
              onModifier={(value) => patch({ dndModifier: value })}
              onAdvantage={(value) =>
                patch({
                  dndAdvantage: value,
                  dndSides: 20,
                  dndCount: value === 'normal' ? dndCount : '1',
                  dndDropLowest: '0',
                })
              }
              onDropLowest={(value) =>
                patch({
                  dndDropLowest: value,
                  dndAdvantage: 'normal',
                })
              }
              onPreset={applyDnDPreset}
            />
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
          {mode === 'roulette' ? (
            <RouletteControls
              draft={rouletteDraft}
              entries={roulette}
              spinning={rouletteSpinning}
              onDraftChange={setRouletteDraft}
              onAdd={addRouletteOption}
              onRemove={removeRouletteOption}
              onReset={() => {
                setRouletteEntries(DEFAULT_ROULETTE)
                setVisual({
                  kind: 'roulette',
                  options: DEFAULT_ROULETTE.map((entry) => entry.text),
                  winner: null,
                  spinning: false,
                  highlightIndex: 0,
                })
              }}
            />
          ) : null}

          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            <Button
              type="button"
              onClick={() => generate()}
              disabled={mode === 'roulette' && rouletteSpinning}
            >
              {mode === 'roulette' ? (
                <RotateCwIcon
                  data-icon="inline-start"
                  className={rouletteSpinning ? 'animate-spin' : undefined}
                />
              ) : mode === 'coin' ? (
                <CoinsIcon data-icon="inline-start" />
              ) : mode === 'dice' || mode === 'dnd' ? (
                <DicesIcon data-icon="inline-start" />
              ) : (
                <SparklesIcon data-icon="inline-start" />
              )}
              {mode === 'roulette'
                ? rouletteSpinning
                  ? 'Spinning…'
                  : 'Spin'
                : mode === 'coin'
                  ? 'Flip'
                  : mode === 'dice' || mode === 'dnd'
                    ? 'Roll'
                    : 'Generate'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!output || rouletteSpinning}
              onClick={() => void copyText(output, modeLabel(mode))}
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </div>
          {error ? (
            <p className="m-0 text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="random-output">Result</Label>
              <span className="text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                {modeLabel(mode)}
              </span>
            </div>

            {showVisual ? (
              <div
                className={cn(
                  'rounded-xl border border-border/70 px-3 py-2',
                  mode === 'roulette'
                    ? 'bg-card/40'
                    : mode === 'coin'
                      ? 'bg-muted/40'
                      : 'bg-card/30',
                )}
              >
                {visual?.kind === 'coin' ? (
                  <CoinVisual side={visual.side} flipKey={visual.key} />
                ) : null}
                {visual?.kind === 'dice' ? (
                  <DiceVisual
                    rolls={visual.rolls}
                    sides={visual.sides}
                    rollKey={visual.key}
                  />
                ) : null}
                {visual?.kind === 'dnd' ? (
                  <DnDVisual result={visual.result} rollKey={visual.key} />
                ) : null}
                {visual?.kind === 'roulette' ? (
                  <RouletteVisual
                    options={visual.options}
                    winner={visual.winner}
                    spinning={visual.spinning}
                    highlightIndex={visual.highlightIndex}
                  />
                ) : null}
                {!visual && mode === 'coin' ? (
                  <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                    Flip
                  </p>
                ) : null}
                {!visual && (mode === 'dice' || mode === 'dnd') ? (
                  <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                    Roll
                  </p>
                ) : null}
              </div>
            ) : null}

            <Textarea
              id="random-output"
              value={ready ? output : ''}
              readOnly
              spellCheck={false}
              placeholder={
                mode === 'roulette'
                  ? 'Spin to pick a winner…'
                  : 'Generate to see a result…'
              }
              className={cn(
                'font-mono text-[0.85rem] leading-5',
                showVisual ? 'min-h-24' : 'min-h-48',
              )}
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

function RouletteControls(props: {
  draft: string
  entries: RouletteEntry[]
  spinning: boolean
  onDraftChange: (value: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <Input
          id="roulette-draft"
          value={props.draft}
          onValueChange={props.onDraftChange}
          placeholder="Add option…"
          spellCheck={false}
          autoComplete="off"
          disabled={props.spinning}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              props.onAdd()
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0"
          disabled={props.spinning || !props.draft.trim()}
          onClick={props.onAdd}
        >
          Add
        </Button>
      </div>

      <div className="rounded-md border border-border/60">
        {props.entries.length === 0 ? (
          <p className="m-0 px-2.5 py-3 text-sm text-muted-foreground">
            No options yet.
          </p>
        ) : (
          <ul className="m-0 max-h-44 list-none overflow-y-auto p-0">
            {props.entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-1 border-b border-border/50 px-2 py-1 last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate font-mono text-xs">
                  {entry.text}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="size-7 shrink-0 p-0"
                  disabled={props.spinning}
                  onClick={() => props.onRemove(entry.id)}
                  aria-label={`Remove ${entry.text}`}
                >
                  <XIcon className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={props.spinning}
          onClick={props.onReset}
        >
          Reset sample
        </Button>
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
  disabled?: boolean
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
        disabled={props.disabled}
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
    <Label
      className={cn(
        'flex cursor-pointer items-center gap-2 text-sm font-normal',
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
    </Label>
  )
}

function DnDControls(props: {
  sides: DnDDieSides
  count: string
  modifier: string
  advantage: DnDAdvantage
  dropLowest: string
  onSides: (value: DnDDieSides) => void
  onCount: (value: string) => void
  onModifier: (value: string) => void
  onAdvantage: (value: DnDAdvantage) => void
  onDropLowest: (value: string) => void
  onPreset: (partial: Partial<ToolState>) => void
}) {
  const advActive = props.advantage !== 'normal'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {DND_DIE_SIDES.map((sides) => {
          const selected = props.sides === sides
          return (
            <button
              key={sides}
              type="button"
              onClick={() => props.onSides(sides)}
              className={cn(
                'inline-flex h-7 min-w-10 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              d{sides}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field
          id="dnd-count"
          label="Count"
          value={props.count}
          onValueChange={props.onCount}
          inputMode="numeric"
          disabled={advActive}
        />
        <Field
          id="dnd-mod"
          label="Modifier"
          value={props.modifier}
          onValueChange={props.onModifier}
          inputMode="decimal"
        />
        <Field
          id="dnd-drop"
          label="Drop low"
          value={props.dropLowest}
          onValueChange={props.onDropLowest}
          inputMode="numeric"
          disabled={advActive}
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {DND_ADVANTAGE.map((item) => {
          const selected = props.advantage === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => props.onAdvantage(item.id)}
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

      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            props.onPreset({
              dndSides: 20,
              dndCount: '1',
              dndModifier: '0',
              dndAdvantage: 'normal',
              dndDropLowest: '0',
            })
          }
        >
          Check
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            props.onPreset({
              dndSides: 20,
              dndCount: '1',
              dndModifier: props.modifier,
              dndAdvantage: 'advantage',
              dndDropLowest: '0',
            })
          }
        >
          Check adv
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            props.onPreset({
              dndSides: 20,
              dndCount: '1',
              dndModifier: props.modifier,
              dndAdvantage: 'disadvantage',
              dndDropLowest: '0',
            })
          }
        >
          Check dis
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            props.onPreset({
              dndSides: 6,
              dndCount: '2',
              dndModifier: '3',
              dndAdvantage: 'normal',
              dndDropLowest: '0',
            })
          }
        >
          2d6+3
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            props.onPreset({
              dndSides: 6,
              dndCount: '4',
              dndModifier: '0',
              dndAdvantage: 'normal',
              dndDropLowest: '1',
            })
          }
        >
          Stat 4d6dl
        </Button>
      </div>
    </div>
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
  dndSides: DnDDieSides
  dndCount: string
  dndModifier: string
  dndAdvantage: DnDAdvantage
  dndDropLowest: string
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
    case 'dnd': {
      const modifier = Number(input.dndModifier)
      if (!Number.isFinite(modifier)) throw new Error('Modifier must be a number')
      return formatDnDRoll(
        rollDnD({
          sides: input.dndSides,
          count: Number(input.dndCount),
          modifier,
          advantage: input.dndAdvantage,
          dropLowest: Number(input.dndDropLowest) || 0,
        }),
      )
    }
    case 'list': {
      const items = parseList(input.listRaw)
      if (items.length === 0) throw new Error('Add at least one choice')
      if (input.listAction === 'pick') return randomPick(items)
      return shuffle(items).join('\n')
    }
    case 'roulette':
      return ''
    default:
      return ''
  }
}
