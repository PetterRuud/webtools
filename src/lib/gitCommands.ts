export type GitCommandId =
  | 'churn'
  | 'authors'
  | 'bugs'
  | 'velocity'
  | 'firefighting'

export type GitCommand = {
  id: GitCommandId
  title: string
  blurb: string
  /** Params this command uses when building the copyable string. */
  params: Array<'since' | 'head' | 'bugGrep' | 'fireGrep'>
  keywords: string[]
}

export type GitCommandParams = {
  since: string
  head: number
  bugGrep: string
  fireGrep: string
}

export const SINCE_PRESETS = [
  { id: '90.days', label: '90 days', value: '90 days ago' },
  { id: '6.months', label: '6 months', value: '6 months ago' },
  { id: '1.year', label: '1 year', value: '1 year ago' },
  { id: '2.years', label: '2 years', value: '2 years ago' },
] as const

export const HEAD_PRESETS = [10, 20, 50] as const

export const DEFAULT_GIT_PARAMS: GitCommandParams = {
  since: '1 year ago',
  head: 20,
  bugGrep: 'fix|bug|broken',
  fireGrep: 'revert|hotfix|emergency|rollback',
}

export const GIT_COMMANDS: GitCommand[] = [
  {
    id: 'churn',
    title: 'What changes the most',
    blurb: 'Files touched most often in the window.',
    params: ['since', 'head'],
    keywords: [
      'churn',
      'files',
      'hotspot',
      'name-only',
      'uniq',
      'log',
      'since',
      'head',
    ],
  },
  {
    id: 'authors',
    title: 'Who built this',
    blurb: 'Commit counts per author (no merges).',
    params: [],
    keywords: [
      'authors',
      'contributors',
      'shortlog',
      'who',
      'team',
      'commits',
    ],
  },
  {
    id: 'bugs',
    title: 'Where do bugs cluster',
    blurb: 'Files named in fix/bug/broken commit messages.',
    params: ['bugGrep', 'head'],
    keywords: [
      'bugs',
      'fix',
      'broken',
      'grep',
      'cluster',
      'hotspot',
      'name-only',
    ],
  },
  {
    id: 'velocity',
    title: 'Accelerating or dying',
    blurb: 'Commit volume by year-month.',
    params: [],
    keywords: [
      'velocity',
      'activity',
      'accelerating',
      'dying',
      'monthly',
      'trend',
      'date',
    ],
  },
  {
    id: 'firefighting',
    title: 'How often firefighting',
    blurb: 'Reverts, hotfixes, emergencies, rollbacks.',
    params: ['since', 'fireGrep'],
    keywords: [
      'firefighting',
      'revert',
      'hotfix',
      'emergency',
      'rollback',
      'incident',
      'grep',
    ],
  },
]

function shellQuote(value: string): string {
  // Always quote when shell metacharacters (esp. |) are present.
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) return value
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function buildGitCommand(
  id: GitCommandId,
  params: GitCommandParams = DEFAULT_GIT_PARAMS,
): string {
  const since = params.since.trim() || DEFAULT_GIT_PARAMS.since
  const head =
    Number.isFinite(params.head) && params.head > 0
      ? Math.floor(params.head)
      : DEFAULT_GIT_PARAMS.head
  const bugGrep = params.bugGrep.trim() || DEFAULT_GIT_PARAMS.bugGrep
  const fireGrep = params.fireGrep.trim() || DEFAULT_GIT_PARAMS.fireGrep

  switch (id) {
    case 'churn':
      return `git log --format=format: --name-only --since=${shellQuote(since)} | sort | uniq -c | sort -nr | head -${head}`
    case 'authors':
      return 'git shortlog -sn --no-merges'
    case 'bugs':
      return `git log -i -E --grep=${shellQuote(bugGrep)} --name-only --format='' | sort | uniq -c | sort -nr | head -${head}`
    case 'velocity':
      return "git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c"
    case 'firefighting':
      return `git log --oneline --since=${shellQuote(since)} | grep -iE ${shellQuote(fireGrep)}`
  }
}

export function filterGitCommands(
  commands: GitCommand[],
  query: string,
): GitCommand[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return commands

  const tokens = normalized.split(/\s+/)
  return commands.filter((command) => {
    const haystack = [
      command.title,
      command.blurb,
      command.id,
      buildGitCommand(command.id),
      ...command.keywords,
    ]
      .join(' ')
      .toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
}
