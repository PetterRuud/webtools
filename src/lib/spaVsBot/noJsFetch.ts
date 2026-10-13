import { buildSnapshot } from "./extract.ts";
import { BOT_USER_AGENT, FETCH_TIMEOUT_MS, MAX_HTML_BYTES } from "./options.ts";
import type { ViewSnapshot } from "./types.ts";

export async function fetchNoJsView(url: string): Promise<ViewSnapshot> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "User-Agent": BOT_USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const buf = new Uint8Array(await res.arrayBuffer());
    const sliced = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(sliced);
    return buildSnapshot(html, {
      finalUrl: res.url || url,
      status: res.status,
    });
  } finally {
    clearTimeout(timer);
  }
}
