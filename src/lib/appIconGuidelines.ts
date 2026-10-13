/**
 * Platform icon / manifest rules we bake into previews + exports.
 * Sources: Apple HIG App Icons, Android adaptive icons + Play icon specs, web.dev maskable icons.
 */

/** Apple: provide square 1024²; system applies continuous corner mask. No transparency for App Store. */
export const IOS = {
  masterSize: 1024,
  /** Approx continuous corner radius as % of width (visual preview only). */
  previewRadiusPercent: 22.37,
  appleTouchSize: 180,
} as const;

/**
 * Android adaptive: 108dp layers; key art in ~66dp safe zone.
 * Flattened maskable PNG: opaque full-bleed; logo inside center circle r=40% of width
 * (same safe zone as W3C maskable icons). Outer ~10% may be cropped by OEM masks.
 */
export const ANDROID = {
  playStoreSize: 512,
  /** Play Console dynamically rounds; do not pre-round the asset. */
  playCornerRadiusPercent: 30,
  /** Minimum inset so glyph stays in maskable safe zone (10% each side ≈ ø80%). */
  maskableMinPaddingPercent: 10,
  adaptiveSafeZoneRatio: 66 / 108,
} as const;

/** PWA / site.webmanifest — separate `any` vs `maskable` (avoid `any maskable`). */
export const WEB = {
  anySizes: [192, 512] as const,
  maskableSize: 512,
  faviconSizes: [16, 32, 48] as const,
} as const;

export const GUIDELINE_BLURBS = {
  ios: "Square 1024² master · opaque · system applies squircle mask",
  android: "Maskable: full-bleed opaque · logo in center safe zone · Play 512² unmasked",
  web: "Manifest: separate any + maskable icons · 192 & 512 required",
} as const;
