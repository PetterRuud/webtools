import type { CaptureResult } from "./types.ts";

export function pngCaptureResponse(result: CaptureResult): Response {
  const headers = new Headers({
    "Content-Type": "image/png",
    "Cache-Control": "no-store",
    "X-Capture-Mode": result.mode,
  });
  return new Response(new Blob([Uint8Array.from(result.png)], { type: "image/png" }), {
    status: 200,
    headers,
  });
}
