import {
  extractCanonical,
  extractLinks,
  extractMetaDescription,
  extractTitle,
} from "#/lib/spaVsBot/extract";

export const MAX_LINKS_TO_CHECK = 50;
export const LINK_CHECK_TIMEOUT_MS = 8_000;
export const LINK_CHECK_CONCURRENCY = 6;

export type BrokenLinkItem = {
  href: string;
  text: string;
  external: boolean;
  status: number | null;
  finalUrl: string | null;
  ms: number | null;
  ok: boolean;
  error: string | null;
};

export type BrokenLinkCheckResult = {
  pageUrl: string;
  finalUrl: string;
  status: number;
  title: string;
  metaDescription: string;
  canonical: string;
  linkCount: number;
  internalLinks: number;
  externalLinks: number;
  checked: number;
  capped: boolean;
  ok: number;
  broken: number;
  links: BrokenLinkItem[];
};

/** Unique http(s) links from HTML, capped for scan size. */
export function collectLinksToCheck(
  html: string,
  baseUrl: string,
  max = MAX_LINKS_TO_CHECK,
): {
  linkCount: number;
  internalLinks: number;
  externalLinks: number;
  links: Array<{ href: string; text: string; external: boolean }>;
  capped: boolean;
} {
  const stats = extractLinks(html, baseUrl, { maxLinks: max * 4 });
  const seen = new Set<string>();
  const links: Array<{ href: string; text: string; external: boolean }> = [];
  for (const link of stats.links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    links.push(link);
    if (links.length >= max) break;
  }
  return {
    linkCount: stats.linkCount,
    internalLinks: stats.internalLinks,
    externalLinks: stats.externalLinks,
    links,
    capped: stats.linkCount > links.length || links.length >= max,
  };
}

export function pageMetaFromHtml(html: string, meta: { finalUrl: string; status: number }) {
  return {
    finalUrl: meta.finalUrl,
    status: meta.status,
    title: extractTitle(html),
    metaDescription: extractMetaDescription(html),
    canonical: extractCanonical(html),
  };
}

export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = Array.from<R>({ length: items.length });
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}
