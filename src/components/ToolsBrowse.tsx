import { Link } from '@tanstack/react-router'
import {
  BinaryIcon,
  BracesIcon,
  ImageIcon,
  ImagesIcon,
  PaletteIcon,
  RegexIcon,
  SearchIcon,
  TextSelectIcon,
  XIcon,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  TOOL_CATEGORIES,
  TOOLS,
  filterTools,
  groupToolsByCategory,
  type ToolCategoryId,
  type ToolLink,
} from '#/lib/tools'

type ToolIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>

const TOOL_ICONS: Record<ToolLink['to'], ToolIcon> = {
  '/tools/json-formatter': BracesIcon,
  '/tools/regex': RegexIcon,
  '/tools/text-diff': TextSelectIcon,
  '/tools/image-compress': ImageIcon,
  '/tools/image-format': ImagesIcon,
  '/tools/hex-rgba': PaletteIcon,
  '/tools/base64': BinaryIcon,
}

type CategoryFilter = ToolCategoryId | 'all'

function matchesTransparent(query: string, category: CategoryFilter) {
  if (category !== 'all' && category !== 'image') return false
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  const haystack =
    'transparent placeholder png sharp local container image images tools/transparent'
  return normalized
    .split(/\s+/)
    .every((token) => haystack.includes(token))
}

export function ToolsBrowse() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
        return
      }
      event.preventDefault()
      searchRef.current?.focus()
      searchRef.current?.select()
    }

    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform
    if (/Mac|iPhone|iPad|iPod/i.test(platform)) {
      setShortcutLabel('⌘K')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const visibleTools = useMemo(
    () => filterTools(TOOLS, { query, category }),
    [query, category],
  )
  const groups = useMemo(
    () => groupToolsByCategory(visibleTools),
    [visibleTools],
  )
  const showTransparent = matchesTransparent(query, category)
  const visibleCount = visibleTools.length + (showTransparent ? 1 : 0)
  const totalCount = TOOLS.length + 1

  return (
    <section
      id="tools"
      className="flex scroll-mt-8 flex-col gap-4 border-t border-border/70 pt-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-heading m-0 text-xl tracking-tight text-ink">
          Tools
        </h2>
        <p className="m-0 shrink-0 text-sm text-muted-foreground tabular-nums">
          {visibleCount} / {totalCount}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Search tools</span>
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={searchRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search by name or job…"
            className="h-11 bg-card/70 pr-20 pl-10 text-sm shadow-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border/80 bg-muted/70 px-1.5 py-0.5 font-sans text-[0.7rem] text-muted-foreground sm:inline">
            {shortcutLabel}
          </kbd>
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
              className="absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground sm:right-14"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          ) : null}
        </label>

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Tool categories"
        >
          <CategoryChip
            active={category === 'all'}
            onClick={() => setCategory('all')}
            label="All"
          />
          {TOOL_CATEGORIES.map((item) => (
            <CategoryChip
              key={item.id}
              active={category === item.id}
              onClick={() => setCategory(item.id)}
              label={item.label}
            />
          ))}
        </div>
      </div>

      {visibleCount === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-5 py-10 text-center">
          <p className="m-0 text-sm text-muted-foreground">
            No tools match “{query.trim()}”.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              setQuery('')
              setCategory('all')
              searchRef.current?.focus()
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : category === 'all' && !query.trim() ? (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <CategoryGroup
              key={group.category.id}
              label={group.category.label}
              tools={group.tools}
              footer={
                group.category.id === 'image' && showTransparent ? (
                  <TransparentNote />
                ) : null
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ToolGrid tools={visibleTools} />
          {showTransparent ? <TransparentNote /> : null}
        </div>
      )}
    </section>
  )
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? 'inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition'
          : 'inline-flex h-8 items-center rounded-lg border border-border/80 bg-card/50 px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground'
      }
    >
      {label}
    </button>
  )
}

function CategoryGroup({
  label,
  tools,
  footer = null,
}: {
  label: string
  tools: ToolLink[]
  footer?: ReactNode
}) {
  const count = tools.length + (footer ? 1 : 0)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading m-0 text-sm font-semibold tracking-wide text-ink uppercase">
          {label}
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
      <ToolGrid tools={tools} />
      {footer}
    </div>
  )
}

function ToolGrid({ tools }: { tools: ToolLink[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => {
        const Icon = TOOL_ICONS[tool.to]
        return (
          <li key={tool.to}>
            <Link
              to={tool.to}
              className="tool-tile group flex h-full flex-col gap-1.5 rounded-xl border border-border/70 bg-card/45 px-3.5 py-3 no-underline transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/55 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-mist text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="tool-mark mt-1 h-0.5 w-6 origin-left scale-x-0 bg-spark" />
              </span>
              <span className="font-heading text-sm text-ink">{tool.name}</span>
              <span className="text-xs leading-5 text-muted-foreground">
                {tool.blurb}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function TransparentNote() {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-card/30 px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading m-0 text-sm text-ink">Transparent</p>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
          Local
        </span>
      </div>
      <p className="mt-1.5 mb-0 text-xs leading-5 text-muted-foreground">
        <code className="rounded bg-muted px-1 py-0.5 text-[0.75rem]">
          tools/transparent/
        </code>{' '}
        — local only (sharp).
      </p>
    </div>
  )
}
