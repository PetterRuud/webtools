import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  preparePairedImages,
  trimResultPng,
  type PairPrepOptions,
  type ResizeOpts,
} from './imagePrep.js';
import { extractAlphaTwoPassBuffers } from './transparent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const fields = upload.fields([
  { name: 'white', maxCount: 1 },
  { name: 'black', maxCount: 1 },
]);

app.use(express.static(path.join(__dirname, 'public')));

function parseOptInt(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  if (s === '') return undefined;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid integer: ${s}`);
  }
  return n;
}

function truthy(v: unknown): boolean {
  return v === 'on' || v === 'true' || v === '1';
}

function parsePrepOptions(body: Record<string, unknown>): PairPrepOptions {
  const opts: PairPrepOptions = {};

  if (truthy(body.trimInputs)) {
    opts.trim = true;
    const th = parseOptInt(body.trimThreshold);
    if (th !== undefined) {
      if (th < 0 || th > 255) {
        throw new Error('Trim threshold must be between 0 and 255.');
      }
      opts.trimThreshold = th;
    }
  }

  const cl = parseOptInt(body.cropLeft);
  const ct = parseOptInt(body.cropTop);
  const cw = parseOptInt(body.cropWidth);
  const ch = parseOptInt(body.cropHeight);
  const cropVals = [cl, ct, cw, ch];
  const defined = cropVals.filter((x) => x !== undefined).length;
  if (defined > 0 && defined < 4) {
    throw new Error('Crop needs all four: left, top, width, height.');
  }
  if (defined === 4) {
    if (cl! < 0 || ct! < 0) {
      throw new Error('Crop left and top must be non-negative.');
    }
    if (cw! <= 0 || ch! <= 0) {
      throw new Error('Crop width and height must be positive.');
    }
    opts.crop = { left: cl!, top: ct!, width: cw!, height: ch! };
  }

  const rw = parseOptInt(body.resizeWidth);
  const rh = parseOptInt(body.resizeHeight);
  if (rw !== undefined || rh !== undefined) {
    if (rw !== undefined && rw <= 0) {
      throw new Error('Resize width must be positive.');
    }
    if (rh !== undefined && rh <= 0) {
      throw new Error('Resize height must be positive.');
    }
    const fitRaw = String(body.resizeFit ?? 'inside');
    const allowed: ResizeOpts['fit'][] = [
      'cover',
      'contain',
      'fill',
      'inside',
      'outside',
    ];
    const fit = (
      allowed.includes(fitRaw as ResizeOpts['fit'])
        ? fitRaw
        : 'inside'
    ) as ResizeOpts['fit'];
    opts.resize = {
      width: rw,
      height: rh,
      fit,
      withoutEnlargement: truthy(body.resizeNoUpscale),
    };
  }

  return opts;
}

app.post('/api/extract', fields, async (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const white = files?.white?.[0]?.buffer;
  const black = files?.black?.[0]?.buffer;

  if (!white || !black) {
    res.status(400).json({
      error: 'Provide both images: fields "white" and "black".',
    });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  let prep: PairPrepOptions;
  try {
    prep = parsePrepOptions(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid options';
    res.status(400).json({ error: message });
    return;
  }

  const trimResult = truthy(body.trimResult);
  let trimResultThreshold: number | undefined;
  if (trimResult) {
    const tr = parseOptInt(body.trimResultThreshold);
    trimResultThreshold = tr ?? 10;
    if (trimResultThreshold < 0 || trimResultThreshold > 255) {
      res.status(400).json({
        error: 'Result trim threshold must be between 0 and 255.',
      });
      return;
    }
  }

  try {
    const prepared = await preparePairedImages(white, black, prep);
    let png = await extractAlphaTwoPassBuffers(prepared.white, prepared.black);
    if (trimResult) {
      png = await trimResultPng(png, trimResultThreshold);
    }
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Processing failed';
    res.status(422).json({ error: message });
  }
});

const port = Number(process.env.PORT) || 3847;
app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});
