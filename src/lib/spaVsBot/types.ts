export type JsFetchMode =
  | 'browser-rendering'
  | 'node-chrome'
  | 'node-playwright'
  | 'unavailable'

export type ViewSnapshot = {
  /** Final URL after redirects (when known). */
  finalUrl: string
  status: number | null
  title: string
  text: string
  linkCount: number
  htmlBytes: number
  /** First N chars of raw HTML for inspection. */
  htmlPreview: string
}

export type JsFetchResult = {
  snapshot: ViewSnapshot | null
  mode: JsFetchMode
  error: string | null
}

export type CompareRequest = {
  url: string
}

export type CompareResult = {
  url: string
  noJs: ViewSnapshot
  withJs: ViewSnapshot | null
  jsMode: JsFetchMode
  jsError: string | null
  /** Rough signal: with-JS text longer / different enough to look client-rendered. */
  likelySpa: boolean | null
}
