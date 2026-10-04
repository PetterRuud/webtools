import type { CSSProperties } from 'react'
import type { CoinSide, DnDRollResult } from '#/lib/random'
import { cn } from '#/lib/utils'

export function CoinVisual(props: { side: CoinSide; flipKey: number }) {
  const heads = props.side === 'Heads'
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div
        className="relative size-28"
        style={{ perspective: '700px' }}
      >
        <div
          key={props.flipKey}
          className="relative size-full"
          style={{
            transformStyle: 'preserve-3d',
            animation: 'wt-coin-flip 0.75s ease-out forwards',
            // end face after full spins
            ['--wt-coin-end' as string]: heads ? '720deg' : '900deg',
          }}
        >
          <CoinFace
            label="H"
            caption="Heads"
            className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-amber-950"
            style={{ transform: 'rotateY(0deg)' }}
          />
          <CoinFace
            label="T"
            caption="Tails"
            className="bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-600 text-zinc-950"
            style={{ transform: 'rotateY(180deg)' }}
          />
        </div>
      </div>
      <p className="m-0 text-sm font-medium tracking-wide">{props.side}</p>
      <style>{`
        @keyframes wt-coin-flip {
          0% { transform: rotateY(0deg) scale(0.9); }
          70% { transform: rotateY(calc(var(--wt-coin-end) - 40deg)) scale(1.05); }
          100% { transform: rotateY(var(--wt-coin-end)) scale(1); }
        }
      `}</style>
    </div>
  )
}

function CoinFace(props: {
  label: string
  caption: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-black/15 shadow-md',
        props.className,
      )}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        ...props.style,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="absolute inset-2 size-[calc(100%-1rem)] opacity-30">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      </svg>
      <span className="relative text-4xl font-bold tracking-tight">{props.label}</span>
      <span className="relative text-[0.65rem] font-semibold tracking-widest uppercase opacity-80">
        {props.caption}
      </span>
    </div>
  )
}

export function DnDVisual(props: { result: DnDRollResult; rollKey: number }) {
  const { result } = props
  const faces = result.kept.length > 0 ? result.kept : result.rolls
  const sides = inferSides(result.expression)
  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {faces.map((value, index) => (
          <DieFace
            key={`${props.rollKey}-${index}-${value}`}
            value={value}
            sides={sides}
            index={index}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="m-0 font-mono text-xs text-muted-foreground">{result.expression}</p>
        <p className="m-0 text-2xl font-semibold tracking-tight tabular-nums">
          {result.total}
        </p>
        {result.note ? (
          <p className="m-0 text-xs text-muted-foreground">{result.note}</p>
        ) : null}
        {result.dropped.length > 0 ? (
          <p className="m-0 text-xs text-muted-foreground">
            dropped {result.dropped.join(', ')}
          </p>
        ) : null}
      </div>
      <style>{`
        @keyframes wt-die-pop {
          0% { transform: translateY(-8px) rotate(-8deg) scale(0.85); opacity: 0.2; }
          70% { transform: translateY(2px) rotate(3deg) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function inferSides(expression: string): number {
  const match = expression.match(/d(\d+)/i)
  return match ? Number(match[1]) : 20
}

function DieFace(props: { value: number; sides: number; index: number }) {
  return (
    <div
      style={{
        animation: 'wt-die-pop 0.45s ease-out both',
        animationDelay: `${props.index * 40}ms`,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        className="size-14 drop-shadow-sm"
        role="img"
        aria-label={`d${props.sides}: ${props.value}`}
      >
        <DieShape sides={props.sides} />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          fill="currentColor"
          style={{
            fontSize: props.value >= 100 ? 14 : 18,
            fontWeight: 700,
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {props.value}
        </text>
      </svg>
    </div>
  )
}

function DieShape(props: { sides: number }) {
  const fill = 'color-mix(in oklab, var(--primary) 24%, var(--card))'
  const stroke = 'color-mix(in oklab, var(--foreground) 40%, transparent)'
  switch (props.sides) {
    case 4:
      return (
        <polygon
          points="32,6 58,54 6,54"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )
    case 6:
      return (
        <rect
          x="10"
          y="10"
          width="44"
          height="44"
          rx="6"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
      )
    case 8:
      return (
        <polygon
          points="32,4 56,32 32,60 8,32"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )
    case 10:
      return (
        <polygon
          points="32,4 54,22 48,54 16,54 10,22"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )
    case 12:
      return (
        <polygon
          points="32,5 52,15 58,34 44,54 20,54 6,34 12,15"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )
    case 100:
      return (
        <>
          <circle cx="32" cy="32" r="26" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            opacity="0.5"
          />
        </>
      )
    default:
      return (
        <polygon
          points="32,4 54,16 54,40 32,60 10,40 10,16"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )
  }
}

export function RouletteVisual(props: {
  options: string[]
  winner: string | null
  spinning: boolean
  highlightIndex: number
}) {
  if (props.options.length === 0) {
    return (
      <p className="m-0 py-6 text-center text-sm text-muted-foreground">
        Add options to spin.
      </p>
    )
  }

  const windowSize = Math.min(5, props.options.length)
  const half = Math.floor(windowSize / 2)
  const rows = Array.from({ length: windowSize }, (_, offset) => {
    const index =
      (props.highlightIndex - half + offset + props.options.length * 10) %
      props.options.length
    return { index, text: props.options[index]!, center: offset === half }
  })

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-border/70 bg-muted/25">
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-9 -translate-y-1/2 border-y border-primary/45 bg-primary/10"
          aria-hidden
        />
        <ul className="m-0 list-none p-0">
          {rows.map((row) => {
            const won =
              !props.spinning &&
              props.winner != null &&
              row.center &&
              row.text === props.winner
            return (
              <li
                key={`${row.index}-${row.text}-${row.center ? 'c' : 's'}`}
                className={cn(
                  'flex h-9 items-center justify-center truncate px-3 font-mono text-sm transition-colors',
                  row.center ? 'text-foreground' : 'text-muted-foreground/45',
                  won && 'font-semibold text-primary',
                )}
              >
                {row.text}
              </li>
            )
          })}
        </ul>
      </div>
      {props.winner && !props.spinning ? (
        <p className="m-0 text-lg font-semibold tracking-tight">{props.winner}</p>
      ) : (
        <p className="m-0 text-xs text-muted-foreground">
          {props.spinning ? 'Spinning…' : 'Spin to pick one'}
        </p>
      )}
    </div>
  )
}
