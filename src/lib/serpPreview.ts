/** Approximate Google SERP title pixel width (desktop). */
const CHAR_WIDTHS: Record<string, number> = {
  " ": 3.5,
  i: 4,
  l: 4,
  j: 4,
  t: 5,
  f: 5,
  r: 5,
  I: 5,
  "'": 3,
  ".": 3.5,
  ",": 3.5,
  "-": 5,
  W: 12,
  M: 11,
  m: 10,
  w: 10,
  "@": 10,
};

const DEFAULT_CHAR = 7.2;
const TITLE_LIMIT_PX = 580;
const DESC_LIMIT_PX = 920;
const TITLE_SOFT_CHARS = 60;
const DESC_SOFT_CHARS = 160;

export function estimatePixelWidth(text: string): number {
  let width = 0;
  for (const ch of text) {
    width += CHAR_WIDTHS[ch] ?? DEFAULT_CHAR;
  }
  return Math.round(width);
}

export function truncateToPixels(text: string, maxPx: number): string {
  if (estimatePixelWidth(text) <= maxPx) return text;
  let out = "";
  for (const ch of text) {
    const next = out + ch;
    if (estimatePixelWidth(`${next}…`) > maxPx) break;
    out = next;
  }
  return `${out.trimEnd()}…`;
}

export function displayUrl(url: string): string {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    const parts = [u.hostname, ...path.split("/").filter(Boolean)];
    return parts.join(" › ");
  } catch {
    return url;
  }
}

export type SerpPreviewInput = {
  title: string;
  description: string;
  url: string;
};

export type SerpPreviewResult = {
  title: string;
  titlePx: number;
  titleTruncated: string;
  titleOver: boolean;
  description: string;
  descriptionPx: number;
  descriptionTruncated: string;
  descriptionOver: boolean;
  displayUrl: string;
  titleChars: number;
  descriptionChars: number;
};

export function buildSerpPreview(input: SerpPreviewInput): SerpPreviewResult {
  const title = input.title.trim();
  const description = input.description.trim();
  const titlePx = estimatePixelWidth(title);
  const descriptionPx = estimatePixelWidth(description);
  return {
    title,
    titlePx,
    titleTruncated: truncateToPixels(title, TITLE_LIMIT_PX),
    titleOver: titlePx > TITLE_LIMIT_PX || title.length > TITLE_SOFT_CHARS,
    description,
    descriptionPx,
    descriptionTruncated: truncateToPixels(description, DESC_LIMIT_PX),
    descriptionOver: descriptionPx > DESC_LIMIT_PX || description.length > DESC_SOFT_CHARS,
    displayUrl: displayUrl(input.url.trim() || "https://example.com"),
    titleChars: title.length,
    descriptionChars: description.length,
  };
}

export const SERP_SAMPLE: SerpPreviewInput = {
  title: "Example Domain — illustrative examples in documents",
  description:
    "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.",
  url: "https://example.com/",
};

export const TITLE_LIMIT_PX_EXPORT = TITLE_LIMIT_PX;
export const DESC_LIMIT_PX_EXPORT = DESC_LIMIT_PX;
