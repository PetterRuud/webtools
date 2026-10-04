import { createMockScreenshotPng } from './mockPng.ts'
import {
  WEBSITE_SCREENSHOT_WORKERS_SETUP,
  type CaptureRequest,
  type CaptureResult,
} from './types.ts'

/** Minimal surface we need from env.BROWSER (BrowserRun). */
export type BrowserScreenshotBinding = {
  quickAction: (
    action: 'screenshot',
    options: {
      url: string
      viewport?: {
        width: number
        height: number
        deviceScaleFactor?: number
      }
      screenshotOptions?: {
        type?: 'png'
        fullPage?: boolean
      }
      gotoOptions?: {
        waitUntil?: 'networkidle0' | 'domcontentloaded' | 'load'
        timeout?: number
      }
    },
  ) => Promise<Response>
}

export async function captureWebsiteScreenshotWorkers(
  req: CaptureRequest,
  browser: BrowserScreenshotBinding | null | undefined,
): Promise<CaptureResult> {
  if (browser && typeof browser.quickAction === 'function') {
    try {
      const res = await browser.quickAction('screenshot', {
        url: req.url,
        viewport: {
          width: req.width,
          height: req.height,
          deviceScaleFactor: req.deviceScaleFactor,
        },
        screenshotOptions: {
          type: 'png',
          fullPage: req.fullPage,
        },
        gotoOptions: {
          waitUntil: 'networkidle0',
          timeout: 45_000,
        },
      })
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer())
        if (buf.byteLength > 0) {
          return { png: buf, mode: 'browser-rendering' }
        }
      }
    } catch {
      // Binding present but local/remote quickAction failed — mock below.
    }
  }

  const png = await createMockScreenshotPng(req.width, req.height)
  return {
    png,
    mode: 'mock',
    note: WEBSITE_SCREENSHOT_WORKERS_SETUP,
  }
}
