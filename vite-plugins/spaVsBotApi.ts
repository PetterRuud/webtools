import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { Plugin } from "vite";
import {
  fetchWithJsNode,
  parseCompareRequest,
  readJsonBody,
  runCompare,
} from "../src/lib/spaVsBot/index.ts";

const API_PATH = "/api/crawler-simulator/compare";
const LEGACY_API_PATH = "/api/spa-vs-bot/compare";

function nodeToWebRequest(req: IncomingMessage, host: string): Request {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }

  const url = `http://${host}${req.url ?? API_PATH}`;
  const method = req.method ?? "GET";
  if (method === "GET" || method === "HEAD") {
    return new Request(url, { method, headers });
  }

  return new Request(url, {
    method,
    headers,
    duplex: "half",
    body: Readable.toWeb(req) as ReadableStream,
  } as RequestInit);
}

async function handleCompare(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const host = req.headers.host || "127.0.0.1";
    const request = nodeToWebRequest(req, host);
    const body = await readJsonBody(request);
    const { url } = parseCompareRequest(body);
    const result = await runCompare(url, () => fetchWithJsNode(url));

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(result));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Compare failed";
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  }
}

function attach(middlewares: {
  use: (
    path: string,
    fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
  ) => void;
}) {
  const handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.method !== "POST") {
      next();
      return;
    }
    void handleCompare(req, res);
  };
  middlewares.use(API_PATH, handler);
  middlewares.use(LEGACY_API_PATH, handler);
}

/**
 * Serves POST /api/crawler-simulator/compare from the Vite Node process.
 * Legacy alias: /api/spa-vs-bot/compare.
 * No-JS: raw fetch. JS: Chrome dump-dom + screenshot → Playwright → unavailable.
 */
export function spaVsBotApiPlugin(): Plugin {
  return {
    name: "webtools-crawler-simulator-api",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
