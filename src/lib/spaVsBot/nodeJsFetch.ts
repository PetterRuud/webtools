import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import { buildSnapshot } from './extract.ts'
import { BROWSER_USER_AGENT, FETCH_TIMEOUT_MS } from './options.ts'
import type { JsFetchResult } from './types.ts'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.GOOGLE_CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
].filter((v): v is string => Boolean(v))

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.X_OK)
    return true
  } catch {
    try {
      await access(path, fsConstants.F_OK)
      return true
    } catch {
      return false
    }
  }
}

async function findChrome(): Promise<string | null> {
  for (const candidate of CHROME_CANDIDATES) {
    if (await pathExists(candidate)) return candidate
  }
  return null
}

function runDumpDom(
  chromePath: string,
  url: string,
  timeoutMs = FETCH_TIMEOUT_MS + 15_000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--virtual-time-budget=8000',
      `--user-agent=${BROWSER_USER_AGENT}`,
      '--dump-dom',
      url,
    ]
    const child = spawn(chromePath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error('JS render timed out.'))
    }, timeoutMs)
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8')
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
    })
    child.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code !== 0 && !stdout.trim()) {
        reject(new Error(stderr.trim() || `Chrome exited with code ${code}`))
        return
      }
      resolve(stdout)
    })
  })
}

async function fetchWithPlaywright(url: string): Promise<string> {
  const mod = 'playwright'
  const pw = (await import(/* @vite-ignore */ mod)) as {
    chromium: {
      launch: (opts: { headless: boolean }) => Promise<{
        newPage: () => Promise<{
          setUserAgent: (ua: string) => Promise<void>
          goto: (
            u: string,
            opts: { waitUntil: string; timeout: number },
          ) => Promise<unknown>
          content: () => Promise<string>
        }>
        close: () => Promise<void>
      }>
    }
  }
  const browser = await pw.chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setUserAgent(BROWSER_USER_AGENT)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
    return await page.content()
  } finally {
    await browser.close()
  }
}

export async function fetchWithJsNode(url: string): Promise<JsFetchResult> {
  const chrome = await findChrome()
  if (chrome) {
    try {
      const html = await runDumpDom(chrome, url)
      if (html.trim()) {
        return {
          snapshot: buildSnapshot(html, { finalUrl: url, status: null }),
          mode: 'node-chrome',
          error: null,
        }
      }
    } catch {
      // fall through
    }
  }

  try {
    const html = await fetchWithPlaywright(url)
    if (html.trim()) {
      return {
        snapshot: buildSnapshot(html, { finalUrl: url, status: null }),
        mode: 'node-playwright',
        error: null,
      }
    }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Playwright JS render failed'
    if (!chrome) {
      return {
        snapshot: null,
        mode: 'unavailable',
        error: `JS view unavailable (no Chrome/Playwright): ${message}`,
      }
    }
  }

  return {
    snapshot: null,
    mode: 'unavailable',
    error:
      'JS view unavailable — install Chrome or `pnpm add -D playwright && pnpm exec playwright install chromium`, or deploy with Browser Rendering.',
  }
}
