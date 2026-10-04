export type BoxShadowParams = {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

export const DEFAULT_BOX_SHADOW: BoxShadowParams = {
  offsetX: 0,
  offsetY: 12,
  blur: 28,
  spread: -6,
  color: '#0f172a',
  opacity: 0.28,
  inset: false,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

export function formatShadowColor(color: string, opacity: number): string {
  const rgb = hexToRgb(color)
  const a = clamp(opacity, 0, 1)
  if (!rgb) return color
  if (a >= 1) return `#${color.trim().replace(/^#/, '').toLowerCase()}`
  const alpha = Number(a.toFixed(2))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export function formatBoxShadowValue(params: BoxShadowParams): string {
  const parts = [
    params.inset ? 'inset' : null,
    `${params.offsetX}px`,
    `${params.offsetY}px`,
    `${params.blur}px`,
    `${params.spread}px`,
    formatShadowColor(params.color, params.opacity),
  ].filter(Boolean)

  return parts.join(' ')
}

export function formatBoxShadowCss(params: BoxShadowParams): string {
  return `box-shadow: ${formatBoxShadowValue(params)};`
}
