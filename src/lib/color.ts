export type Rgba = {
  r: number
  g: number
  b: number
  a: number
}

function clampChannel(value: number, max = 255): number {
  if (Number.isNaN(value)) return 0
  return Math.min(max, Math.max(0, value))
}

export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split('')
      .map((ch) => `${ch}${ch}`)
      .join('')
      .toLowerCase()}`
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`
  }
  if (/^[0-9a-fA-F]{8}$/.test(raw)) {
    return `#${raw.toLowerCase()}`
  }
  return null
}

export function hexToRgba(hexInput: string): Rgba | null {
  const hex = normalizeHex(hexInput)
  if (!hex) return null
  const body = hex.slice(1)
  if (body.length === 6) {
    return {
      r: Number.parseInt(body.slice(0, 2), 16),
      g: Number.parseInt(body.slice(2, 4), 16),
      b: Number.parseInt(body.slice(4, 6), 16),
      a: 1,
    }
  }
  return {
    r: Number.parseInt(body.slice(0, 2), 16),
    g: Number.parseInt(body.slice(2, 4), 16),
    b: Number.parseInt(body.slice(4, 6), 16),
    a: Number.parseInt(body.slice(6, 8), 16) / 255,
  }
}

export function rgbaToHex({ r, g, b, a }: Rgba, includeAlpha = a < 1): string {
  const toHex = (n: number) =>
    clampChannel(Math.round(n)).toString(16).padStart(2, '0')
  const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  if (!includeAlpha) return base
  return `${base}${toHex(clampChannel(a, 1) * 255)}`
}

export function formatRgba({ r, g, b, a }: Rgba): string {
  const alpha = Number.isInteger(a)
    ? String(a)
    : a.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`
}

export function parseRgba(input: string): Rgba | null {
  const trimmed = input.trim()
  const match = trimmed.match(
    /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i,
  )
  if (!match) return null
  const r = clampChannel(Number(match[1]))
  const g = clampChannel(Number(match[2]))
  const b = clampChannel(Number(match[3]))
  const a = match[4] === undefined ? 1 : clampChannel(Number(match[4]), 1)
  return { r, g, b, a }
}
