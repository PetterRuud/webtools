export type ToolCategoryId =
  | 'text'
  | 'image'
  | 'color'
  | 'encode'
  | 'network'
  | 'browser'
  | 'http'

export type ToolCategory = {
  id: ToolCategoryId
  label: string
}

export type ToolLink = {
  to:
    | '/tools/hex-rgba'
    | '/tools/flexbox'
    | '/tools/box-shadow'
    | '/tools/image-compress'
    | '/tools/image-format'
    | '/tools/json-formatter'
    | '/tools/csv-json'
    | '/tools/regex'
    | '/tools/base64'
    | '/tools/text-diff'
    | '/tools/text-cleaner'
    | '/tools/ip-lookup'
    | '/tools/dns-lookup'
    | '/tools/browser-info'
    | '/tools/http-status'
    | '/tools/jwt'
  name: string
  shortName: string
  blurb: string
  category: ToolCategoryId
  keywords: string[]
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: 'text', label: 'Text' },
  { id: 'image', label: 'Images' },
  { id: 'color', label: 'Color / CSS / Layout' },
  { id: 'encode', label: 'Encode' },
  { id: 'network', label: 'Network' },
  { id: 'browser', label: 'Browser' },
  { id: 'http', label: 'HTTP' },
]

export const TOOLS: ToolLink[] = [
  {
    to: '/tools/json-formatter',
    name: 'JSON formatter',
    shortName: 'JSON',
    blurb: 'Pretty-print, minify, validate.',
    category: 'text',
    keywords: ['json', 'pretty', 'minify', 'validate', 'format'],
  },
  {
    to: '/tools/csv-json',
    name: 'CSV ↔ JSON',
    shortName: 'CSV/JSON',
    blurb: 'Convert either way.',
    category: 'text',
    keywords: ['csv', 'json', 'convert', 'delimiter', 'spreadsheet', 'table'],
  },
  {
    to: '/tools/regex',
    name: 'Regex editor',
    shortName: 'Regex',
    blurb: 'Pattern, flags, matches, breakdown.',
    category: 'text',
    keywords: ['regex', 'regexp', 'pattern', 'match', 'test'],
  },
  {
    to: '/tools/text-diff',
    name: 'Text diff',
    shortName: 'Diff',
    blurb: 'Side-by-side or unified line diff.',
    category: 'text',
    keywords: ['diff', 'compare', 'delta', 'changes', 'patch'],
  },
  {
    to: '/tools/text-cleaner',
    name: 'Text cleaner',
    shortName: 'Clean',
    blurb: 'Trim, spaces, HTML, quotes.',
    category: 'text',
    keywords: [
      'clean',
      'trim',
      'whitespace',
      'spaces',
      'blank',
      'html',
      'quotes',
      'normalize',
      'sanitize',
    ],
  },

  {
    to: '/tools/image-compress',
    name: 'Image compress',
    shortName: 'Compress',
    blurb: 'Crop, scale, quality.',
    category: 'image',
    keywords: ['image', 'compress', 'jpg', 'jpeg', 'png', 'webp', 'crop', 'scale'],
  },
  {
    to: '/tools/image-format',
    name: 'Image format',
    shortName: 'Format',
    blurb: 'PNG ↔ JPEG ↔ WebP.',
    category: 'image',
    keywords: ['image', 'convert', 'png', 'jpeg', 'jpg', 'webp', 'format'],
  },
  {
    to: '/tools/hex-rgba',
    name: 'CSS Color',
    shortName: 'Color',
    blurb: 'Hex, rgba, hsl, hwb, oklch.',
    category: 'color',
    keywords: ['color', 'hex', 'rgba', 'hsl', 'hwb', 'oklch', 'css'],
  },
  {
    to: '/tools/flexbox',
    name: 'Flexbox',
    shortName: 'Flex',
    blurb: 'Direction, wrap, justify, align, gap.',
    category: 'color',
    keywords: [
      'flexbox',
      'flex',
      'css',
      'layout',
      'justify',
      'align',
      'gap',
      'wrap',
    ],
  },
  {
    to: '/tools/box-shadow',
    name: 'Box shadow',
    shortName: 'Shadow',
    blurb: 'Offset, blur, spread, color, inset.',
    category: 'color',
    keywords: [
      'box-shadow',
      'shadow',
      'css',
      'blur',
      'spread',
      'inset',
      'offset',
    ],
  },
  {
    to: '/tools/base64',
    name: 'Base64',
    shortName: 'Base64',
    blurb: 'UTF-8 encode / decode.',
    category: 'encode',
    keywords: ['base64', 'encode', 'decode', 'utf-8', 'b64'],
  },
  {
    to: '/tools/jwt',
    name: 'JWT',
    shortName: 'JWT',
    blurb: 'Decode / encode. Secrets stay local.',
    category: 'encode',
    keywords: ['jwt', 'token', 'encode', 'decode', 'hs256', 'json web token'],
  },
  {
    to: '/tools/ip-lookup',
    name: 'IP lookup',
    shortName: 'IP',
    blurb: 'Your IP or any address.',
    category: 'network',
    keywords: ['ip', 'lookup', 'geo', 'asn', 'network', 'address'],
  },
  {
    to: '/tools/dns-lookup',
    name: 'DNS lookup',
    shortName: 'DNS',
    blurb: 'A, AAAA, MX, TXT via DoH.',
    category: 'network',
    keywords: ['dns', 'lookup', 'doh', 'a', 'aaaa', 'mx', 'txt', 'cname', 'ns'],
  },
  {
    to: '/tools/browser-info',
    name: 'Browser info',
    shortName: 'Browser',
    blurb: 'UA, viewport, storage flags.',
    category: 'browser',
    keywords: [
      'browser',
      'user agent',
      'viewport',
      'cookies',
      'localStorage',
      'navigator',
      'device',
    ],
  },
  {
    to: '/tools/http-status',
    name: 'HTTP status',
    shortName: 'Status',
    blurb: 'Searchable status codes.',
    category: 'http',
    keywords: ['http', 'status', 'code', '404', '500', 'response'],
  },
]

export function categoryLabel(id: ToolCategoryId): string {
  return TOOL_CATEGORIES.find((category) => category.id === id)?.label ?? id
}

export function toolMatchesQuery(tool: ToolLink, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    tool.name,
    tool.shortName,
    tool.blurb,
    categoryLabel(tool.category),
    ...tool.keywords,
  ]
    .join(' ')
    .toLowerCase()

  return normalized
    .split(/\s+/)
    .every((token) => haystack.includes(token))
}

export function filterTools(
  tools: ToolLink[],
  options: { query?: string; category?: ToolCategoryId | 'all' } = {},
): ToolLink[] {
  const category = options.category ?? 'all'
  const query = options.query ?? ''

  return tools.filter((tool) => {
    if (category !== 'all' && tool.category !== category) return false
    return toolMatchesQuery(tool, query)
  })
}

export function groupToolsByCategory(tools: ToolLink[]): Array<{
  category: ToolCategory
  tools: ToolLink[]
}> {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category.id),
  })).filter((group) => group.tools.length > 0)
}
