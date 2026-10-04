import type { ExtractRequestOptions, ResizeOpts } from './types.ts'

function parseOptInt(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined
  const s = String(v).trim()
  if (s === '') return undefined
  const n = Number.parseInt(s, 10)
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid integer: ${s}`)
  }
  return n
}

function truthy(v: unknown): boolean {
  return v === 'on' || v === 'true' || v === '1' || v === true
}

/** Parse multipart/form or JSON option fields into extract options. */
export function parseExtractOptions(
  body: Record<string, unknown>,
): ExtractRequestOptions {
  const opts: ExtractRequestOptions = {}

  if (truthy(body.trimInputs) || truthy(body.trim)) {
    opts.trim = true
    const th = parseOptInt(body.trimThreshold)
    if (th !== undefined) {
      if (th < 0 || th > 255) {
        throw new Error('Trim threshold must be between 0 and 255.')
      }
      opts.trimThreshold = th
    }
  }

  const cl = parseOptInt(body.cropLeft)
  const ct = parseOptInt(body.cropTop)
  const cw = parseOptInt(body.cropWidth)
  const ch = parseOptInt(body.cropHeight)
  const cropVals = [cl, ct, cw, ch]
  const defined = cropVals.filter((x) => x !== undefined).length
  if (defined > 0 && defined < 4) {
    throw new Error('Crop needs all four: left, top, width, height.')
  }
  if (defined === 4) {
    if (cl! < 0 || ct! < 0) {
      throw new Error('Crop left and top must be non-negative.')
    }
    if (cw! <= 0 || ch! <= 0) {
      throw new Error('Crop width and height must be positive.')
    }
    opts.crop = { left: cl!, top: ct!, width: cw!, height: ch! }
  }

  const rw = parseOptInt(body.resizeWidth)
  const rh = parseOptInt(body.resizeHeight)
  if (rw !== undefined || rh !== undefined) {
    if (rw !== undefined && rw <= 0) {
      throw new Error('Resize width must be positive.')
    }
    if (rh !== undefined && rh <= 0) {
      throw new Error('Resize height must be positive.')
    }
    const fitRaw = String(body.resizeFit ?? 'inside')
    const allowed: ResizeOpts['fit'][] = [
      'cover',
      'contain',
      'fill',
      'inside',
      'outside',
    ]
    const fit = (
      allowed.includes(fitRaw as ResizeOpts['fit']) ? fitRaw : 'inside'
    ) as ResizeOpts['fit']
    opts.resize = {
      width: rw,
      height: rh,
      fit,
      withoutEnlargement: truthy(body.resizeNoUpscale),
    }
  }

  if (truthy(body.trimResult)) {
    opts.trimResult = true
    const tr = parseOptInt(body.trimResultThreshold)
    opts.trimResultThreshold = tr ?? 10
    if (opts.trimResultThreshold < 0 || opts.trimResultThreshold > 255) {
      throw new Error('Result trim threshold must be between 0 and 255.')
    }
  }

  return opts
}

/** Collect string fields from a FormData for option parsing. */
export function formDataToRecord(form: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') {
      out[key] = value
    }
  }
  return out
}
