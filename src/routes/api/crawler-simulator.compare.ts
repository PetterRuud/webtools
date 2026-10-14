import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { fetchWithJsWorkers, parseCompareRequest, readJsonBody, runCompare } from "#/lib/spaVsBot";

/**
 * Production / workerd path. Local `vp run dev` usually hits the Vite Node
 * middleware first (vite-plugins/spaVsBotApi.ts).
 *
 * JS view: Cloudflare Browser Rendering `quickAction('snapshot')`
 * (HTML + best-effort viewport screenshot). No-JS: raw HTTP fetch + SEO extract.
 */
export const Route = createFileRoute("/api/crawler-simulator/compare")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await readJsonBody(request);
          const { url } = parseCompareRequest(body);
          const result = await runCompare(url, () => fetchWithJsWorkers(url, env.BROWSER));
          return Response.json(result, {
            headers: { "Cache-Control": "no-store" },
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Crawl failed";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
