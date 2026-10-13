import { VIEWPORT_PRESETS, type CaptureRequest, type ViewportPreset } from "./types.ts";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 4000;
const MIN_DIM = 320;

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

function clampDim(value: number, max: number): number {
  if (!Number.isFinite(value)) return MIN_DIM;
  return Math.min(max, Math.max(MIN_DIM, Math.round(value)));
}

export function parseCaptureRequest(body: unknown): CaptureRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Expected JSON body.");
  }
  const record = body as Record<string, unknown>;
  const urlRaw = typeof record.url === "string" ? record.url : "";
  const url = normalizeUrl(urlRaw);

  const preset = (typeof record.preset === "string" ? record.preset : "desktop") as ViewportPreset;
  const fromPreset =
    preset !== "custom" && preset in VIEWPORT_PRESETS
      ? VIEWPORT_PRESETS[preset as Exclude<ViewportPreset, "custom">]
      : null;

  const width = clampDim(Number(record.width ?? fromPreset?.width ?? 1280), MAX_WIDTH);
  const height = clampDim(Number(record.height ?? fromPreset?.height ?? 720), MAX_HEIGHT);
  const fullPage = record.fullPage === true || record.fullPage === "true";
  const deviceScaleFactor = Math.min(2, Math.max(1, Number(record.deviceScaleFactor ?? 1) || 1));

  return { url, width, height, fullPage, deviceScaleFactor };
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
