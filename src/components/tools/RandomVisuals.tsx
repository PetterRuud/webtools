import type { CSSProperties } from 'react'
import type { CoinSide, DnDRollResult } from '#/lib/random'
import { cn } from '#/lib/utils'

export function CoinVisual(props: { side: CoinSide; flipKey: number }) {
  const heads = props.side === 'Heads'
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="relative size-28" style={{ perspective: '800px' }}>
        <div
          key={props.flipKey}
          className="relative size-full"
          style={{
            transformStyle: 'preserve-3d',
            animation: 'wt-coin-flip 0.8s ease-out forwards',
            ['--wt-coin-end' as string]: heads ? '720deg' : '900deg',
          }}
        >
          <CoinFace
            label="H"
            caption="Heads"
            className="border-2 border-amber-700/50 bg-amber-400 text-amber-950"
            style={{ transform: 'rotateY(0deg)' }}
          />
          <CoinFace
            label="T"
            caption="Tails"
            className="border-2 border-zinc-600/50 bg-zinc-400 text-zinc-950"
            style={{ transform: 'rotateY(180deg)' }}
          />
        </div>
      </div>
      <p className="m-0 text-sm font-medium tracking-wide">{props.side}</p>
      <style>{`
        @keyframes wt-coin-flip {
          0% { transform: rotateY(0deg) scale(0.92); }
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
        'absolute inset-0 flex flex-col items-center justify-center rounded-full',
        props.className,
      )}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        ...props.style,
      }}
      aria-hidden
    >
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
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-4">
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
        className="size-14"
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

export function DiceVisual(props: {
  rolls: number[]
  sides: number
  rollKey: number
}) {
  const total = props.rolls.reduce((sum, n) => sum + n, 0)
  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-4">
        {props.rolls.map((value, index) => (
          <StandardDie
            key={`${props.rollKey}-${index}-${value}`}
            value={value}
            sides={props.sides}
            index={index}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="m-0 font-mono text-xs text-muted-foreground">
          {props.rolls.length}d{props.sides}
        </p>
        <p className="m-0 text-2xl font-semibold tracking-tight tabular-nums">
          {props.rolls.length === 1 ? props.rolls[0] : total}
        </p>
        {props.rolls.length > 1 ? (
          <p className="m-0 font-mono text-xs text-muted-foreground">
            {props.rolls.join(' + ')}
          </p>
        ) : null}
      </div>
      <style>{`
        @keyframes wt-std-die-pop {
          0% { transform: translateY(-10px) rotate(-12deg) scale(0.8); opacity: 0.15; }
          65% { transform: translateY(3px) rotate(4deg) scale(1.06); opacity: 1; }
          100% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const PIP_LAYOUTS: Record<number, Array<[number, number]>> = {
  1: [[32, 32]],
  2: [
    [18, 18],
    [46, 46],
  ],
  3: [
    [18, 18],
    [32, 32],
    [46, 46],
  ],
  4: [
    [18, 18],
    [46, 18],
    [18, 46],
    [46, 46],
  ],
  5: [
    [18, 18],
    [46, 18],
    [32, 32],
    [18, 46],
    [46, 46],
  ],
  6: [
    [18, 18],
    [18, 32],
    [18, 46],
    [46, 18],
    [46, 32],
    [46, 46],
  ],
}

function StandardDie(props: { value: number; sides: number; index: number }) {
  const usePips = props.sides === 6 && props.value >= 1 && props.value <= 6
  const pips = usePips ? PIP_LAYOUTS[props.value]! : null
  const fill = 'color-mix(in oklab, var(--card) 70%, var(--primary) 18%)'
  const stroke = 'color-mix(in oklab, var(--foreground) 45%, transparent)'
  const pipFill = 'color-mix(in oklab, var(--foreground) 82%, transparent)'

  return (
    <div
      style={{
        animation: 'wt-std-die-pop 0.5s ease-out both',
        animationDelay: `${props.index * 45}ms`,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        className="size-14"
        role="img"
        aria-label={`d${props.sides}: ${props.value}`}
      >
        <rect
          x="8"
          y="8"
          width="48"
          height="48"
          rx="10"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
        {pips
          ? pips.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.5" fill={pipFill} />
            ))
          : (
              <text
                x="32"
                y="38"
                textAnchor="middle"
                fill="currentColor"
                style={{
                  fontSize: props.value >= 100 ? 14 : props.value >= 10 ? 18 : 22,
                  fontWeight: 700,
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {props.value}
              </text>
            )}
      </svg>
    </div>
  )
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

  // Odd window so the centered selection band lands on a row, not a gap.
  let windowSize = Math.min(5, props.options.length)
  if (windowSize % 2 === 0) windowSize -= 1
  if (windowSize < 1) windowSize = 1

  const half = Math.floor(windowSize / 2)
  const rows = Array.from({ length: windowSize }, (_, offset) => {
    const index =
      (props.highlightIndex - half + offset + props.options.length * 10) %
      props.options.length
    return { index, text: props.options[index]!, center: offset === half }
  })

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative w-full max-w-xs overflow-hidden rounded-xl border border-border/80 bg-card">
        <ul className="relative z-0 m-0 list-none p-0">
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
                  'relative z-0 flex h-9 items-center justify-center truncate px-3 font-mono text-sm transition-colors',
                  row.center ? 'text-foreground' : 'text-muted-foreground/45',
                  won && 'font-semibold text-primary',
                )}
              >
                {row.text}
              </li>
            )
          })}
        </ul>
        <div
          className="pointer-events-none absolute inset-x-1.5 top-1/2 z-20 h-9 -translate-y-1/2 rounded-md border-2 border-primary/70 bg-primary/10"
          aria-hidden
        />
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
