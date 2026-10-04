import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { cn } from 'cn'
import { clampSliceMargins, type SliceMargins } from '#/lib/nineSlice'

type GuideEdge = 'left' | 'right' | 'top' | 'bottom'

type DragState = {
  edge: GuideEdge
}

type NineSliceGuidesProps = {
  src: string
  imageWidth: number
  imageHeight: number
  margins: SliceMargins
  onChange: (next: SliceMargins) => void
}

export function NineSliceGuides({
  src,
  imageWidth,
  imageHeight,
  margins,
  onChange,
}: NineSliceGuidesProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState({ width: 0, height: 0 })
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      setDisplay({ width: rect.width, height: rect.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [src, imageWidth, imageHeight])

  const scaleX = display.width > 0 ? display.width / imageWidth : 1
  const scaleY = display.height > 0 ? display.height / imageHeight : 1

  function applyDrag(clientX: number, clientY: number) {
    const drag = dragRef.current
    const el = frameRef.current
    if (!drag || !el) return
    const rect = el.getBoundingClientRect()
    const next = { ...margins }

    if (drag.edge === 'left' || drag.edge === 'right') {
      const imageX =
        ((clientX - rect.left) / Math.max(rect.width, 1)) * imageWidth
      if (drag.edge === 'left') next.left = imageX
      else next.right = imageWidth - imageX
    } else {
      const imageY =
        ((clientY - rect.top) / Math.max(rect.height, 1)) * imageHeight
      if (drag.edge === 'top') next.top = imageY
      else next.bottom = imageHeight - imageY
    }

    onChange(clampSliceMargins(next, imageWidth, imageHeight))
  }

  function onPointerDown(edge: GuideEdge, event: ReactPointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    dragRef.current = { edge }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent) {
    if (!dragRef.current) return
    applyDrag(event.clientX, event.clientY)
  }

  function onPointerUp(event: ReactPointerEvent) {
    if (!dragRef.current) return
    dragRef.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* already released */
    }
  }

  const leftPx = margins.left * scaleX
  const rightPx = margins.right * scaleX
  const topPx = margins.top * scaleY
  const bottomPx = margins.bottom * scaleY

  return (
    <div
      ref={frameRef}
      className="relative select-none overflow-hidden rounded-lg border border-border bg-[linear-gradient(45deg,#80808020_25%,transparent_25%,transparent_75%,#80808020_75%),linear-gradient(45deg,#80808020_25%,transparent_25%,transparent_75%,#80808020_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]"
      style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
    >
      <img
        src={src}
        alt="Slice source"
        draggable={false}
        className="pointer-events-none block h-full w-full object-contain"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgb(0 0 0 / 0.28) ${leftPx}px, transparent ${leftPx}px),
            linear-gradient(to left, rgb(0 0 0 / 0.28) ${rightPx}px, transparent ${rightPx}px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.28) ${topPx}px, transparent ${topPx}px),
            linear-gradient(to top, rgb(0 0 0 / 0.28) ${bottomPx}px, transparent ${bottomPx}px)
          `,
        }}
      />

      <GuideLine
        orientation="vertical"
        style={{ left: leftPx }}
        label="L"
        onPointerDown={(e) => onPointerDown('left', e)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <GuideLine
        orientation="vertical"
        style={{ right: rightPx }}
        label="R"
        onPointerDown={(e) => onPointerDown('right', e)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <GuideLine
        orientation="horizontal"
        style={{ top: topPx }}
        label="T"
        onPointerDown={(e) => onPointerDown('top', e)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <GuideLine
        orientation="horizontal"
        style={{ bottom: bottomPx }}
        label="B"
        onPointerDown={(e) => onPointerDown('bottom', e)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  )
}

function GuideLine({
  orientation,
  style,
  label,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  orientation: 'vertical' | 'horizontal'
  style: CSSProperties
  label: string
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
}) {
  const vertical = orientation === 'vertical'
  return (
    <div
      role="slider"
      aria-label={`${label} slice guide`}
      tabIndex={0}
      className={cn(
        'absolute z-10 touch-none',
        vertical
          ? 'top-0 bottom-0 w-3 -translate-x-1/2 cursor-ew-resize'
          : 'left-0 right-0 h-3 -translate-y-1/2 cursor-ns-resize',
      )}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={cn(
          'absolute bg-amber-400 shadow-[0_0_0_1px_rgb(0_0_0_/_0.35)]',
          vertical
            ? 'left-1/2 top-0 h-full w-0.5 -translate-x-1/2'
            : 'top-1/2 left-0 h-0.5 w-full -translate-y-1/2',
        )}
      />
      <span
        className={cn(
          'absolute rounded bg-amber-400 px-1 py-0.5 text-[10px] font-semibold leading-none text-black',
          vertical
            ? 'left-1/2 top-1 -translate-x-1/2'
            : 'left-1 top-1/2 -translate-y-1/2',
        )}
      >
        {label}
      </span>
    </div>
  )
}
