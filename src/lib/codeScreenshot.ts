export type WindowChrome = 'macos' | 'windows' | 'none'

export type BackgroundPreset = {
  id: string
  label: string
  value: string
}

export const SAMPLE_CODE = `function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const values = Array.from({ length: 10 }, (_, i) => fibonacci(i))
console.log(values.join(', '))
`

export const LANGUAGES = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'tsx', label: 'TSX' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'jsx', label: 'JSX' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'java', label: 'Java' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'swift', label: 'Swift' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'php', label: 'PHP' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'scss', label: 'SCSS' },
  { id: 'json', label: 'JSON' },
  { id: 'yaml', label: 'YAML' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'sql', label: 'SQL' },
  { id: 'bash', label: 'Bash' },
  { id: 'shell', label: 'Shell' },
  { id: 'dockerfile', label: 'Dockerfile' },
  { id: 'toml', label: 'TOML' },
  { id: 'xml', label: 'XML' },
  { id: 'graphql', label: 'GraphQL' },
] as const

export type LanguageId = (typeof LANGUAGES)[number]['id']

export const THEMES = [
  { id: 'github-dark', label: 'GitHub Dark' },
  { id: 'github-light', label: 'GitHub Light' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'nord', label: 'Nord' },
  { id: 'one-dark-pro', label: 'One Dark Pro' },
  { id: 'one-light', label: 'One Light' },
  { id: 'catppuccin-mocha', label: 'Catppuccin Mocha' },
  { id: 'catppuccin-latte', label: 'Catppuccin Latte' },
  { id: 'vitesse-dark', label: 'Vitesse Dark' },
  { id: 'vitesse-light', label: 'Vitesse Light' },
  { id: 'material-theme-darker', label: 'Material Darker' },
  { id: 'material-theme-lighter', label: 'Material Lighter' },
  { id: 'tokyo-night', label: 'Tokyo Night' },
  { id: 'min-dark', label: 'Min Dark' },
  { id: 'min-light', label: 'Min Light' },
  { id: 'synthwave-84', label: 'Synthwave 84' },
  { id: 'rose-pine', label: 'Rosé Pine' },
  { id: 'rose-pine-dawn', label: 'Rosé Pine Dawn' },
  { id: 'night-owl', label: 'Night Owl' },
  { id: 'solarized-dark', label: 'Solarized Dark' },
  { id: 'solarized-light', label: 'Solarized Light' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'mint-dusk',
    label: 'Mint dusk',
    value: 'linear-gradient(135deg, #0f766e 0%, #134e4a 45%, #042f2e 100%)',
  },
  {
    id: 'slate-glow',
    label: 'Slate glow',
    value: 'linear-gradient(145deg, #1e293b 0%, #0f172a 55%, #020617 100%)',
  },
  {
    id: 'amber-ink',
    label: 'Amber ink',
    value: 'linear-gradient(140deg, #78350f 0%, #451a03 50%, #1c1917 100%)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    value: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 40%, #083344 100%)',
  },
  {
    id: 'solid-ink',
    label: 'Solid ink',
    value: '#111827',
  },
  {
    id: 'solid-paper',
    label: 'Solid paper',
    value: '#f4f4f5',
  },
  {
    id: 'transparent',
    label: 'Transparent',
    value: 'transparent',
  },
]

export const WINDOW_CHROMES: Array<{ id: WindowChrome; label: string }> = [
  { id: 'macos', label: 'macOS' },
  { id: 'windows', label: 'Windows' },
  { id: 'none', label: 'None' },
]

export const FONT_FAMILIES = [
  {
    id: 'jetbrains',
    label: 'JetBrains Mono',
    stack: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
  },
  {
    id: 'fira',
    label: 'Fira Code',
    stack: '"Fira Code", "SF Mono", Menlo, Consolas, monospace',
  },
  {
    id: 'ibm',
    label: 'IBM Plex Mono',
    stack: '"IBM Plex Mono", "SF Mono", Menlo, Consolas, monospace',
  },
  {
    id: 'system',
    label: 'System mono',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
] as const

export type FontFamilyId = (typeof FONT_FAMILIES)[number]['id']

export function extractShikiBackground(html: string): string | null {
  const match = html.match(/background-color:\s*([^;"']+)/i)
  return match?.[1]?.trim() ?? null
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  anchor.click()
}
