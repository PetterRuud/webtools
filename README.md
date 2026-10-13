# WebTools

Personal browser-tool hub on **TanStack Start** + **Cloudflare Workers**.

## Stack

- TanStack Start (React, file routes)
- Vite+ (`vp`) + Cloudflare Vite plugin
- pnpm 12
- Tailwind CSS + shadcn/ui primitives (mint theme, light / dark / system)
- Deploy target: `workers.dev` (Cloudflare Access with email later)

Theme preference is stored in `localStorage` (`webtools-ui-theme`) and applied as a `class` on `<html>`. The header toggle switches Light / Dark / System (`prefers-color-scheme`).

## Develop

Requires Node.js 24+ and pnpm 12+ (or a global `vp` CLI).

```bash
vp install   # or: pnpm install
vp run dev   # or: pnpm run dev / vp dev
```

Dev server binds to **http://127.0.0.1:43127**.

## Deploy

```bash
vp run build
vp run deploy
# or: pnpm exec wrangler deploy
```

Wrangler config: `wrangler.jsonc` (Worker name `webtools`). Authenticate with `pnpm exec wrangler login` first.

## Auth / Access

Not wired yet. Access is only planned for future **private R2 file hosting** — not required for Transparent or the rest of the site now.

## Tools

| Route                         | Notes                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `/`                           | Hub (search + categories)                                                                |
| `/tools/hex-rgba`             | Client-only hex, rgba, hsl/hsla, hwb, oklch                                              |
| `/tools/flexbox`              | Flexbox playground — direction, wrap, justify, align, gap                                |
| `/tools/image-compress`       | Client-side compress + optional scale                                                    |
| `/tools/image-crop`           | Visual cropper with aspect presets                                                       |
| `/tools/image-format`         | Convert PNG ↔ JPEG ↔ WebP (canvas)                                                       |
| `/tools/app-icon`             | Favicon + PWA icons + `site.webmanifest` (image / SVG / Lucide; solid or gradient bg)    |
| `/tools/svg-editor`           | Paste/edit SVG, live preview, minify, PNG/SVG export                                     |
| `/tools/nine-slice`           | 9-slice guides + sample panel, multi-size preview, border-image CSS + PNG slices         |
| `/tools/transparent`          | White+black pair → PNG alpha (**Node + sharp**; see below)                               |
| `/tools/json-formatter`       | Pretty / minify / validate JSON                                                          |
| `/tools/regex`                | Pattern + flags + match highlights                                                       |
| `/tools/base64`               | UTF-8-safe encode / decode                                                               |
| `/tools/qrcode`               | Text/URL → QR PNG (size, ECC, colors)                                                    |
| `/tools/text-diff`            | Side-by-side or unified line diff                                                        |
| `/tools/jwt`                  | Decode / encode (HS256 or none); secrets stay local                                      |
| `/tools/ip-lookup`            | Your IP or any address (Worker → ipwho.is)                                               |
| `/tools/dns-lookup`           | DoH records + email setup (MX/SPF/DKIM/DMARC)                                            |
| `/tools/browser-info`         | UA, viewport, languages, storage flags                                                   |
| `/tools/http-status`          | Searchable HTTP status reference                                                         |
| `/tools/tailwind-cheat-sheet` | Searchable Tailwind utility cheat sheet                                                  |
| `/tools/website-screenshot`   | URL → PNG (local Chrome / mock; Workers Browser Rendering)                               |
| `/tools/crawler-simulator`    | No-JS vs JS crawl: title, meta, headings, OG, links (`/tools/spa-vs-bot` redirects here) |
| `/tools/serp-preview`         | Google SERP snippet preview (title / description / pixel width)                          |
| `/tools/og-preview`           | Open Graph / social share card preview from URL                                          |
| `/tools/robots-txt`           | Fetch or paste robots.txt; test allow/disallow paths                                     |
| `/tools/utm-builder`          | Build campaign URLs with UTM parameters                                                  |
| `/tools/redirect-checker`     | Follow redirect hops: status, timing, final destination                                  |
| `/tools/broken-link-checker`  | Fetch page links; check status (cap ~50); internal/external                              |
| `/tools/seo-audit`            | On-page / technical SEO pass·warn·fail checklist                                         |

## Crawler simulator

UI at **`/tools/crawler-simulator`** (legacy `/tools/spa-vs-bot` redirects).

| View    | How                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| No-JS   | Raw `fetch` of HTML + DIY SEO extract (title, meta description, canonical, robots, OG, headings, links, word count)                           |
| With JS | Local: Chrome `--dump-dom` → Playwright `page.content()`; Workers: `env.BROWSER.quickAction("content")`. Graceful `unavailable` if none work. |

## Website screenshot

UI at **`/tools/website-screenshot`**.

| Runtime                     | Capture                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `vp run dev` / `vp preview` | Vite Node middleware — system Chrome headless, optional Playwright, else **mock PNG**  |
| Cloudflare Workers          | `env.BROWSER.quickAction("screenshot")` when the browser binding is set; else mock PNG |

Prod setup: `wrangler.jsonc` already declares `"browser": { "binding": "BROWSER", "remote": true }` and `compatibility_date` ≥ `2026-03-24`. Enable Browser Rendering in the Cloudflare dashboard if prompted. Optional local full-page: `pnpm add -D playwright && pnpm exec playwright install chromium`.

## Transparent (Node + sharp)

UI lives at **`/tools/transparent`** in the hub shell.

| Runtime                         | Processing                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `vp run dev` / `vp run preview` | **Works** — Vite Node middleware handles `POST /api/transparent/extract` with sharp |
| Cloudflare Workers Isolates     | **UI loads; extract returns 501** — native sharp cannot load in Isolates            |

Shared code: `src/lib/transparent/`. Containers only if a Node path is not enough later.

## Out of scope (for now)

Private R2 file hosting, Access/Clerk, Cloudflare Images, Isolates-native Transparent.
