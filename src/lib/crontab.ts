/** DIY cron parse / build / describe / next-runs. No external cron deps. */

export type CronFieldName =
  | 'second'
  | 'minute'
  | 'hour'
  | 'dayOfMonth'
  | 'month'
  | 'dayOfWeek'

export type CronFieldSpec = {
  name: CronFieldName
  label: string
  min: number
  max: number
  names?: readonly string[]
}

export const CRON_FIELDS: readonly CronFieldSpec[] = [
  { name: 'second', label: 'Second', min: 0, max: 59 },
  { name: 'minute', label: 'Minute', min: 0, max: 59 },
  { name: 'hour', label: 'Hour', min: 0, max: 23 },
  { name: 'dayOfMonth', label: 'Day of month', min: 1, max: 31 },
  {
    name: 'month',
    label: 'Month',
    min: 1,
    max: 12,
    names: [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ],
  },
  {
    name: 'dayOfWeek',
    label: 'Day of week',
    min: 0,
    max: 7,
    names: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  },
] as const

export type FieldMode = 'every' | 'step' | 'specific' | 'range' | 'list'

export type FieldState = {
  mode: FieldMode
  /** For step mode (e.g. every N) */
  step: number
  /** For specific / list */
  values: number[]
  /** For range */
  from: number
  to: number
  raw: string
}

export type CronState = {
  withSeconds: boolean
  fields: Record<CronFieldName, FieldState>
}

export type CronPreset = {
  id: string
  label: string
  expression: string
}

export const CRON_PRESETS: CronPreset[] = [
  { id: 'every-minute', label: 'Every minute', expression: '* * * * *' },
  { id: 'every-5-min', label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { id: 'every-15-min', label: 'Every 15 minutes', expression: '*/15 * * * *' },
  { id: 'hourly', label: 'Hourly', expression: '0 * * * *' },
  { id: 'daily-midnight', label: 'Daily at midnight', expression: '0 0 * * *' },
  { id: 'weekdays-9am', label: 'Weekdays at 9:00', expression: '0 9 * * 1-5' },
  { id: 'monday-9am', label: 'Mondays at 9:00', expression: '0 9 * * 1' },
  { id: 'weekends-10am', label: 'Weekends at 10:00', expression: '0 10 * * 0,6' },
  { id: 'monthly-1st', label: '1st of month, 00:00', expression: '0 0 1 * *' },
  { id: 'yearly', label: 'Jan 1, 00:00', expression: '0 0 1 1 *' },
]

const DOW_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function defaultField(spec: CronFieldSpec): FieldState {
  return {
    mode: 'every',
    step: 1,
    values: [spec.min],
    from: spec.min,
    to: spec.max,
    raw: '*',
  }
}

export function createDefaultCronState(withSeconds = false): CronState {
  const fields = {} as Record<CronFieldName, FieldState>
  for (const spec of CRON_FIELDS) {
    fields[spec.name] = defaultField(spec)
  }
  // Common default: top of every hour → 0 * * * *
  fields.minute = {
    mode: 'specific',
    step: 1,
    values: [0],
    from: 0,
    to: 59,
    raw: '0',
  }
  if (withSeconds) {
    fields.second = {
      mode: 'specific',
      step: 1,
      values: [0],
      from: 0,
      to: 59,
      raw: '0',
    }
  }
  return { withSeconds, fields }
}

export function fieldSpec(name: CronFieldName): CronFieldSpec {
  return CRON_FIELDS.find((f) => f.name === name)!
}

function normalizeToken(token: string, spec: CronFieldSpec): number | null {
  const upper = token.trim().toUpperCase()
  if (!upper) return null
  if (/^\d+$/.test(upper)) {
    const n = Number(upper)
    if (spec.name === 'dayOfWeek' && n === 7) return 0
    if (n < spec.min || n > spec.max) return null
    return n
  }
  if (spec.names) {
    const idx = spec.names.indexOf(upper as (typeof spec.names)[number])
    if (idx >= 0) {
      if (spec.name === 'month') return idx + 1
      return idx // dayOfWeek: SUN=0
    }
  }
  return null
}

export function parseFieldPart(
  raw: string,
  spec: CronFieldSpec,
): { ok: true; state: FieldState } | { ok: false; error: string } {
  const value = raw.trim()
  if (!value) return { ok: false, error: 'Empty field' }

  if (value === '*') {
    return { ok: true, state: { ...defaultField(spec), raw: '*' } }
  }

  const stepEvery = value.match(/^\*\/(\d+)$/)
  if (stepEvery) {
    const step = Number(stepEvery[1])
    if (!Number.isInteger(step) || step < 1) {
      return { ok: false, error: 'Invalid step' }
    }
    return {
      ok: true,
      state: {
        mode: 'step',
        step,
        values: [spec.min],
        from: spec.min,
        to: spec.max,
        raw: value,
      },
    }
  }

  const rangeStep = value.match(/^([^*\/,]+)-([^*\/,]+)(?:\/(\d+))?$/)
  if (rangeStep && !value.includes(',')) {
    const from = normalizeToken(rangeStep[1], spec)
    const to = normalizeToken(rangeStep[2], spec)
    const step = rangeStep[3] ? Number(rangeStep[3]) : 1
    if (from == null || to == null || from > to || !Number.isInteger(step) || step < 1) {
      return { ok: false, error: 'Invalid range' }
    }
    if (step === 1) {
      return {
        ok: true,
        state: {
          mode: 'range',
          step: 1,
          values: [from],
          from,
          to,
          raw: value,
        },
      }
    }
    return {
      ok: true,
      state: {
        mode: 'list',
        step,
        values: expandRange(from, to, step, spec),
        from,
        to,
        raw: value,
      },
    }
  }

  if (value.includes(',')) {
    const parts = value.split(',')
    const values: number[] = []
    for (const part of parts) {
      const range = part.match(/^([^*\/,]+)-([^*\/,]+)(?:\/(\d+))?$/)
      if (range) {
        const from = normalizeToken(range[1], spec)
        const to = normalizeToken(range[2], spec)
        const step = range[3] ? Number(range[3]) : 1
        if (from == null || to == null || from > to || step < 1) {
          return { ok: false, error: 'Invalid list range' }
        }
        values.push(...expandRange(from, to, step, spec))
        continue
      }
      const n = normalizeToken(part, spec)
      if (n == null) return { ok: false, error: `Invalid value “${part}”` }
      values.push(n)
    }
    const unique = [...new Set(values)].sort((a, b) => a - b)
    return {
      ok: true,
      state: {
        mode: unique.length === 1 ? 'specific' : 'list',
        step: 1,
        values: unique,
        from: unique[0] ?? spec.min,
        to: unique[unique.length - 1] ?? spec.max,
        raw: value,
      },
    }
  }

  const single = normalizeToken(value, spec)
  if (single == null) return { ok: false, error: `Invalid value “${value}”` }
  return {
    ok: true,
    state: {
      mode: 'specific',
      step: 1,
      values: [single],
      from: single,
      to: single,
      raw: value,
    },
  }
}

function expandRange(
  from: number,
  to: number,
  step: number,
  spec: CronFieldSpec,
): number[] {
  const out: number[] = []
  for (let n = from; n <= to; n += step) {
    if (spec.name === 'dayOfWeek' && n === 7) {
      out.push(0)
    } else {
      out.push(n)
    }
  }
  return [...new Set(out)].sort((a, b) => a - b)
}

export function serializeField(state: FieldState, spec: CronFieldSpec): string {
  switch (state.mode) {
    case 'every':
      return '*'
    case 'step':
      return `*/${Math.max(1, state.step)}`
    case 'specific':
      return String(clamp(state.values[0] ?? spec.min, spec.min, spec.max))
    case 'range': {
      const from = clamp(state.from, spec.min, spec.max)
      const to = clamp(state.to, spec.min, spec.max)
      return from <= to ? `${from}-${to}` : `${to}-${from}`
    }
    case 'list': {
      const values = [...new Set(state.values.map((v) => clamp(v, spec.min, spec.max)))]
        .sort((a, b) => a - b)
      return values.length ? values.join(',') : String(spec.min)
    }
    default:
      return state.raw || '*'
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

export function buildExpression(state: CronState): string {
  const order: CronFieldName[] = state.withSeconds
    ? ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']
    : ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']
  return order
    .map((name) => serializeField(state.fields[name], fieldSpec(name)))
    .join(' ')
}

export type ParseResult =
  | { ok: true; state: CronState }
  | { ok: false; error: string }

export function parseExpression(input: string): ParseResult {
  const trimmed = input.trim().replace(/\s+/g, ' ')
  if (!trimmed) return { ok: false, error: 'Expression is empty' }

  const parts = trimmed.split(' ')
  if (parts.length !== 5 && parts.length !== 6) {
    return {
      ok: false,
      error: 'Use 5 fields (min hour dom month dow) or 6 with seconds',
    }
  }

  const withSeconds = parts.length === 6
  const names: CronFieldName[] = withSeconds
    ? ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']
    : ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']

  const state = createDefaultCronState(withSeconds)
  state.withSeconds = withSeconds

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const parsed = parseFieldPart(parts[i], fieldSpec(name))
    if (!parsed.ok) {
      return { ok: false, error: `${fieldSpec(name).label}: ${parsed.error}` }
    }
    state.fields[name] = parsed.state
  }

  if (!withSeconds) {
    state.fields.second = defaultField(fieldSpec('second'))
  }

  return { ok: true, state }
}

/** Expand a field into matching integer values for matching. */
export function expandField(raw: string, spec: CronFieldSpec): number[] | null {
  const parsed = parseFieldPart(raw, spec)
  if (!parsed.ok) return null
  const { state } = parsed

  switch (state.mode) {
    case 'every': {
      const out: number[] = []
      for (let n = spec.min; n <= spec.max; n++) out.push(n)
      if (spec.name === 'dayOfWeek') {
        // 0 and 7 both Sunday — keep 0..6 for matching
        return out.filter((n) => n <= 6)
      }
      return out
    }
    case 'step': {
      const out: number[] = []
      for (let n = spec.min; n <= spec.max; n += state.step) out.push(n)
      if (spec.name === 'dayOfWeek') return out.filter((n) => n <= 6)
      return out
    }
    case 'specific':
    case 'list':
      return state.values.map((v) => (spec.name === 'dayOfWeek' && v === 7 ? 0 : v))
    case 'range': {
      return expandRange(state.from, state.to, 1, spec).filter((n) =>
        spec.name === 'dayOfWeek' ? n <= 6 : true,
      )
    }
    default:
      return null
  }
}

function matchesField(value: number, allowed: number[], isDow: boolean): boolean {
  if (isDow) {
    const v = value === 7 ? 0 : value
    return allowed.some((a) => (a === 7 ? 0 : a) === v)
  }
  return allowed.includes(value)
}

export function describeExpression(expression: string): string {
  const parsed = parseExpression(expression)
  if (!parsed.ok) return parsed.error

  const { state } = parsed
  const parts = expression.trim().replace(/\s+/g, ' ').split(' ')
  const withSeconds = parts.length === 6
  const offset = withSeconds ? 1 : 0

  const minuteRaw = parts[offset]
  const hourRaw = parts[offset + 1]
  const domRaw = parts[offset + 2]
  const monthRaw = parts[offset + 3]
  const dowRaw = parts[offset + 4]
  const secondRaw = withSeconds ? parts[0] : null

  const time = describeTime(minuteRaw, hourRaw, secondRaw)
  const dateBits: string[] = []

  if (domRaw !== '*' && dowRaw === '*') {
    dateBits.push(describeDom(domRaw))
  } else if (domRaw === '*' && dowRaw !== '*') {
    dateBits.push(describeDow(dowRaw))
  } else if (domRaw !== '*' && dowRaw !== '*') {
    dateBits.push(`${describeDom(domRaw)} and ${describeDow(dowRaw)}`)
  }

  if (monthRaw !== '*') {
    dateBits.push(describeMonth(monthRaw))
  }

  if (dateBits.length === 0) {
    return capitalize(`${time}, every day`)
  }
  return capitalize(`${time}, ${dateBits.join(', ')}`)
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function describeTime(
  minuteRaw: string,
  hourRaw: string,
  secondRaw: string | null,
): string {
  const secSuffix =
    secondRaw && secondRaw !== '0' && secondRaw !== '*'
      ? ` at second ${prettyField(secondRaw, 'second')}`
      : secondRaw === '*'
        ? ' every second'
        : ''

  if (minuteRaw === '*' && hourRaw === '*') {
    return `every minute${secSuffix}`
  }

  const stepMin = minuteRaw.match(/^\*\/(\d+)$/)
  if (stepMin && hourRaw === '*') {
    return `every ${stepMin[1]} minutes${secSuffix}`
  }

  if (hourRaw === '*' && minuteRaw !== '*') {
    const m = prettyField(minuteRaw, 'minute')
    return `every hour at minute ${m}${secSuffix}`
  }

  if (/^\d+$/.test(minuteRaw) && /^\d+$/.test(hourRaw)) {
    return `at ${pad(hourRaw)}:${pad(minuteRaw)}${secSuffix}`
  }

  if (/^\d+$/.test(hourRaw)) {
    return `at ${pad(hourRaw)}:xx (minute ${prettyField(minuteRaw, 'minute')})${secSuffix}`
  }

  return `when minute is ${prettyField(minuteRaw, 'minute')} and hour is ${prettyField(hourRaw, 'hour')}${secSuffix}`
}

function describeDom(raw: string): string {
  if (raw === '*') return 'every day of the month'
  const step = raw.match(/^\*\/(\d+)$/)
  if (step) return `every ${step[1]} days of the month`
  if (/^\d+$/.test(raw)) return `on day ${raw} of the month`
  return `on days ${prettyField(raw, 'dayOfMonth')} of the month`
}

function describeDow(raw: string): string {
  if (raw === '*') return 'every weekday'
  if (raw === '1-5') return 'on weekdays'
  if (raw === '0,6' || raw === '6,0') return 'on weekends'
  const labels = expandField(raw, fieldSpec('dayOfWeek'))
  if (!labels) return `on ${raw}`
  if (labels.length === 1) return `on ${DOW_LABELS[labels[0]!]}s`
  return `on ${labels.map((d) => DOW_LABELS[d]!).join(', ')}`
}

function describeMonth(raw: string): string {
  if (raw === '*') return 'every month'
  const vals = expandField(raw, fieldSpec('month'))
  if (!vals) return `in month ${raw}`
  if (vals.length === 1) return `in ${MONTH_LABELS[vals[0]! - 1]}`
  return `in ${vals.map((m) => MONTH_LABELS[m - 1]).join(', ')}`
}

function prettyField(raw: string, name: CronFieldName): string {
  const parsed = parseFieldPart(raw, fieldSpec(name))
  if (!parsed.ok) return raw
  const { state } = parsed
  switch (state.mode) {
    case 'every':
      return 'every'
    case 'step':
      return `every ${state.step}`
    case 'specific':
      return String(state.values[0])
    case 'range':
      return `${state.from}–${state.to}`
    case 'list':
      return state.values.join(', ')
    default:
      return raw
  }
}

function pad(n: string | number) {
  return String(n).padStart(2, '0')
}

export function nextRuns(
  expression: string,
  count = 5,
  from: Date = new Date(),
): { ok: true; dates: Date[] } | { ok: false; error: string } {
  const parsed = parseExpression(expression)
  if (!parsed.ok) return parsed

  const parts = expression.trim().replace(/\s+/g, ' ').split(' ')
  const withSeconds = parts.length === 6
  const offset = withSeconds ? 1 : 0

  const seconds = withSeconds
    ? expandField(parts[0], fieldSpec('second'))
    : [0]
  const minutes = expandField(parts[offset], fieldSpec('minute'))
  const hours = expandField(parts[offset + 1], fieldSpec('hour'))
  const doms = expandField(parts[offset + 2], fieldSpec('dayOfMonth'))
  const months = expandField(parts[offset + 3], fieldSpec('month'))
  const dows = expandField(parts[offset + 4], fieldSpec('dayOfWeek'))

  if (!seconds || !minutes || !hours || !doms || !months || !dows) {
    return { ok: false, error: 'Could not expand expression' }
  }

  const dates: Date[] = []
  const cursor = new Date(from.getTime())
  // Start at next second (or next minute boundary when no seconds field)
  if (withSeconds) {
    cursor.setMilliseconds(0)
    cursor.setSeconds(cursor.getSeconds() + 1)
  } else {
    cursor.setSeconds(0, 0)
    cursor.setMinutes(cursor.getMinutes() + 1)
  }

  // Hard cap: scan up to ~4 years of minutes / seconds
  const maxIterations = withSeconds ? 60 * 60 * 24 * 400 : 60 * 24 * 400 * 2
  let iterations = 0

  while (dates.length < count && iterations < maxIterations) {
    iterations++
    const y = cursor.getFullYear()
    const mo = cursor.getMonth() + 1
    const d = cursor.getDate()
    const h = cursor.getHours()
    const mi = cursor.getMinutes()
    const s = cursor.getSeconds()
    const dow = cursor.getDay()

    const monthOk = matchesField(mo, months, false)
    const hourOk = matchesField(h, hours, false)
    const minuteOk = matchesField(mi, minutes, false)
    const secondOk = matchesField(s, seconds, false)

    const domStar = parts[offset + 2] === '*'
    const dowStar = parts[offset + 4] === '*'
    let dayOk = true
    if (!domStar && !dowStar) {
      // Standard cron: when both set, either may match (OR)
      dayOk =
        matchesField(d, doms, false) || matchesField(dow, dows, true)
    } else if (!domStar) {
      dayOk = matchesField(d, doms, false)
    } else if (!dowStar) {
      dayOk = matchesField(dow, dows, true)
    }

    if (monthOk && dayOk && hourOk && minuteOk && secondOk) {
      dates.push(new Date(cursor.getTime()))
    }

    if (withSeconds) {
      cursor.setSeconds(cursor.getSeconds() + 1)
    } else {
      cursor.setMinutes(cursor.getMinutes() + 1)
    }

    // Skip impossible months early-ish via year rollover only
    void y
  }

  if (dates.length === 0) {
    return { ok: false, error: 'No upcoming runs found (check the expression)' }
  }

  return { ok: true, dates }
}

export function formatRun(date: Date, withSeconds: boolean): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  }
  return new Intl.DateTimeFormat(undefined, opts).format(date)
}

export function setFieldMode(
  state: FieldState,
  mode: FieldMode,
  spec: CronFieldSpec,
): FieldState {
  const next: FieldState = { ...state, mode }
  if (mode === 'every') next.raw = '*'
  if (mode === 'step') {
    next.step = Math.max(1, state.step || 1)
    next.raw = `*/${next.step}`
  }
  if (mode === 'specific') {
    next.values = [state.values[0] ?? spec.min]
    next.raw = String(next.values[0])
  }
  if (mode === 'range') {
    next.from = state.from ?? spec.min
    next.to = state.to ?? spec.max
    next.raw = `${next.from}-${next.to}`
  }
  if (mode === 'list') {
    next.values =
      state.values.length > 0 ? [...state.values] : [spec.min]
    next.raw = next.values.join(',')
  }
  return next
}

export function toggleListValue(
  state: FieldState,
  value: number,
  spec: CronFieldSpec,
): FieldState {
  const set = new Set(state.values)
  if (set.has(value)) set.delete(value)
  else set.add(value)
  const values = [...set].sort((a, b) => a - b)
  if (values.length === 0) values.push(spec.min)
  return {
    ...state,
    mode: values.length === 1 ? 'specific' : 'list',
    values,
    raw: values.join(','),
  }
}
