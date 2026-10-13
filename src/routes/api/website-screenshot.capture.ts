import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import {
  captureWebsiteScreenshotWorkers,
  parseCaptureRequest,
  pngCaptureResponse,
  readJsonBody,
} from "#/lib/websiteScreenshot";

/**
 * Production / workerd path. Local `vp run dev` usually hits the Vite Node
 * middleware first (vite-plugins/websiteScreenshotApi.ts).
 *
 * Uses Cloudflare Browser Rendering when `BROWSER` is bound; otherwise a mock PNG.
 */
export const Route = createFileRoute("/api/website-screenshot/capture")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await readJsonBody(request);
          const captureReq = parseCaptureRequest(body);
          const result = await captureWebsiteScreenshotWorkers(captureReq, env.BROWSER);
          return pngCaptureResponse(result);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Screenshot capture failed";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
