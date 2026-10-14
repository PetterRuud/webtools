import { buildSnapshot } from "./extract.ts";
import { BROWSER_USER_AGENT, JS_SCREENSHOT } from "./options.ts";
import type { JsFetchResult } from "./types.ts";

/** Minimal surface we need from env.BROWSER (BrowserRun `snapshot`). */
export type BrowserContentBinding = {
  quickAction: (
    action: "snapshot",
    options: {
      url: string;
      formats?: Array<"content" | "screenshot" | "markdown" | "accessibilityTree">;
      gotoOptions?: {
        waitUntil?: "networkidle0" | "domcontentloaded" | "load";
        timeout?: number;
      };
      setJavaScriptEnabled?: boolean;
      userAgent?: string;
      cacheTTL?: number;
      viewport?: {
        width: number;
        height: number;
        deviceScaleFactor?: number;
      };
      screenshotOptions?: {
        type?: "png";
        fullPage?: boolean;
      };
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
      screenshotPngBase64: null,
    };
  }

  try {
    const res = await browser.quickAction("snapshot", {
      url,
      formats: ["content", "screenshot"],
      viewport: {
        width: JS_SCREENSHOT.width,
        height: JS_SCREENSHOT.height,
        deviceScaleFactor: JS_SCREENSHOT.deviceScaleFactor,
      },
      screenshotOptions: {
        type: "png",
        fullPage: JS_SCREENSHOT.fullPage,
      },
      gotoOptions: {
        waitUntil: "networkidle0",
        timeout: 45_000,
      },
      setJavaScriptEnabled: true,
      userAgent: BROWSER_USER_AGENT,
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
        error: `Browser Rendering snapshot failed: ${detail}`,
        screenshotPngBase64: null,
      };
    }

    const payload = (await res.json()) as {
      success?: boolean;
      result?: {
        content?: string;
        screenshot?: string;
      };
    };
    const html = typeof payload.result?.content === "string" ? payload.result.content : "";
    if (!html.trim()) {
      return {
        snapshot: null,
        mode: "unavailable",
        error: "Browser Rendering returned empty HTML.",
        screenshotPngBase64: null,
      };
    }

    const rawShot = payload.result?.screenshot;
    const screenshotPngBase64 =
      typeof rawShot === "string" && rawShot.trim()
        ? rawShot.replace(/^data:image\/\w+;base64,/, "")
        : null;

    return {
      snapshot: buildSnapshot(html, { finalUrl: url, status: null }),
      mode: "browser-rendering",
      error: null,
      screenshotPngBase64,
    };
  } catch (e) {
    return {
      snapshot: null,
      mode: "unavailable",
      error: e instanceof Error ? e.message : "Browser Rendering snapshot request failed",
      screenshotPngBase64: null,
    };
  }
}
