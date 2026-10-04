export type TipInput = {
  bill: number
  tipPercent: number
  people: number
}

export type TipResult = {
  tip: number
  total: number
  tipPerPerson: number
  totalPerPerson: number
}

export const TIP_PRESETS = [10, 15, 18, 20, 25] as const

export function roundMoney(value: number): number {
  // Avoid binary float traps (e.g. 64.5 * 0.15 → 9.674999…)
  return Math.round(value * 100 + 1e-8) / 100
}

export function calculateTip({
  bill,
  tipPercent,
  people,
}: TipInput): TipResult | null {
  if (!Number.isFinite(bill) || bill < 0) return null
  if (!Number.isFinite(tipPercent) || tipPercent < 0) return null
  if (!Number.isFinite(people) || people < 1) return null

  const tip = roundMoney(bill * (tipPercent / 100))
  const total = roundMoney(bill + tip)
  const tipPerPerson = roundMoney(tip / people)
  const totalPerPerson = roundMoney(total / people)

  return { tip, total, tipPerPerson, totalPerPerson }
}

export function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parseAmount(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '')
  if (!trimmed) return null
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return null
  return value
}
