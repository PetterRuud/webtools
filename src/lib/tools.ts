export type ToolCategoryId = 'text' | 'image' | 'color' | 'encode'

export type ToolCategory = {
  id: ToolCategoryId
  label: string
}

export type ToolLink = {
  to:
    | '/tools/hex-rgba'
    | '/tools/image-compress'
    | '/tools/image-format'
    | '/tools/json-formatter'
    | '/tools/regex'
    | '/tools/base64'
    | '/tools/text-diff'
  name: string
  shortName: string
  blurb: string
  category: ToolCategoryId
  keywords: string[]
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: 'text', label: 'Text' },
  { id: 'image', label: 'Images' },
  { id: 'color', label: 'Color' },
  { id: 'encode', label: 'Encode' },
]

export const TOOLS: ToolLink[] = [
  {
    to: '/tools/json-formatter',
    name: 'JSON formatter',
    shortName: 'JSON',
    blurb: 'Pretty-print, minify, and validate JSON — then copy the result.',
    category: 'text',
    keywords: ['json', 'pretty', 'minify', 'validate', 'format'],
  },
  {
    to: '/tools/regex',
    name: 'Regex editor',
    shortName: 'Regex',
    blurb: 'Pattern, flags, and a test string with live match highlights.',
    category: 'text',
    keywords: ['regex', 'regexp', 'pattern', 'match', 'test'],
  },
  {
    to: '/tools/text-diff',
    name: 'Text diff',
    shortName: 'Diff',
    blurb: 'Compare two texts side by side and see what changed.',
    category: 'text',
    keywords: ['diff', 'compare', 'delta', 'changes', 'patch'],
  },
  {
    to: '/tools/image-compress',
    name: 'Image compress',
    shortName: 'Compress',
    blurb: 'Crop, scale, and quality — shrink a photo in the browser.',
    category: 'image',
    keywords: ['image', 'compress', 'jpg', 'jpeg', 'png', 'webp', 'crop', 'scale'],
  },
  {
    to: '/tools/image-format',
    name: 'Image format',
    shortName: 'Format',
    blurb: 'Convert between PNG, JPEG, and WebP. Same size; new format.',
    category: 'image',
    keywords: ['image', 'convert', 'png', 'jpeg', 'jpg', 'webp', 'format'],
  },
  {
    to: '/tools/hex-rgba',
    name: 'CSS Color',
    shortName: 'Color',
    blurb:
      'Hex, rgba, hsl/hsla, hwb, oklch — paste any one, copy the rest.',
    category: 'color',
    keywords: ['color', 'hex', 'rgba', 'hsl', 'hwb', 'oklch', 'css'],
  },
  {
    to: '/tools/base64',
    name: 'Base64',
    shortName: 'Base64',
    blurb: 'Encode or decode text with UTF-8-safe Base64 in the browser.',
    category: 'encode',
    keywords: ['base64', 'encode', 'decode', 'utf-8', 'b64'],
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
