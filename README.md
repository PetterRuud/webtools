# WebTools

Personal browser-tool hub on **TanStack Start** + **Cloudflare Workers**.

## Stack

- TanStack Start (React, file routes)
- Vite + Cloudflare Vite plugin
- Tailwind CSS + shadcn/ui primitives (mint theme, light / dark / system)
- Deploy target: `workers.dev` (Cloudflare Access with email later)

Theme preference is stored in `localStorage` (`webtools-ui-theme`) and applied as a `class` on `<html>`. The header toggle switches Light / Dark / System (`prefers-color-scheme`).

## Develop

```bash
npm install
npm run dev
```

Dev server binds to **http://127.0.0.1:43127**.

## Deploy

```bash
npm run build
npm run deploy
# or: npx wrangler deploy
```

Wrangler config: `wrangler.jsonc` (Worker name `webtools`). Authenticate with `npx wrangler login` first.

## Auth / Access

Not wired yet. Access is only planned for future **private R2 file hosting** — not required for Transparent or the rest of the site now.

## Tools

| Route | Notes |
| --- | --- |
| `/` | Hub (search + categories) |
| `/tools/hex-rgba` | Client-only hex, rgba, hsl/hsla, hwb, oklch |
| `/tools/flexbox` | Flexbox playground — direction, wrap, justify, align, gap |
| `/tools/image-compress` | Client-side compress + optional scale |
| `/tools/image-crop` | Visual cropper with aspect presets |
| `/tools/image-format` | Convert PNG ↔ JPEG ↔ WebP (canvas) |
| `/tools/svg-editor` | Paste/edit SVG, live preview, minify, PNG/SVG export |
| `/tools/nine-slice` | 9-slice guides + sample panel, multi-size preview, border-image CSS + PNG slices |
| `/tools/transparent` | White+black pair → PNG alpha (**Node + sharp**; see below) |
| `/tools/json-formatter` | Pretty / minify / validate JSON |
| `/tools/regex` | Pattern + flags + match highlights |
| `/tools/base64` | UTF-8-safe encode / decode |
| `/tools/text-diff` | Side-by-side or unified line diff |
| `/tools/jwt` | Decode / encode (HS256 or none); secrets stay local |
| `/tools/ip-lookup` | Your IP or any address (Worker → ipwho.is) |
| `/tools/dns-lookup` | DNS over HTTPS via cloudflare-dns.com |
| `/tools/browser-info` | UA, viewport, languages, storage flags |
| `/tools/http-status` | Searchable HTTP status reference |
| `/tools/tailwind-cheat-sheet` | Searchable Tailwind utility cheat sheet |

## Transparent (Node + sharp)

UI lives at **`/tools/transparent`** in the hub shell.

| Runtime | Processing |
| --- | --- |
| `npm run dev` / `vite preview` | **Works** — Vite Node middleware handles `POST /api/transparent/extract` with sharp |
| `npm run transparent` | **Works** — optional Express sidecar on port **3847** (`POST /api/extract`) |
| Cloudflare Workers Isolates | **UI loads; extract returns 501** — native sharp cannot load in Isolates |

Shared code: `src/lib/transparent/`. Containers only if a Node path is not enough later.

## Out of scope (for now)

Private R2 file hosting, Access/Clerk, Cloudflare Images, Isolates-native Transparent.
