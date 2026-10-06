import { defineConfig, lazyPlugins } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { spaVsBotApiPlugin } from "./vite-plugins/spaVsBotApi.ts";
import { transparentApiPlugin } from "./vite-plugins/transparentApi.ts";
import { websiteScreenshotApiPlugin } from "./vite-plugins/websiteScreenshotApi.ts";

const config = defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    // Node middleware for sharp — must stay out of the Workers graph.
    transparentApiPlugin(),
    websiteScreenshotApiPlugin(),
    spaVsBotApiPlugin(),
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ]),
  optimizeDeps: {
    exclude: ["sharp"],
  },
});

export default config;
