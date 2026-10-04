import { useMemo, useState } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import {
  TIP_PRESETS,
  calculateTip,
  formatMoney,
  parseAmount,
} from '#/lib/tip'

const DEFAULT_BILL = '64.50'
const DEFAULT_TIP = 15
const DEFAULT_PEOPLE = 2

export function TipCalculatorTool() {
  const [billDraft, setBillDraft] = useState(DEFAULT_BILL)
  const [tipPercent, setTipPercent] = useState(DEFAULT_TIP)
  const [peopleDraft, setPeopleDraft] = useState(String(DEFAULT_PEOPLE))

  const bill = parseAmount(billDraft)
  const people = parseAmount(peopleDraft)
  const peopleInt =
    people !== null && people >= 1 ? Math.floor(people) : null

  const result = useMemo(() => {
    if (bill === null || peopleInt === null) return null
    return calculateTip({ bill, tipPercent, people: peopleInt })
  }, [bill, tipPercent, peopleInt])

  const billInvalid = billDraft.trim() !== '' && (bill === null || bill < 0)
  const peopleInvalid =
    peopleDraft.trim() !== '' &&
    (peopleInt === null || peopleInt < 1)

  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:items-start lg:gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tip-bill">Bill amount</Label>
          <Input
            id="tip-bill"
            inputMode="decimal"
            value={billDraft}
            onValueChange={setBillDraft}
            aria-invalid={billInvalid}
            placeholder="0.00"
            className="font-mono text-[0.95rem] tabular-nums"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="tip-percent">Tip %</Label>
            <span className="rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 font-mono text-sm tabular-nums text-muted-foreground">
              {tipPercent}%
            </span>
          </div>
          <Slider
            id="tip-percent"
            min={0}
            max={50}
            step={1}
            value={[tipPercent]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === 'number') setTipPercent(next)
            }}
          />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {TIP_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                size="xs"
                variant={tipPercent === preset ? 'default' : 'outline'}
                onClick={() => setTipPercent(preset)}
              >
                {preset}%
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="tip-people">Split people</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {peopleInt ?? '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Fewer people"
              disabled={peopleInt === null || peopleInt <= 1}
              onClick={() => {
                if (peopleInt !== null && peopleInt > 1) {
                  setPeopleDraft(String(peopleInt - 1))
                }
              }}
            >
              <MinusIcon />
            </Button>
            <Input
              id="tip-people"
              inputMode="numeric"
              value={peopleDraft}
              onValueChange={setPeopleDraft}
              aria-invalid={peopleInvalid}
              className="text-center font-mono text-[0.95rem] tabular-nums"
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="More people"
              onClick={() => {
                const next = peopleInt === null ? 1 : peopleInt + 1
                setPeopleDraft(String(next))
              }}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setBillDraft(DEFAULT_BILL)
              setTipPercent(DEFAULT_TIP)
              setPeopleDraft(String(DEFAULT_PEOPLE))
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div
        className="rounded-xl border border-border/80 bg-card px-4 py-4 sm:px-5"
        aria-live="polite"
      >
        <p className="m-0 mb-3 text-sm font-medium text-muted-foreground">
          Result
        </p>
        <ResultRow
          label="Bill"
          value={result && bill !== null ? formatMoney(bill) : '—'}
        />
        <ResultRow
          label={`Tip (${tipPercent}%)`}
          value={result ? formatMoney(result.tip) : '—'}
        />
        <div className="my-2 border-t border-border/80" />
        <ResultRow
          label="Total"
          value={result ? formatMoney(result.total) : '—'}
          emphasize
        />
        <div className="my-2 border-t border-border/80" />
        <ResultRow
          label={`Split × ${peopleInt ?? '—'}`}
          value={result ? formatMoney(result.totalPerPerson) : '—'}
          emphasize
        />
        <ResultRow
          label="Tip / person"
          value={result ? formatMoney(result.tipPerPerson) : '—'}
        />
      </div>
    </div>
  )
}

function ResultRow({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          emphasize
            ? 'font-heading text-xl tabular-nums tracking-tight text-ink sm:text-2xl'
            : 'font-mono text-base tabular-nums text-foreground'
        }
      >
        {value}
      </span>
    </div>
  )
}
