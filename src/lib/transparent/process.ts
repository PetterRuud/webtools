import { extractAlphaTwoPassBuffers } from './extract.ts'
import { preparePairedImages, trimResultPng } from './imagePrep.ts'
import type { ExtractRequestOptions } from './types.ts'

/** Node-only: prepare pair → extract alpha → optional result trim. */
export async function processTransparentPair(
  white: Buffer,
  black: Buffer,
  options: ExtractRequestOptions = {},
): Promise<Buffer> {
  const { trimResult, trimResultThreshold, ...prep } = options
  const prepared = await preparePairedImages(white, black, prep)
  let png = await extractAlphaTwoPassBuffers(prepared.white, prepared.black)
  if (trimResult) {
    png = await trimResultPng(png, trimResultThreshold)
  }
  return png
}
