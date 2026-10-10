import {
  useRef,
  type ReactNode,
  type TextareaHTMLAttributes,
  type UIEvent,
} from 'react'
import { Textarea } from '#/components/ui/textarea'
import {
  REGEX_GROUP_ACTIVE_RING,
  buildHighlightSegments,
  groupBgClass,
  groupLegendLabel,
  maxGroupInMatches,
  type RegexMatchInfo,
} from '#/lib/regexHighlight'
import { cn } from '#/lib/utils'

const FIELD_TYPE =
  'whitespace-pre-wrap break-words font-mono text-[0.9rem] leading-6'

type RegexHighlightFieldProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  matches: RegexMatchInfo[]
  activeMatch?: number | null
  placeholder?: string
  className?: string
  disabled?: boolean
  'aria-invalid'?: boolean
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'children' | 'dangerouslySetInnerHTML'
>

function renderMaskedText(
  text: string,
  matches: RegexMatchInfo[],
  activeMatch: number | null | undefined,
): ReactNode {
  if (!text) {
    return <span className="text-muted-foreground">{'\u00a0'}</span>
  }

  const segments = buildHighlightSegments(matches)
  if (segments.length === 0) {
    return <span>{text}</span>
  }

  const nodes: ReactNode[] = []
  let cursor = 0
  segments.forEach((segment, i) => {
    if (segment.start > cursor) {
      nodes.push(
        <span key={`t-${i}`}>{text.slice(cursor, segment.start)}</span>,
      )
    }
    const active = activeMatch === segment.matchIndex
    nodes.push(
      <mark
        key={`h-${i}-${segment.start}`}
        className={cn(
          'rounded-sm px-0 text-foreground',
          groupBgClass(segment.group),
          active && REGEX_GROUP_ACTIVE_RING,
        )}
      >
        {text.slice(segment.start, segment.end) || '\u00a0'}
      </mark>,
    )
    cursor = segment.end
  })
  if (cursor < text.length) {
    nodes.push(<span key="tail">{text.slice(cursor)}</span>)
  }
  return nodes
}

export function RegexGroupLegend({ matches }: { matches: RegexMatchInfo[] }) {
  const maxGroup = maxGroupInMatches(matches)
  if (maxGroup < 0) return null
  const groups = Array.from({ length: maxGroup + 1 }, (_, i) => i)
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Match group colors"
    >
      {groups.map((group) => (
        <span
          key={group}
          className={cn(
            'inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground',
          )}
        >
          <span
            className={cn('size-2.5 rounded-sm', groupBgClass(group))}
            aria-hidden
          />
          {groupLegendLabel(group)}
        </span>
      ))}
    </div>
  )
}

/** Transparent textarea over a colored-span backdrop — typing stays normal. */
export function RegexHighlightField({
  id,
  value,
  onValueChange,
  matches,
  activeMatch = null,
  placeholder,
  className,
  disabled,
  'aria-invalid': ariaInvalid,
  onScroll,
  ...rest
}: RegexHighlightFieldProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  function syncScroll(event: UIEvent<HTMLTextAreaElement>) {
    const el = backdropRef.current
    if (el) {
      el.scrollTop = event.currentTarget.scrollTop
      el.scrollLeft = event.currentTarget.scrollLeft
    }
    onScroll?.(event)
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border border-input transition-colors',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        'dark:bg-input/30',
        ariaInvalid &&
          'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
        className,
      )}
    >
      <div
        ref={backdropRef}
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] px-2.5 py-2 text-foreground',
          FIELD_TYPE,
        )}
      >
        {renderMaskedText(value, matches, activeMatch)}
        {'\n'}
      </div>
      <Textarea
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        placeholder={placeholder}
        spellCheck={false}
        onScroll={syncScroll}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          'relative z-10 min-h-40 resize-y border-0 bg-transparent shadow-none',
          'text-transparent caret-foreground',
          'placeholder:text-muted-foreground placeholder:[-webkit-text-fill-color:var(--muted-foreground)]',
          'focus-visible:border-transparent focus-visible:ring-0',
          'dark:bg-transparent dark:disabled:bg-transparent',
          'lg:min-h-56',
          '[-webkit-text-fill-color:transparent]',
          FIELD_TYPE,
        )}
        {...rest}
      />
    </div>
  )
}
