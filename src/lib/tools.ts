export type ToolLink = {
  to:
    | '/tools/hex-rgba'
    | '/tools/image-compress'
    | '/tools/json-formatter'
    | '/tools/regex'
    | '/tools/base64'
    | '/tools/text-diff'
  name: string
  shortName: string
  blurb: string
}

export const TOOLS: ToolLink[] = [
  {
    to: '/tools/hex-rgba',
    name: 'CSS Color',
    shortName: 'Color',
    blurb:
      'Hex, rgba, hsl/hsla, hwb, oklch — paste any one, copy the rest.',
  },
  {
    to: '/tools/image-compress',
    name: 'Image compress',
    shortName: 'Compress',
    blurb: 'Shrink a photo in the browser. Nothing leaves this device.',
  },
  {
    to: '/tools/json-formatter',
    name: 'JSON formatter',
    shortName: 'JSON',
    blurb: 'Pretty-print, minify, and validate JSON — then copy the result.',
  },
  {
    to: '/tools/regex',
    name: 'Regex editor',
    shortName: 'Regex',
    blurb: 'Pattern, flags, and a test string with live match highlights.',
  },
  {
    to: '/tools/base64',
    name: 'Base64',
    shortName: 'Base64',
    blurb: 'Encode or decode text with UTF-8-safe Base64 in the browser.',
  },
  {
    to: '/tools/text-diff',
    name: 'Text diff',
    shortName: 'Diff',
    blurb: 'Compare two texts side by side and see what changed.',
  },
]
