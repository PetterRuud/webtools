import { detectLikelySpa } from "./extract.ts";
import { fetchNoJsView } from "./noJsFetch.ts";
import type { CompareResult, JsFetchResult } from "./types.ts";

export { normalizeUrl, parseCompareRequest, readJsonBody } from "./options.ts";
export { buildSnapshot, detectLikelySpa, extractTextFromHtml } from "./extract.ts";
export { fetchNoJsView } from "./noJsFetch.ts";
export { fetchWithJsNode } from "./nodeJsFetch.ts";
export { fetchWithJsWorkers, type BrowserContentBinding } from "./workersJsFetch.ts";
export type {
  CompareRequest,
  CompareResult,
  JsFetchMode,
  JsFetchResult,
  ViewSnapshot,
} from "./types.ts";

export async function runCompare(
  url: string,
  jsFetch: () => Promise<JsFetchResult>,
): Promise<CompareResult> {
  const [noJs, js] = await Promise.all([fetchNoJsView(url), jsFetch()]);

  return {
    url,
    noJs,
    withJs: js.snapshot,
    jsMode: js.mode,
    jsError: js.error,
    jsScreenshotPngBase64: js.screenshotPngBase64,
    likelySpa: detectLikelySpa(noJs, js.snapshot),
  };
}
