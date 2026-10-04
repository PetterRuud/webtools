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

Not wired yet. Plan: Cloudflare Access (email allowlist) in front of the Worker. Clerk optional later.

## Tools in this slice

| Route | Notes |
| --- | --- |
| `/` | Hub |
| `/tools/hex-rgba` | Client-only hex, rgba, hsl/hsla, hwb, oklch |
| `/tools/image-compress` | Client-side compress + download |

## Transparent (local source)

`tools/transparent/` is the imported Express + **sharp** app. Run it separately with pnpm (`pnpm web` in that folder). It is **not** mounted on Workers Isolates — sharp needs Node/Containers later. The hub lists it honestly as local/source.

## Out of scope (for now)

Private R2 file hosting, Access/Clerk, Cloudflare Images, edge Transparent.
