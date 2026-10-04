export type CropRect = {
  left: number
  top: number
  width: number
  height: number
}

export type ResizeOpts = {
  width?: number
  height?: number
  /** Default `inside` — fit within box, preserve aspect. */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  withoutEnlargement?: boolean
}

export type PairPrepOptions = {
  crop?: CropRect
  resize?: ResizeOpts
  /** Remove transparent margins (alpha ~ 0). Opaque RGB photos are unchanged. */
  trim?: boolean
  trimThreshold?: number
}

export type ExtractRequestOptions = PairPrepOptions & {
  trimResult?: boolean
  trimResultThreshold?: number
}

/** Honest copy for UI / Workers 501 — sharp is Node-native, not Isolates. */
export const TRANSPARENT_NODE_NOTE =
  'Processing uses Node + sharp. It works with npm run dev (Vite Node middleware) or npm run transparent. Cloudflare Workers Isolates cannot load sharp; Containers only if a Node path is not enough.'
