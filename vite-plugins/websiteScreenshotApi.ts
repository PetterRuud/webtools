import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'
import type { Plugin } from 'vite'
import {
  parseCaptureRequest,
  readJsonBody,
} from '../src/lib/websiteScreenshot/options.ts'
import { captureWebsiteScreenshotNode } from '../src/lib/websiteScreenshot/nodeCapture.ts'

const API_PATH = '/api/website-screenshot/capture'

function nodeToWebRequest(req: IncomingMessage, host: string): Request {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else {
      headers.set(key, value)
    }
  }

  const url = `http://${host}${req.url ?? API_PATH}`
  const method = req.method ?? 'GET'
  if (method === 'GET' || method === 'HEAD') {
    return new Request(url, { method, headers })
  }

  return new Request(url, {
    method,
    headers,
    duplex: 'half',
    body: Readable.toWeb(req) as ReadableStream,
  } as RequestInit)
}

async function handleCapture(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const host = req.headers.host || '127.0.0.1'
    const request = nodeToWebRequest(req, host)
    const body = await readJsonBody(request)
    const captureReq = parseCaptureRequest(body)
    const result = await captureWebsiteScreenshotNode(captureReq)

    res.statusCode = 200
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Capture-Mode', result.mode)
    if (result.note) {
      res.setHeader('X-Capture-Note', encodeURIComponent(result.note))
    }
    res.end(Buffer.from(result.png))
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Screenshot capture failed'
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: message }))
  }
}

function attach(middlewares: {
  use: (
    path: string,
    fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
  ) => void
}) {
  middlewares.use(API_PATH, (req, res, next) => {
    if (req.method !== 'POST') {
      next()
      return
    }
    void handleCapture(req, res)
  })
}

/**
 * Serves POST /api/website-screenshot/capture from the Vite Node process.
 * Tries system Chrome, then optional Playwright, then a mock PNG.
 * Workers deploy uses the TanStack route + Browser Rendering binding instead.
 */
export function websiteScreenshotApiPlugin(): Plugin {
  return {
    name: 'webtools-website-screenshot-api',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}
