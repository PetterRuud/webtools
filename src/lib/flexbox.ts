export const FLEX_DIRECTIONS = [
  'row',
  'row-reverse',
  'column',
  'column-reverse',
] as const

export const FLEX_WRAPS = ['nowrap', 'wrap', 'wrap-reverse'] as const

export const JUSTIFY_CONTENTS = [
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
] as const

export const ALIGN_ITEMS = [
  'stretch',
  'flex-start',
  'flex-end',
  'center',
  'baseline',
] as const

export type FlexDirection = (typeof FLEX_DIRECTIONS)[number]
export type FlexWrap = (typeof FLEX_WRAPS)[number]
export type JustifyContent = (typeof JUSTIFY_CONTENTS)[number]
export type AlignItems = (typeof ALIGN_ITEMS)[number]

export type FlexboxConfig = {
  flexDirection: FlexDirection
  flexWrap: FlexWrap
  justifyContent: JustifyContent
  alignItems: AlignItems
  gap: number
  itemCount: number
}

export const DEFAULT_FLEXBOX: FlexboxConfig = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: 12,
  itemCount: 4,
}

export const ITEM_COUNT_MIN = 1
export const ITEM_COUNT_MAX = 12
export const GAP_MIN = 0
export const GAP_MAX = 48

export function buildFlexboxCss(config: FlexboxConfig): string {
  return [
    'display: flex;',
    `flex-direction: ${config.flexDirection};`,
    `flex-wrap: ${config.flexWrap};`,
    `justify-content: ${config.justifyContent};`,
    `align-items: ${config.alignItems};`,
    `gap: ${config.gap}px;`,
  ].join('\n')
}

export function buildFlexboxRule(config: FlexboxConfig, selector = '.container'): string {
  return `${selector} {\n  ${buildFlexboxCss(config).split('\n').join('\n  ')}\n}`
}

export function shortLabel(value: string): string {
  return value.replace('flex-', '').replace('space-', 'sp-')
}
