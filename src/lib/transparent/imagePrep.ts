import sharp from "sharp";
import type { PairPrepOptions } from "./types.ts";

/** Colour matched when trimming “empty” pixels (fully transparent). */
const TRANSPARENT: sharp.RGBA = { r: 0, g: 0, b: 0, alpha: 0 };

function trimTransparentMargins(image: sharp.Sharp, threshold: number): sharp.Sharp {
  return image.ensureAlpha().trim({
    background: TRANSPARENT,
    threshold,
  });
}

function buildPipeline(input: Buffer, o: PairPrepOptions): sharp.Sharp {
  let img = sharp(input);

  if (o.crop) {
    img = img.extract(o.crop);
  }

  if (o.resize && (o.resize.width !== undefined || o.resize.height !== undefined)) {
    const fit = o.resize.fit ?? "inside";
    img = img.resize(o.resize.width, o.resize.height, {
      fit,
      withoutEnlargement: o.resize.withoutEnlargement ?? false,
    });
  }

  if (o.trim) {
    img = trimTransparentMargins(img, o.trimThreshold ?? 10);
  }

  return img.png();
}

/**
 * Apply the same crop / resize / trim steps to both images so alpha extraction still aligns.
 * Throws if the two outputs end up with different dimensions.
 */
export async function preparePairedImages(
  white: Buffer,
  black: Buffer,
  options: PairPrepOptions,
): Promise<{ white: Buffer; black: Buffer }> {
  const w = await buildPipeline(white, options).toBuffer();
  const b = await buildPipeline(black, options).toBuffer();
  const metaW = await sharp(w).metadata();
  const metaB = await sharp(b).metadata();
  if (metaW.width !== metaB.width || metaW.height !== metaB.height) {
    throw new Error(
      `After preprocessing, sizes differ (${metaW.width}×${metaW.height} vs ${metaB.width}×${metaB.height}). Disable trim or fix crop so both layers stay aligned.`,
    );
  }
  return { white: w, black: b };
}

/**
 * Tightest crop that keeps all “content” pixels. A pixel is treated as
 * background (cropped away) if alpha is at most `transparentAlphaMax` (0–255).
 */
export async function trimResultPng(png: Buffer, transparentAlphaMax?: number): Promise<Buffer> {
  const maxEmptyAlpha = transparentAlphaMax ?? 10;
  if (maxEmptyAlpha < 0 || maxEmptyAlpha > 255) {
    throw new Error("trim threshold must be 0–255");
  }

  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (info.channels !== 4) {
    throw new Error("Expected RGBA");
  }

  const w = info.width;
  const h = info.height;
  const box = alphaContentBoundingBox(data, w, h, maxEmptyAlpha);
  if (!box) {
    throw new Error("Image has no visible pixels (all alpha at or below threshold)");
  }

  if (box.left === 0 && box.top === 0 && box.width === w && box.height === h) {
    return sharp(png).png().toBuffer();
  }

  return sharp(png).extract(box).png().toBuffer();
}

function alphaContentBoundingBox(
  data: Buffer,
  width: number,
  height: number,
  maxEmptyAlpha: number,
): { left: number; top: number; width: number; height: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3]!;
      if (a > maxEmptyAlpha) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX) {
    return null;
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
