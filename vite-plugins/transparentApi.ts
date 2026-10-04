import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'
import type { Plugin } from 'vite'
import {
  formDataToRecord,
  parseExtractOptions,
} from '../src/lib/transparent/options.ts'
import { processTransparentPair } from '../src/lib/transparent/process.ts'

const API_PATH = '/api/transparent/extract'
const MAX_BYTES = 25 * 1024 * 1024

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
    // Node fetch requires duplex when streaming a body
    duplex: 'half',
    body: Readable.toWeb(req) as ReadableStream,
  } as RequestInit)
}

async function fileToBuffer(file: File): Promise<Buffer> {
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (max ${MAX_BYTES} bytes).`)
  }
  const ab = await file.arrayBuffer()
  return Buffer.from(ab)
}

async function handleExtract(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const host = req.headers.host || '127.0.0.1'
    const request = nodeToWebRequest(req, host)
    const form = await request.formData()
    const whiteFile = form.get('white')
    const blackFile = form.get('black')

    if (!(whiteFile instanceof File) || !(blackFile instanceof File)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'Provide both images: fields "white" and "black".',
        }),
      )
      return
    }

    let options
    try {
      options = parseExtractOptions(formDataToRecord(form))
    } catch (e) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: e instanceof Error ? e.message : 'Invalid options',
        }),
      )
      return
    }

    const white = await fileToBuffer(whiteFile)
    const black = await fileToBuffer(blackFile)
    const png = await processTransparentPair(white, black, options)

    res.statusCode = 200
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-store')
    res.end(png)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Processing failed'
    res.statusCode = 422
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: message }))
  }
}

function attach(
  middlewares: {
    use: (
      path: string,
      fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
    ) => void
  },
) {
  middlewares.use(API_PATH, (req, res, next) => {
    if (req.method !== 'POST') {
      next()
      return
    }
    void handleExtract(req, res)
  })
}

/**
 * Serves POST /api/transparent/extract from the Vite Node process (sharp).
 * Workers Isolates never see this path in production — the TanStack route returns 501.
 */
export function transparentApiPlugin(): Plugin {
  return {
    name: 'webtools-transparent-api',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}
