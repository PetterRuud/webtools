import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { cn } from 'cn'
import { clampCropRect, type CropRect } from '#/lib/imageTransform'

type HandleId = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

type DragState = {
  handle: HandleId
  startX: number
  startY: number
  origin: CropRect
  pointerId: number
}

type ImageCropperProps = {
  src: string
  imageWidth: number
  imageHeight: number
  crop: CropRect
  aspectRatio: number | null
  enabled: boolean
  onChange: (next: CropRect) => void
}

const HANDLES: Exclude<HandleId, 'move'>[] = [
  'nw',
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
]

export function ImageCropper({
  src,
  imageWidth,
  imageHeight,
  crop,
  aspectRatio,
  enabled,
  onChange,
}: ImageCropperProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const cropRef = useRef(crop)
  const aspectRef = useRef(aspectRatio)
  const onChangeRef = useRef(onChange)
  const [display, setDisplay] = useState({ width: 0, height: 0 })
  const dragRef = useRef<DragState | null>(null)
  const [activeHandle, setActiveHandle] = useState<HandleId | null>(null)

  cropRef.current = crop
  aspectRef.current = aspectRatio
  onChangeRef.current = onChange

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

  useEffect(() => {
    if (!enabled) {
      dragRef.current = null
      setActiveHandle(null)
    }
  }, [enabled])

  const scaleX = display.width > 0 ? display.width / imageWidth : 1
  const scaleY = display.height > 0 ? display.height / imageHeight : 1

  function clientToImage(clientX: number, clientY: number) {
    const el = frameRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / Math.max(rect.width, 1)) * imageWidth,
      y: ((clientY - rect.top) / Math.max(rect.height, 1)) * imageHeight,
    }
  }

  function applyDrag(clientX: number, clientY: number) {
    const drag = dragRef.current
    if (!drag) return
    const point = clientToImage(clientX, clientY)
    const dx = point.x - drag.startX
    const dy = point.y - drag.startY
    const o = drag.origin
    const ratio = aspectRef.current

    if (drag.handle === 'move') {
      onChangeRef.current(
        clampCropRect(
          { ...o, x: o.x + dx, y: o.y + dy },
          imageWidth,
          imageHeight,
          null,
        ),
      )
      return
    }

    let left = o.x
    let top = o.y
    let right = o.x + o.width
    let bottom = o.y + o.height

    if (drag.handle.includes('w')) left = o.x + dx
    if (drag.handle.includes('e')) right = o.x + o.width + dx
    if (drag.handle.includes('n')) top = o.y + dy
    if (drag.handle.includes('s')) bottom = o.y + o.height + dy

    if (right - left < 16) {
      if (drag.handle.includes('w')) left = right - 16
      else right = left + 16
    }
    if (bottom - top < 16) {
      if (drag.handle.includes('n')) top = bottom - 16
      else bottom = top + 16
    }

    let next: CropRect = {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    }

    if (ratio && ratio > 0) {
      next = resizeWithAspect(
        drag.handle,
        o,
        next,
        ratio,
        imageWidth,
        imageHeight,
      )
    }

    onChangeRef.current(clampCropRect(next, imageWidth, imageHeight, ratio))
  }

  function endDrag() {
    dragRef.current = null
    setActiveHandle(null)
  }

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      event.preventDefault()
      applyDrag(event.clientX, event.clientY)
    }

    function onPointerUp(event: PointerEvent) {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      endDrag()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [imageWidth, imageHeight])

  function onPointerDown(
    handle: HandleId,
    event: ReactPointerEvent<HTMLElement>,
  ) {
    if (!enabled) return
    event.preventDefault()
    event.stopPropagation()
    const point = clientToImage(event.clientX, event.clientY)
    dragRef.current = {
      handle,
      startX: point.x,
      startY: point.y,
      origin: cropRef.current,
      pointerId: event.pointerId,
    }
    setActiveHandle(handle)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // capture optional; window listeners cover move/up
    }
  }

  const left = crop.x * scaleX
  const top = crop.y * scaleY
  const width = crop.width * scaleX
  const height = crop.height * scaleY
  const moving = activeHandle === 'move'

  return (
    <div className="flex justify-center rounded-2xl border border-border bg-[oklch(0.96_0.01_120)] p-2 dark:bg-muted/30">
      <div
        ref={frameRef}
        className={cn(
          'relative inline-block max-w-full overflow-hidden touch-none select-none',
          enabled && 'cursor-crosshair',
        )}
      >
        <img
          src={src}
          alt="Source preview"
          draggable={false}
          className="block max-h-[28rem] w-auto max-w-full"
        />

        {enabled ? (
          <div
            role="presentation"
            aria-label="Move crop region"
            className={cn(
              'absolute border-2 border-white',
              moving ? 'cursor-grabbing' : 'cursor-grab',
            )}
            style={{
              left,
              top,
              width,
              height,
              boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.45)',
            }}
            onPointerDown={(event) => onPointerDown('move', event)}
          >
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-80">
              {Array.from({ length: 9 }, (_, index) => (
                <div key={index} className="border border-white/40" />
              ))}
            </div>

            {HANDLES.map((handle) => (
              <button
                key={handle}
                type="button"
                aria-label={`Resize crop ${handle}`}
                className={cn(
                  'absolute z-10 size-3.5 -translate-x-1/2 -translate-y-1/2 touch-none rounded-sm border-2 border-white bg-[var(--foreground)] shadow-sm',
                  handleCursor(handle),
                )}
                style={handleStyle(handle)}
                onPointerDown={(event) => onPointerDown(handle, event)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function handleCursor(handle: HandleId): string {
  switch (handle) {
    case 'n':
    case 's':
      return 'cursor-ns-resize'
    case 'e':
    case 'w':
      return 'cursor-ew-resize'
    case 'ne':
    case 'sw':
      return 'cursor-nesw-resize'
    case 'nw':
    case 'se':
      return 'cursor-nwse-resize'
    default:
      return 'cursor-move'
  }
}

function handleStyle(handle: Exclude<HandleId, 'move'>): {
  left: string
  top: string
} {
  const map: Record<Exclude<HandleId, 'move'>, { left: string; top: string }> =
    {
      nw: { left: '0%', top: '0%' },
      n: { left: '50%', top: '0%' },
      ne: { left: '100%', top: '0%' },
      e: { left: '100%', top: '50%' },
      se: { left: '100%', top: '100%' },
      s: { left: '50%', top: '100%' },
      sw: { left: '0%', top: '100%' },
      w: { left: '0%', top: '50%' },
    }
  return map[handle]
}

function resizeWithAspect(
  handle: HandleId,
  origin: CropRect,
  proposed: CropRect,
  aspectRatio: number,
  imageWidth: number,
  imageHeight: number,
): CropRect {
  let { x, y, width, height } = proposed

  const fromWidth = () => {
    width = Math.max(16, width)
    height = Math.max(16, Math.round(width / aspectRatio))
  }
  const fromHeight = () => {
    height = Math.max(16, height)
    width = Math.max(16, Math.round(height * aspectRatio))
  }

  if (handle === 'e' || handle === 'w') fromWidth()
  else if (handle === 'n' || handle === 's') fromHeight()
  else {
    const dw = Math.abs(proposed.width - origin.width)
    const dh = Math.abs(proposed.height - origin.height)
    if (dw >= dh) fromWidth()
    else fromHeight()
  }

  if (handle.includes('w')) x = origin.x + origin.width - width
  else if (handle.includes('e')) x = origin.x
  else x = origin.x + Math.round((origin.width - width) / 2)

  if (handle.includes('n')) y = origin.y + origin.height - height
  else if (handle.includes('s')) y = origin.y
  else y = origin.y + Math.round((origin.height - height) / 2)

  return clampCropRect(
    { x, y, width, height },
    imageWidth,
    imageHeight,
    aspectRatio,
  )
}
