import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server'
import {
  COMMON_DKIM_SELECTORS,
  evaluateEmailDns,
  normalizeEmailDomain,
  unwrapTxt,
} from '#/lib/emailDns'

type IpWhoResponse = {
  success?: boolean
  message?: string
  ip?: string
  type?: string
  continent?: string
  continent_code?: string
  country?: string
  country_code?: string
  region?: string
  region_code?: string
  city?: string
  latitude?: number
  longitude?: number
  postal?: string
  asn?: string
  org?: string
  isp?: string
  timezone?: {
    id?: string
    utc?: string
  }
  connection?: {
    asn?: number
    org?: string
    isp?: string
  }
}

const ALLOWED_DNS_TYPES = new Set([
  'A',
  'AAAA',
  'CNAME',
  'MX',
  'TXT',
  'NS',
  'SOA',
  'SRV',
  'CAA',
  'PTR',
  'ANY',
])

const RCODE: Record<number, string> = {
  0: 'NOERROR',
  1: 'FORMERR',
  2: 'SERVFAIL',
  3: 'NXDOMAIN',
  4: 'NOTIMP',
  5: 'REFUSED',
}

type DohAnswer = {
  name: string
  type: number
  TTL: number
  data: string
}

type DohResponse = {
  Status: number
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question?: Array<{ name: string; type: number }>
  Answer?: DohAnswer[]
  Authority?: DohAnswer[]
  Additional?: DohAnswer[]
  Comment?: string
}

function connectingIp(): string {
  return (
    getRequestHeader('CF-Connecting-IP') ||
    getRequestIP({ xForwardedFor: true }) ||
    ''
  )
}

export const lookupIpFn = createServerFn({ method: 'GET' })
  .validator((data: { ip?: string } | undefined) => ({
    ip: data?.ip?.trim() ?? '',
  }))
  .handler(async ({ data }) => {
    const yours = connectingIp()
    const ip = data.ip || yours

    if (!ip) {
      throw new Error('Could not determine IP address.')
    }

    let lookup: IpWhoResponse | null = null
    let lookupNote: string | undefined
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        lookup = (await res.json()) as IpWhoResponse
      }
    } catch {
      lookup = null
    }

    if (lookup && lookup.success === false) {
      // Private/local IPs (e.g. 127.0.0.1 in vitest/dev) still return the address.
      lookupNote = lookup.message ?? 'No public geo data'
      lookup = null
    }

    return {
      ip,
      yours: !data.ip,
      note: lookupNote,
      type: lookup?.type,
      continent: lookup?.continent,
      continentCode: lookup?.continent_code,
      country: lookup?.country,
      countryCode:
        lookup?.country_code ?? getRequestHeader('CF-IPCountry') ?? undefined,
      region: lookup?.region,
      regionCode: lookup?.region_code,
      city: lookup?.city,
      latitude: lookup?.latitude,
      longitude: lookup?.longitude,
      postal: lookup?.postal,
      asn: lookup?.connection?.asn ?? lookup?.asn,
      org: lookup?.connection?.org ?? lookup?.org,
      isp: lookup?.connection?.isp ?? lookup?.isp,
      timezone: lookup?.timezone?.id,
      utcOffset: lookup?.timezone?.utc,
      cfCountry: getRequestHeader('CF-IPCountry'),
      cfRay: getRequestHeader('CF-Ray'),
    }
  })

async function dohQuery(name: string, type: string): Promise<DohResponse> {
  const doh = new URL('https://cloudflare-dns.com/dns-query')
  doh.searchParams.set('name', name)
  doh.searchParams.set('type', type)

  const res = await fetch(doh, {
    headers: { Accept: 'application/dns-json' },
  })

  if (!res.ok) {
    throw new Error(`DoH request failed (${res.status})`)
  }

  return (await res.json()) as DohResponse
}

function answerData(body: DohResponse, typeNum?: number): string[] {
  const answers = body.Answer ?? []
  if (typeNum == null) return answers.map((a) => a.data)
  return answers.filter((a) => a.type === typeNum).map((a) => a.data)
}

/** DNS type numbers used by DoH JSON. */
const DOH_TYPE = { CNAME: 5, MX: 15, TXT: 16 } as const

export const lookupDnsFn = createServerFn({ method: 'GET' })
  .validator((data: { name?: string; type?: string }) => {
    const name = data.name?.trim() ?? ''
    const type = (data.type?.trim() || 'A').toUpperCase()
    if (!name) throw new Error('Missing name.')
    if (!ALLOWED_DNS_TYPES.has(type)) throw new Error(`Unsupported type: ${type}`)
    if (name.length > 253 || /\s/.test(name)) throw new Error('Invalid name.')
    return { name, type }
  })
  .handler(async ({ data }) => {
    const body = await dohQuery(data.name, data.type)

    return {
      name: data.name,
      type: data.type,
      status: body.Status,
      statusText: RCODE[body.Status] ?? String(body.Status),
      flags: {
        truncated: body.TC,
        recursionDesired: body.RD,
        recursionAvailable: body.RA,
        authenticData: body.AD,
        checkingDisabled: body.CD,
      },
      question: body.Question ?? [],
      answer: body.Answer ?? [],
      authority: body.Authority ?? [],
      additional: body.Additional ?? [],
      comment: body.Comment,
      resolver: 'cloudflare-dns.com',
    }
  })

export const checkEmailDnsFn = createServerFn({ method: 'GET' })
  .validator((data: { domain?: string }) => {
    const domain = normalizeEmailDomain(data.domain ?? '')
    if (!domain) throw new Error('Missing domain.')
    if (domain.length > 253 || /\s/.test(domain) || !domain.includes('.')) {
      throw new Error('Invalid domain.')
    }
    return { domain }
  })
  .handler(async ({ data }) => {
    const { domain } = data

    const [mxBody, txtBody, dmarcBody, mtaStsBody, tlsRptBody, bimiBody, ...dkimBodies] =
      await Promise.all([
        dohQuery(domain, 'MX'),
        dohQuery(domain, 'TXT'),
        dohQuery(`_dmarc.${domain}`, 'TXT'),
        dohQuery(`_mta-sts.${domain}`, 'TXT'),
        dohQuery(`_smtp._tls.${domain}`, 'TXT'),
        dohQuery(`default._bimi.${domain}`, 'TXT'),
        ...COMMON_DKIM_SELECTORS.map((selector) =>
          dohQuery(`${selector}._domainkey.${domain}`, 'TXT'),
        ),
      ])

    const dkim = COMMON_DKIM_SELECTORS.map((selector, index) => {
      const body = dkimBodies[index]!
      // Follow CNAME chain answers: keep TXT payloads (and any CNAME target for display)
      const txt = answerData(body, DOH_TYPE.TXT).map(unwrapTxt)
      const cnames = answerData(body, DOH_TYPE.CNAME)
      const records = txt.length
        ? txt
        : cnames.map((c) => `CNAME ${c}`)
      return { selector, records, status: body.Status }
    }).filter((d) => d.records.length > 0)

    const mx = answerData(mxBody, DOH_TYPE.MX)
    // Some resolvers omit type filter edge cases — fall back to all answers for MX
    const mxRecords = mx.length ? mx : answerData(mxBody)
    const txt = answerData(txtBody, DOH_TYPE.TXT)
    const txtRecords = txt.length ? txt : answerData(txtBody)

    const checks = evaluateEmailDns({
      domain,
      mx: mxRecords,
      txt: txtRecords,
      dmarcTxt: answerData(dmarcBody, DOH_TYPE.TXT).length
        ? answerData(dmarcBody, DOH_TYPE.TXT)
        : answerData(dmarcBody),
      dkim: dkim.map(({ selector, records }) => ({ selector, records })),
      mtaStsTxt: answerData(mtaStsBody, DOH_TYPE.TXT).length
        ? answerData(mtaStsBody, DOH_TYPE.TXT)
        : answerData(mtaStsBody),
      tlsRptTxt: answerData(tlsRptBody, DOH_TYPE.TXT).length
        ? answerData(tlsRptBody, DOH_TYPE.TXT)
        : answerData(tlsRptBody),
      bimiTxt: answerData(bimiBody, DOH_TYPE.TXT).length
        ? answerData(bimiBody, DOH_TYPE.TXT)
        : answerData(bimiBody),
    })

    return {
      domain,
      resolver: 'cloudflare-dns.com',
      checks,
      summary: {
        pass: checks.filter((c) => c.status === 'pass').length,
        warn: checks.filter((c) => c.status === 'warn').length,
        fail: checks.filter((c) => c.status === 'fail').length,
        info: checks.filter((c) => c.status === 'info').length,
      },
    }
  })
