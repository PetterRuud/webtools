# Transparent (Node API)

Alpha extraction from a white/black photo pair. Processing lives in `src/lib/transparent/` (sharp). The hub UI is `/tools/transparent`.

## Prefer the hub

```bash
# from repo root
vp install   # or: pnpm install
vp run dev
# → http://127.0.0.1:43127/tools/transparent
# POST /api/transparent/extract is handled by Vite Node middleware (sharp)
```

## Optional Express sidecar

```bash
# from repo root
vp run transparent
# → POST http://localhost:3847/api/extract
```

Or from this folder (own deps): `pnpm install && pnpm web`.

## Workers

Cloudflare Workers Isolates **cannot** load native sharp. Deployed hub UI still loads; extract returns **501** with that note. Containers later only if a Node path is not enough.

## Shared modules

| Path | Role |
| --- | --- |
| `src/lib/transparent/extract.ts` | Two-pass alpha |
| `src/lib/transparent/imagePrep.ts` | Crop / resize / trim |
| `src/lib/transparent/process.ts` | Orchestration |
| `vite-plugins/transparentApi.ts` | Dev/preview Node middleware |
