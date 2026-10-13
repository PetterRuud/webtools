import { buildSnapshot } from "./extract.ts";
import type { JsFetchResult } from "./types.ts";

/** Minimal surface we need from env.BROWSER (BrowserRun). */
export type BrowserContentBinding = {
  quickAction: (
    action: "content",
    options: {
      url: string;
      gotoOptions?: {
        waitUntil?: "networkidle0" | "domcontentloaded" | "load";
        timeout?: number;
      };
      setJavaScriptEnabled?: boolean;
      userAgent?: string;
      cacheTTL?: number;
    },
  ) => Promise<Response>;
};

export async function fetchWithJsWorkers(
  url: string,
  browser: BrowserContentBinding | null | undefined,
): Promise<JsFetchResult> {
  if (!browser || typeof browser.quickAction !== "function") {
    return {
      snapshot: null,
      mode: "unavailable",
      error:
        "JS view unavailable — Browser Rendering binding missing. Locally use Chrome/Playwright via the Vite middleware.",
    };
  }

  try {
    const res = await browser.quickAction("content", {
      url,
      gotoOptions: {
        waitUntil: "networkidle0",
        timeout: 45_000,
      },
      setJavaScriptEnabled: true,
      cacheTTL: 0,
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const errJson = (await res.json()) as {
          errors?: Array<{ message?: string }>;
        };
        const msg = errJson.errors?.[0]?.message;
        if (msg) detail = msg;
      } catch {
        /* ignore */
      }
      return {
        snapshot: null,
        mode: "unavailable",
        error: `Browser Rendering content failed: ${detail}`,
      };
    }

    const payload = (await res.json()) as {
      success?: boolean;
      result?: string;
    };
    const html = typeof payload.result === "string" ? payload.result : "";
    if (!html.trim()) {
      return {
        snapshot: null,
        mode: "unavailable",
        error: "Browser Rendering returned empty HTML.",
      };
    }

    return {
      snapshot: buildSnapshot(html, { finalUrl: url, status: null }),
      mode: "browser-rendering",
      error: null,
    };
  } catch (e) {
    return {
      snapshot: null,
      mode: "unavailable",
      error: e instanceof Error ? e.message : "Browser Rendering content request failed",
    };
  }
}
