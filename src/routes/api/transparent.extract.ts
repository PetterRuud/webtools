import { createFileRoute } from '@tanstack/react-router'
import { TRANSPARENT_NODE_NOTE } from '#/lib/transparent/types'

/**
 * Workers Isolates fallback. Local `vite dev` / `vite preview` intercept this
 * path in the Node process (see vite-plugins/transparentApi.ts) before workerd.
 * Do not import sharp here — it would break the Worker bundle.
 */
export const Route = createFileRoute('/api/transparent/extract')({
  server: {
    handlers: {
      POST: async () => {
        return Response.json(
          {
            error: TRANSPARENT_NODE_NOTE,
            runtime: 'workers-isolates',
          },
          { status: 501 },
        )
      },
    },
  },
})
