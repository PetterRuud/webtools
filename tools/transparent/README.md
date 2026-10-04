# Transparent

Recover PNG alpha from a pair of photos of the same subject on white and black backgrounds.

## Run locally

```bash
pnpm install
pnpm web
```

Open http://localhost:3847 (or set `PORT`).

## API

`POST /api/extract` — multipart fields `white` and `black`; returns `image/png`.

Optional form fields: `trimInputs`, `trimThreshold`, crop (`cropLeft`/`cropTop`/`cropWidth`/`cropHeight`), resize (`resizeWidth`/`resizeHeight`/`resizeFit`/`resizeNoUpscale`), `trimResult`, `trimResultThreshold`.

## Note

Imported from `~/Developer/transparent` on Mac (copy; original left in place). No prior git history. Server-side **sharp** — not Workers Isolates–compatible without a Containers rewrite or alternate pipeline.
