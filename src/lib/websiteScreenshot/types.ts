export type CaptureMode = 'browser-rendering' | 'node-chrome' | 'node-playwright' | 'mock'

export type ViewportPreset = 'desktop' | 'tablet' | 'mobile' | 'custom'

export type CaptureRequest = {
  url: string
  width: number
  height: number
  fullPage: boolean
  deviceScaleFactor: number
}

export type CaptureResult = {
  png: Uint8Array
  mode: CaptureMode
  note?: string
}

/** Shown under the form — honest about local vs Workers. */
export const WEBSITE_SCREENSHOT_NOTE =
  'Capture needs a headless browser. vp run dev uses local Chrome (or a mock PNG if none is found). Production Workers use a Browser Rendering binding (BROWSER); without it the API returns a mock so the UI still works.'

export const WEBSITE_SCREENSHOT_WORKERS_SETUP =
  'Add a browser binding in wrangler.jsonc ("browser": { "binding": "BROWSER", "remote": true }), set compatibility_date to 2026-03-24 or later, then redeploy. Local quickAction needs remote: true.'

export const VIEWPORT_PRESETS: Record<
  Exclude<ViewportPreset, 'custom'>,
  { width: number; height: number }
> = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
}
