import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMockScreenshotPng } from "./mockPng.ts";
import type { CaptureRequest, CaptureResult } from "./types.ts";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.GOOGLE_CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
].filter((v): v is string => Boolean(v));

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.X_OK);
    return true;
  } catch {
    try {
      await access(path, fsConstants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

async function findChrome(): Promise<string | null> {
  for (const candidate of CHROME_CANDIDATES) {
    if (await pathExists(candidate)) return candidate;
  }
  return null;
}

function run(
  cmd: string,
  args: string[],
  timeoutMs = 45_000,
): Promise<{ code: number | null; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Screenshot timed out."));
    }, timeoutMs);
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stderr });
    });
  });
}

async function captureWithChrome(chromePath: string, req: CaptureRequest): Promise<Uint8Array> {
  const dir = await mkdtemp(join(tmpdir(), "webtools-shot-"));
  const outPath = join(dir, "shot.png");
  try {
    // Chrome --screenshot is viewport-sized; fullPage uses a taller window.
    const height = req.fullPage ? Math.min(4000, Math.max(req.height, 1600)) : req.height;
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      `--window-size=${req.width},${height}`,
      `--screenshot=${outPath}`,
      req.url,
    ];
    const { code, stderr } = await run(chromePath, args);
    if (code !== 0) {
      throw new Error(stderr.trim() || `Chrome exited with code ${code}`);
    }
    return new Uint8Array(await readFile(outPath));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function captureWithPlaywright(req: CaptureRequest): Promise<Uint8Array> {
  // Optional peer — not in package.json unless installed locally.
  const mod = "playwright";
  const pw = (await import(/* @vite-ignore */ mod)) as {
    chromium: {
      launch: (opts: { headless: boolean }) => Promise<{
        newPage: (opts: {
          viewport: { width: number; height: number };
          deviceScaleFactor: number;
        }) => Promise<{
          goto: (url: string, opts: { waitUntil: string; timeout: number }) => Promise<unknown>;
          screenshot: (opts: { type: "png"; fullPage: boolean }) => Promise<Buffer>;
        }>;
        close: () => Promise<void>;
      }>;
    };
  };
  const browser = await pw.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: req.width, height: req.height },
      deviceScaleFactor: req.deviceScaleFactor,
    });
    await page.goto(req.url, { waitUntil: "networkidle", timeout: 45_000 });
    const buf = await page.screenshot({
      type: "png",
      fullPage: req.fullPage,
    });
    return new Uint8Array(buf);
  } finally {
    await browser.close();
  }
}

export async function captureWebsiteScreenshotNode(req: CaptureRequest): Promise<CaptureResult> {
  const chrome = await findChrome();
  if (chrome) {
    try {
      const png = await captureWithChrome(chrome, req);
      return { png, mode: "node-chrome" };
    } catch {
      // fall through
    }
  }

  try {
    const png = await captureWithPlaywright(req);
    return { png, mode: "node-playwright" };
  } catch {
    // fall through to mock
  }

  const png = await createMockScreenshotPng(req.width, req.height);
  return { png, mode: "mock" };
}
