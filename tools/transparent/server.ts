/**
 * Optional Node sidecar for Transparent processing (sharp).
 * Prefer the TanStack UI at /tools/transparent with `vp run dev`
 * (Vite Node middleware serves POST /api/transparent/extract).
 *
 * Run from repo root: vp run transparent → http://localhost:3847/api/extract
 */
import express from 'express'
import multer from 'multer'
import { parseExtractOptions } from '../../src/lib/transparent/options.ts'
import { processTransparentPair } from '../../src/lib/transparent/process.ts'

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

const fields = upload.fields([
  { name: 'white', maxCount: 1 },
  { name: 'black', maxCount: 1 },
])

app.get('/', (_req, res) => {
  res.type('text/plain').send(
    [
      'Transparent API (Node + sharp)',
      '',
      'UI: vp run dev → /tools/transparent',
      'API: POST /api/extract  multipart fields white + black',
      '',
      'Workers Isolates cannot load sharp; use this Node path or Vite middleware.',
    ].join('\n'),
  )
})

app.post('/api/extract', fields, async (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined
  const white = files?.white?.[0]?.buffer
  const black = files?.black?.[0]?.buffer

  if (!white || !black) {
    res.status(400).json({
      error: 'Provide both images: fields "white" and "black".',
    })
    return
  }

  const body = (req.body ?? {}) as Record<string, unknown>

  let options
  try {
    options = parseExtractOptions(body)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid options'
    res.status(400).json({ error: message })
    return
  }

  try {
    const png = await processTransparentPair(white, black, options)
    res.setHeader('Content-Type', 'image/png')
    res.send(png)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Processing failed'
    res.status(422).json({ error: message })
  }
})

const port = Number(process.env.PORT) || 3847
app.listen(port, () => {
  console.log(`Transparent API http://localhost:${port}/api/extract`)
  console.log(`Hub UI: vp run dev → /tools/transparent`)
})
