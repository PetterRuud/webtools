/**
 * Minimal RGB PNG writer (no deps). Used when no browser capture is available.
 * Workers-safe: uses CompressionStream when present, else throws (Node middleware
 * uses the Node zlib path in nodeCapture instead).
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function u32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff])
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type)
  const len = u32(data.length)
  const body = new Uint8Array(4 + data.length)
  body.set(typeBytes, 0)
  body.set(data, 4)
  const crc = u32(crc32(body))
  const out = new Uint8Array(12 + data.length)
  out.set(len, 0)
  out.set(body, 4)
  out.set(crc, 8 + data.length)
  return out
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('CompressionStream unavailable for mock PNG.')
  }
  const stream = new Blob([Uint8Array.from(data)]).stream().pipeThrough(new CompressionStream('deflate'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

function fillPixel(
  raw: Uint8Array,
  width: number,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
) {
  const row = y * (1 + width * 3) + 1 + x * 3
  raw[row] = r
  raw[row + 1] = g
  raw[row + 2] = b
}

/** Draw a dark mock “browser chrome” frame so the preview looks intentional. */
function paintMock(width: number, height: number): Uint8Array {
  const stride = 1 + width * 3
  const raw = new Uint8Array(stride * height)
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0 // filter None
    for (let x = 0; x < width; x++) {
      const inChrome = y < 36
      const inBar = y >= 36 && y < 40
      let r = 18
      let g = 22
      let b = 28
      if (inChrome) {
        r = 32
        g = 38
        b = 48
      } else if (inBar) {
        r = 45
        g = 212
        b = 160 // mint accent
      } else {
        // subtle grid
        if (x % 32 === 0 || y % 32 === 0) {
          r = 28
          g = 34
          b = 44
        }
        // diagonal band
        if (Math.abs(x - y) % 64 < 2) {
          r = 40
          g = 48
          b = 62
        }
      }
      // traffic lights
      if (inChrome && y > 12 && y < 24) {
        if (x > 16 && x < 28) {
          r = 255
          g = 95
          b = 86
        } else if (x > 34 && x < 46) {
          r = 255
          g = 189
          b = 46
        } else if (x > 52 && x < 64) {
          r = 39
          g = 201
          b = 63
        }
      }
      fillPixel(raw, width, x, y, r, g, b)
    }
  }
  // URL pill
  const pillY0 = 10
  const pillY1 = 26
  const pillX0 = 80
  const pillX1 = Math.min(width - 16, 80 + Math.floor(width * 0.55))
  for (let y = pillY0; y < pillY1; y++) {
    for (let x = pillX0; x < pillX1; x++) {
      fillPixel(raw, width, x, y, 22, 26, 34)
    }
  }
  return raw
}

export async function createMockScreenshotPng(
  width: number,
  height: number,
): Promise<Uint8Array> {
  const w = Math.min(1920, Math.max(320, Math.round(width)))
  const h = Math.min(4000, Math.max(320, Math.round(height)))
  const raw = paintMock(w, h)
  const compressed = await deflate(raw)

  const ihdr = new Uint8Array(13)
  ihdr.set(u32(w), 0)
  ihdr.set(u32(h), 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
  const parts = [signature, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', new Uint8Array())]
  let total = 0
  for (const p of parts) total += p.length
  const out = new Uint8Array(total)
  let offset = 0
  for (const p of parts) {
    out.set(p, offset)
    offset += p.length
  }
  return out
}
