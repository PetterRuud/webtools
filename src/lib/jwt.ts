export type JwtPart = {
  raw: string
  json: unknown
  text: string
}

export type JwtDecodeResult =
  | {
      ok: true
      header: JwtPart
      payload: JwtPart
      signature: string
      signed: boolean
    }
  | { ok: false; error: string }

function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function utf8ToBase64Url(text: string): string {
  return bytesToBase64Url(new TextEncoder().encode(text))
}

function decodePart(raw: string): JwtPart {
  const bytes = base64UrlToBytes(raw)
  const text = new TextDecoder().decode(bytes)
  try {
    return { raw, text, json: JSON.parse(text) as unknown }
  } catch {
    return { raw, text, json: text }
  }
}

export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim()
  if (!trimmed) return { ok: false, error: 'Paste a JWT.' }

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return { ok: false, error: 'JWT must have three base64url segments.' }
  }

  const [headerRaw, payloadRaw, signature] = parts
  if (!headerRaw || !payloadRaw) {
    return { ok: false, error: 'Missing header or payload.' }
  }

  try {
    return {
      ok: true,
      header: decodePart(headerRaw),
      payload: decodePart(payloadRaw),
      signature,
      signed: Boolean(signature),
    }
  } catch {
    return { ok: false, error: 'Could not decode header/payload.' }
  }
}

export async function encodeJwt(options: {
  header: string
  payload: string
  secret: string
}): Promise<{ token: string } | { error: string }> {
  let headerObj: Record<string, unknown>
  let payloadObj: unknown
  try {
    headerObj = JSON.parse(options.header) as Record<string, unknown>
  } catch {
    return { error: 'Header is not valid JSON.' }
  }
  try {
    payloadObj = JSON.parse(options.payload) as unknown
  } catch {
    return { error: 'Payload is not valid JSON.' }
  }

  const alg = String(headerObj.alg ?? 'HS256')
  if (alg !== 'HS256' && alg !== 'none') {
    return { error: 'Client encode supports HS256 or none only.' }
  }

  const headerB64 = utf8ToBase64Url(JSON.stringify(headerObj))
  const payloadB64 = utf8ToBase64Url(JSON.stringify(payloadObj))
  const signingInput = `${headerB64}.${payloadB64}`

  if (alg === 'none') {
    return { token: `${signingInput}.` }
  }

  if (!options.secret) {
    return { error: 'Secret required for HS256.' }
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(options.secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput),
  )
  const signature = bytesToBase64Url(new Uint8Array(sig))
  return { token: `${signingInput}.${signature}` }
}

export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
