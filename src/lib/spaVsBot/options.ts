import type { CompareRequest } from "./types.ts";

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter a URL.");
  }
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("Invalid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http: and https: URLs are supported.");
  }
  if (!parsed.hostname) {
    throw new Error("URL is missing a hostname.");
  }
  return parsed.toString();
}

export function parseCompareRequest(body: unknown): CompareRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Expected JSON body.");
  }
  const record = body as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url : "";
  return { url: normalizeUrl(url) };
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Body must be JSON.");
  }
}

/** Simple crawler / bot-like UA — what many link checkers send. */
export const BOT_USER_AGENT = "Mozilla/5.0 (compatible; WebToolsBot/1.0; +https://webtools.local)";

export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export const FETCH_TIMEOUT_MS = 20_000;
export const MAX_HTML_BYTES = 2_000_000;

/** Compact viewport for the With-JS preview image (keeps compare JSON smaller). */
export const JS_SCREENSHOT = {
  width: 960,
  height: 540,
  deviceScaleFactor: 1,
  fullPage: false,
} as const;

export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  const chunk = 0x2000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, slice as unknown as number[]);
  }
  return btoa(binary);
}
