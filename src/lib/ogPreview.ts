export type OgPreviewFields = {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
  twitterCard: string
}

export function fieldsFromOg(og: Record<string, string>, fallbacks: {
  title?: string
  description?: string
  url?: string
}): OgPreviewFields {
  return {
    title:
      og['og:title'] ||
      og['twitter:title'] ||
      fallbacks.title ||
      '',
    description:
      og['og:description'] ||
      og['twitter:description'] ||
      fallbacks.description ||
      '',
    image: og['og:image'] || og['twitter:image'] || '',
    url: og['og:url'] || fallbacks.url || '',
    siteName: og['og:site_name'] || '',
    type: og['og:type'] || '',
    twitterCard: og['twitter:card'] || '',
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url.includes('://') ? url : `https://${url}`).hostname
  } catch {
    return url
  }
}
