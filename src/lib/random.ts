/** Cryptographically strong helpers for local random generation. */

export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(min)
  const hi = Math.floor(max)
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) {
    throw new Error('Invalid integer range')
  }
  const range = hi - lo + 1
  if (range > 0x1_0000_0000) {
    throw new Error('Range too large')
  }
  const maxUnbiased = Math.floor(0x1_0000_0000 / range) * range
  const buf = new Uint32Array(1)
  let value = 0
  do {
    crypto.getRandomValues(buf)
    value = buf[0]!
  } while (value >= maxUnbiased)
  return lo + (value % range)
}

export function randomFloat(min: number, max: number, decimals: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    throw new Error('Invalid float range')
  }
  const places = Math.min(12, Math.max(0, Math.floor(decimals)))
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  const unit = buf[0]! / 0x1_0000_0000
  const value = min + unit * (max - min)
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

export function randomPick<T>(items: readonly T[]): T {
  if (items.length === 0) throw new Error('Nothing to pick')
  return items[randomInt(0, items.length - 1)]!
}

export function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  return next
}

export function randomNumbers(options: {
  min: number
  max: number
  count: number
  unique: boolean
  integers: boolean
  decimals: number
}): number[] {
  const count = clampCount(options.count)
  if (options.integers) {
    const lo = Math.ceil(options.min)
    const hi = Math.floor(options.max)
    if (hi < lo) throw new Error('Invalid integer range')
    const span = hi - lo + 1
    if (options.unique) {
      if (count > span) throw new Error('Not enough unique values in range')
      return shuffle(
        Array.from({ length: span }, (_, i) => lo + i),
      ).slice(0, count)
    }
    return Array.from({ length: count }, () => randomInt(lo, hi))
  }
  return Array.from({ length: count }, () =>
    randomFloat(options.min, options.max, options.decimals),
  )
}

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*_-+=?'

export type CharsetFlags = {
  lower: boolean
  upper: boolean
  digits: boolean
  symbols: boolean
}

export function charsetFromFlags(flags: CharsetFlags): string {
  let out = ''
  if (flags.lower) out += LOWER
  if (flags.upper) out += UPPER
  if (flags.digits) out += DIGITS
  if (flags.symbols) out += SYMBOLS
  return out
}

export function randomString(length: number, charset: string): string {
  const len = Math.min(512, Math.max(1, Math.floor(length)))
  if (!charset) throw new Error('Select at least one character set')
  const chars = [...charset]
  let out = ''
  for (let i = 0; i < len; i += 1) {
    out += chars[randomInt(0, chars.length - 1)]
  }
  return out
}

export function randomPassword(
  length: number,
  flags: CharsetFlags,
): string {
  const len = Math.min(128, Math.max(4, Math.floor(length)))
  const pools: string[] = []
  if (flags.lower) pools.push(LOWER)
  if (flags.upper) pools.push(UPPER)
  if (flags.digits) pools.push(DIGITS)
  if (flags.symbols) pools.push(SYMBOLS)
  if (pools.length === 0) throw new Error('Select at least one character set')

  const required = pools.map((pool) => pool[randomInt(0, pool.length - 1)]!)
  const all = pools.join('')
  const rest = Array.from({ length: Math.max(0, len - required.length) }, () =>
    all[randomInt(0, all.length - 1)]!,
  )
  return shuffle([...required, ...rest]).join('').slice(0, len)
}

export function randomUuid(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function randomUuids(count: number): string[] {
  return Array.from({ length: clampCount(count) }, () => randomUuid())
}

export type CoinSide = 'Heads' | 'Tails'

export function flipCoin(): CoinSide {
  return randomInt(0, 1) === 0 ? 'Heads' : 'Tails'
}

export function rollDice(count: number, sides: number): number[] {
  const n = Math.min(20, Math.max(1, Math.floor(count)))
  const faces = Math.min(1000, Math.max(2, Math.floor(sides)))
  return Array.from({ length: n }, () => randomInt(1, faces))
}

export const DND_DIE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const

export type DnDDieSides = (typeof DND_DIE_SIDES)[number]

export type DnDAdvantage = 'normal' | 'advantage' | 'disadvantage'

export type DnDRollResult = {
  expression: string
  rolls: number[]
  kept: number[]
  dropped: number[]
  modifier: number
  subtotal: number
  total: number
  note: string | null
}

export function formatDnDRoll(result: DnDRollResult): string {
  const parts: string[] = [`${result.expression}`]
  if (result.note) parts.push(result.note)

  if (result.rolls.length === 1 && result.dropped.length === 0) {
    const die = String(result.rolls[0])
    if (result.modifier === 0) {
      parts.push(die)
    } else {
      const mod =
        result.modifier > 0 ? `+ ${result.modifier}` : `- ${Math.abs(result.modifier)}`
      parts.push(`${die} ${mod} = ${result.total}`)
    }
    return parts.join('\n')
  }

  const rollsLine =
    result.dropped.length > 0
      ? `rolls: ${result.rolls.join(', ')} (kept ${result.kept.join(', ')}; drop ${result.dropped.join(', ')})`
      : `rolls: ${result.rolls.join(', ')}`
  parts.push(rollsLine)

  if (result.modifier === 0) {
    parts.push(`total: ${result.total}`)
  } else {
    const mod =
      result.modifier > 0 ? `+ ${result.modifier}` : `- ${Math.abs(result.modifier)}`
    parts.push(`${result.subtotal} ${mod} = ${result.total}`)
  }
  return parts.join('\n')
}

export function rollDnD(options: {
  sides: number
  count: number
  modifier: number
  advantage: DnDAdvantage
  dropLowest?: number
}): DnDRollResult {
  const sides = Math.min(1000, Math.max(2, Math.floor(options.sides)))
  const modifier = Number.isFinite(options.modifier)
    ? Math.trunc(options.modifier)
    : 0
  const dropLowest = Math.max(0, Math.floor(options.dropLowest ?? 0))
  const advantage = options.advantage

  if (advantage !== 'normal') {
    if (sides !== 20) {
      throw new Error('Advantage / disadvantage is for d20 only')
    }
    const rolls = [randomInt(1, 20), randomInt(1, 20)]
    const keepIndex =
      advantage === 'advantage'
        ? rolls[0]! >= rolls[1]!
          ? 0
          : 1
        : rolls[0]! <= rolls[1]!
          ? 0
          : 1
    const subtotal = rolls[keepIndex]!
    const dropped = [rolls[keepIndex === 0 ? 1 : 0]!]
    const total = subtotal + modifier
    const modLabel =
      modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
    const tag = advantage === 'advantage' ? 'adv' : 'dis'
    return {
      expression: `1d20${modLabel} (${tag})`,
      rolls,
      kept: [subtotal],
      dropped,
      modifier,
      subtotal,
      total,
      note: null,
    }
  }

  const count = Math.min(20, Math.max(1, Math.floor(options.count)))
  if (dropLowest >= count) {
    throw new Error('Drop count must be less than dice count')
  }
  const rolls = Array.from({ length: count }, () => randomInt(1, sides))
  let kept = [...rolls]
  let dropped: number[] = []
  if (dropLowest > 0) {
    const sortedAsc = [...rolls].sort((a, b) => a - b)
    dropped = sortedAsc.slice(0, dropLowest)
    const dropPool = [...dropped]
    kept = []
    for (const value of rolls) {
      const idx = dropPool.indexOf(value)
      if (idx >= 0) {
        dropPool.splice(idx, 1)
        continue
      }
      kept.push(value)
    }
  }
  const subtotal = kept.reduce((sum, n) => sum + n, 0)
  const total = subtotal + modifier
  const modLabel =
    modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const dropLabel = dropLowest > 0 ? `dl${dropLowest}` : ''
  const expression = `${count}d${sides}${dropLabel}${modLabel}`
  return {
    expression,
    rolls,
    kept,
    dropped,
    modifier,
    subtotal,
    total,
    note: dropLowest > 0 ? `drop lowest ${dropLowest}` : null,
  }
}

export function parseList(raw: string): string[] {
  return raw
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function clampCount(count: number): number {
  return Math.min(100, Math.max(1, Math.floor(count)))
}
