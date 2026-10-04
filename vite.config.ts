import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { transparentApiPlugin } from './vite-plugins/transparentApi.ts'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    // Node middleware for sharp — must stay out of the Workers graph.
    transparentApiPlugin(),
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    exclude: ['sharp'],
  },
})

export default config
