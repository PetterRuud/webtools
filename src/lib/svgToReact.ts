import { parseSvg, serializeSvg } from '#/lib/svgEditor'

/** Explicit overrides that differ from simple kebab → camelCase. */
const ATTR_NAME_MAP: Record<string, string> = {
  class: 'className',
  tabindex: 'tabIndex',
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'arabic-form': 'arabicForm',
  'baseline-shift': 'baselineShift',
  'cap-height': 'capHeight',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-profile': 'colorProfile',
  'color-rendering': 'colorRendering',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'panose-1': 'panose1',
  'pointer-events': 'pointerEvents',
  'rendering-intent': 'renderingIntent',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'strikethrough-position': 'strikethroughPosition',
  'strikethrough-thickness': 'strikethroughThickness',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode-bidi': 'unicodeBidi',
  'unicode-range': 'unicodeRange',
  'units-per-em': 'unitsPerEm',
  'v-alphabetic': 'vAlphabetic',
  'v-hanging': 'vHanging',
  'v-ideographic': 'vIdeographic',
  'v-mathematical': 'vMathematical',
  'vector-effect': 'vectorEffect',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'x-height': 'xHeight',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xmlns:xlink': 'xmlnsXlink',
}

function kebabToCamel(name: string): string {
  return name.replace(/-([a-z])/gi, (_, c: string) => c.toUpperCase())
}

function colonToCamel(name: string): string {
  return name.replace(/:([a-z])/gi, (_, c: string) => c.toUpperCase())
}

export function toReactAttrName(name: string): string {
  const lower = name.toLowerCase()
  if (ATTR_NAME_MAP[lower]) return ATTR_NAME_MAP[lower]
  if (ATTR_NAME_MAP[name]) return ATTR_NAME_MAP[name]
  if (name.startsWith('aria-') || name.startsWith('data-')) return name
  if (name.includes(':')) return colonToCamel(kebabToCamel(name))
  if (name.includes('-')) return kebabToCamel(name)
  return name
}

function escapeJsxString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}

function cssPropToCamel(prop: string): string {
  const trimmed = prop.trim()
  if (trimmed.startsWith('--')) return trimmed
  if (trimmed.startsWith('-ms-')) {
    return `ms${kebabToCamel(trimmed.slice(4)).replace(/^[a-z]/, (c) =>
      c.toUpperCase(),
    )}`
  }
  return kebabToCamel(trimmed)
}

/** Convert a CSS style attribute string into a React style object literal. */
export function cssStyleToJsxObject(style: string): string {
  const entries: string[] = []
  for (const part of style.split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const colon = trimmed.indexOf(':')
    if (colon === -1) continue
    const prop = cssPropToCamel(trimmed.slice(0, colon))
    const value = trimmed.slice(colon + 1).trim()
    if (!prop || !value) continue
    const numeric = /^-?\d+(\.\d+)?$/.test(value)
    entries.push(
      numeric
        ? `${prop}: ${value}`
        : `${prop}: "${escapeJsxString(value)}"`,
    )
  }
  return `{ ${entries.join(', ')} }`
}

function formatAttrValue(name: string, value: string): string {
  if (name === 'style') {
    return `{${cssStyleToJsxObject(value)}}`
  }
  if (value === name) {
    // HTML boolean attr written as attr="attr"
    return '{true}'
  }
  return `"${escapeJsxString(value)}"`
}

function escapeJsxText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}

const VOID_SVG = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'stop',
  'use',
  'image',
])

function serializeNode(node: Node, indent: string, depth: number): string {
  const pad = indent.repeat(depth)

  if (node.nodeType === Node.COMMENT_NODE) {
    const body = (node.textContent ?? '').replace(/\*\//g, '*\\/')
    return `${pad}{/* ${body.trim()} */}`
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ''
    if (!text.trim()) return ''
    return `${pad}${escapeJsxText(text)}`
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as Element
  const tag = el.localName
  const attrs: string[] = []

  for (const attr of Array.from(el.attributes)) {
    const reactName = toReactAttrName(attr.name)
    attrs.push(`${reactName}=${formatAttrValue(reactName, attr.value)}`)
  }

  const attrBlock =
    attrs.length === 0
      ? ''
      : attrs.length === 1
        ? ` ${attrs[0]}`
        : `\n${attrs.map((a) => `${indent.repeat(depth + 1)}${a}`).join('\n')}\n${pad}`

  const children = Array.from(el.childNodes)
    .map((child) => serializeNode(child, indent, depth + 1))
    .filter(Boolean)

  const selfClose =
    children.length === 0 &&
    (VOID_SVG.has(tag) || el.childNodes.length === 0)

  if (selfClose) {
    if (attrs.length <= 1) return `${pad}<${tag}${attrBlock} />`
    return `${pad}<${tag}${attrBlock}/>`
  }

  if (children.length === 0) {
    return `${pad}<${tag}${attrBlock}></${tag}>`
  }

  return `${pad}<${tag}${attrBlock}>\n${children.join('\n')}\n${pad}</${tag}>`
}

export type SvgToReactOptions = {
  /** Component name. Defaults to `Icon`. */
  name?: string
  /** Indent size in spaces. Defaults to 2. */
  indent?: number
}

/**
 * Convert SVG markup into a copyable React function component.
 * Root `<svg>` receives `{...props}` last so callers can override size/className.
 */
export function svgToReactComponent(
  source: string,
  options: SvgToReactOptions = {},
): string {
  const name = options.name?.trim() || 'Icon'
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error('Component name must be PascalCase (e.g. Icon).')
  }

  const parsed = parseSvg(source)
  if (!parsed.ok) throw new Error(parsed.error)

  // Work on a clone so we can inject {...props} without mutating preview DOM.
  const cloneSource = serializeSvg(parsed.svg)
  const cloneParsed = parseSvg(cloneSource)
  if (!cloneParsed.ok) throw new Error(cloneParsed.error)

  const indent = ' '.repeat(options.indent ?? 2)
  const svg = cloneParsed.svg

  // Build opening tag attrs, then append {...props}
  const attrs: string[] = []
  for (const attr of Array.from(svg.attributes)) {
    const reactName = toReactAttrName(attr.name)
    attrs.push(`${reactName}=${formatAttrValue(reactName, attr.value)}`)
  }
  attrs.push('{...props}')

  // Depth: function → return (1) → <svg> (2) → children (3)
  const childJsx = Array.from(svg.childNodes)
    .map((child) => serializeNode(child, indent, 3))
    .filter(Boolean)

  const openAttrs = attrs
    .map((a) => `${indent.repeat(3)}${a}`)
    .join('\n')

  const svgPad = indent.repeat(2)
  const body =
    childJsx.length > 0
      ? `${svgPad}<svg\n${openAttrs}\n${svgPad}>\n${childJsx.join('\n')}\n${svgPad}</svg>`
      : `${svgPad}<svg\n${openAttrs}\n${svgPad}/>`

  return `function ${name}(props) {\n${indent}return (\n${body}\n${indent})\n}\n`
}
