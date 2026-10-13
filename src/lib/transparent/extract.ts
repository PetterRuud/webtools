import sharp, { type Sharp } from "sharp";

async function extractAlphaCore(img1: Sharp, img2: Sharp): Promise<Buffer> {
  const { data: dataWhite, info: meta } = await img1
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: dataBlack } = await img2.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (dataWhite.length !== dataBlack.length) {
    throw new Error("Dimension mismatch: Images must be identical size");
  }

  const outputBuffer = Buffer.alloc(dataWhite.length);
  const bgDist = Math.sqrt(3 * 255 * 255);

  for (let i = 0; i < meta.width * meta.height; i++) {
    const offset = i * 4;

    const rW = dataWhite[offset]!;
    const gW = dataWhite[offset + 1]!;
    const bW = dataWhite[offset + 2]!;

    const rB = dataBlack[offset]!;
    const gB = dataBlack[offset + 1]!;
    const bB = dataBlack[offset + 2]!;

    const pixelDist = Math.sqrt(Math.pow(rW - rB, 2) + Math.pow(gW - gB, 2) + Math.pow(bW - bB, 2));

    let alpha = 1 - pixelDist / bgDist;
    alpha = Math.max(0, Math.min(1, alpha));

    let rOut = 0;
    let gOut = 0;
    let bOut = 0;

    if (alpha > 0.01) {
      rOut = rB / alpha;
      gOut = gB / alpha;
      bOut = bB / alpha;
    }

    outputBuffer[offset] = Math.round(Math.min(255, rOut));
    outputBuffer[offset + 1] = Math.round(Math.min(255, gOut));
    outputBuffer[offset + 2] = Math.round(Math.min(255, bOut));
    outputBuffer[offset + 3] = Math.round(alpha * 255);
  }

  return sharp(outputBuffer, {
    raw: { width: meta.width, height: meta.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** Same subject photographed on white then on black — returns PNG with alpha. */
export async function extractAlphaTwoPassBuffers(
  imgOnWhite: Buffer,
  imgOnBlack: Buffer,
): Promise<Buffer> {
  return extractAlphaCore(sharp(imgOnWhite), sharp(imgOnBlack));
}
