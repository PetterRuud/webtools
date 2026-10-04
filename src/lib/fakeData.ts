import { randomInt, randomPick, randomUuid } from '#/lib/random'

export type FakeFieldType =
  | 'uuid'
  | 'boolean'
  | 'integer'
  | 'float'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'username'
  | 'email'
  | 'phone'
  | 'street'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'address'
  | 'company'
  | 'jobTitle'
  | 'department'
  | 'url'
  | 'ipv4'
  | 'slug'
  | 'hexColor'
  | 'price'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'word'
  | 'sentence'
  | 'paragraph'

export type FakeField = {
  id: string
  name: string
  type: FakeFieldType
}

export type FakeOutputFormat = 'json' | 'csv' | 'sql' | 'xml'

export type FakeFieldGroup = {
  label: string
  types: Array<{ id: FakeFieldType; label: string }>
}

export const FAKE_FIELD_GROUPS: FakeFieldGroup[] = [
  {
    label: 'Person',
    types: [
      { id: 'firstName', label: 'First name' },
      { id: 'lastName', label: 'Last name' },
      { id: 'fullName', label: 'Full name' },
      { id: 'username', label: 'Username' },
      { id: 'email', label: 'Email' },
      { id: 'phone', label: 'Phone' },
    ],
  },
  {
    label: 'Location',
    types: [
      { id: 'street', label: 'Street' },
      { id: 'city', label: 'City' },
      { id: 'state', label: 'State' },
      { id: 'zip', label: 'ZIP' },
      { id: 'country', label: 'Country' },
      { id: 'address', label: 'Address' },
    ],
  },
  {
    label: 'Business',
    types: [
      { id: 'company', label: 'Company' },
      { id: 'jobTitle', label: 'Job title' },
      { id: 'department', label: 'Department' },
    ],
  },
  {
    label: 'Tech',
    types: [
      { id: 'uuid', label: 'UUID' },
      { id: 'url', label: 'URL' },
      { id: 'ipv4', label: 'IPv4' },
      { id: 'slug', label: 'Slug' },
      { id: 'hexColor', label: 'Hex color' },
    ],
  },
  {
    label: 'Finance',
    types: [
      { id: 'price', label: 'Price' },
      { id: 'currency', label: 'Currency' },
    ],
  },
  {
    label: 'Primitive',
    types: [
      { id: 'boolean', label: 'Boolean' },
      { id: 'integer', label: 'Integer' },
      { id: 'float', label: 'Float' },
      { id: 'date', label: 'Date' },
      { id: 'datetime', label: 'DateTime' },
    ],
  },
  {
    label: 'Text',
    types: [
      { id: 'word', label: 'Word' },
      { id: 'sentence', label: 'Sentence' },
      { id: 'paragraph', label: 'Paragraph' },
    ],
  },
]

export const ALL_FAKE_FIELD_TYPES: FakeFieldType[] =
  FAKE_FIELD_GROUPS.flatMap((group) => group.types.map((t) => t.id))

const FIRST_NAMES = [
  'Ava',
  'Noah',
  'Mia',
  'Liam',
  'Zoe',
  'Ethan',
  'Luna',
  'Owen',
  'Ivy',
  'Caleb',
  'Nora',
  'Mason',
  'Ruby',
  'Leo',
  'Chloe',
  'Henry',
  'Ella',
  'Jack',
  'Grace',
  'Theo',
  'Sofia',
  'Felix',
  'Iris',
  'Hugo',
  'Clara',
  'Jonas',
  'Freya',
  'Erik',
  'Amelia',
  'Soren',
]

const LAST_NAMES = [
  'Baker',
  'Chen',
  'Diaz',
  'Ellis',
  'Foster',
  'Garcia',
  'Hayes',
  'Ito',
  'Jensen',
  'Khan',
  'Lopez',
  'Martin',
  'Nguyen',
  'Ortiz',
  'Patel',
  'Quinn',
  'Reed',
  'Singh',
  'Turner',
  'Vega',
  'Walsh',
  'Xu',
  'Young',
  'Zimmer',
  'Berg',
  'Costa',
  'Dubois',
  'Eriksson',
  'Fischer',
  'Hansen',
]

const STREET_NAMES = [
  'Oak',
  'Maple',
  'Cedar',
  'Pine',
  'Willow',
  'Birch',
  'Harbor',
  'Summit',
  'Ridge',
  'Valley',
  'Lake',
  'River',
  'Market',
  'Chapel',
  'Park',
  'Garden',
  'Hill',
  'Bridge',
  'Station',
  'Library',
]

const STREET_SUFFIXES = [
  'St',
  'Ave',
  'Rd',
  'Blvd',
  'Ln',
  'Dr',
  'Way',
  'Ct',
  'Pl',
  'Ter',
]

const CITIES = [
  'Austin',
  'Berlin',
  'Boulder',
  'Bristol',
  'Calgary',
  'Denver',
  'Dublin',
  'Helsinki',
  'Lisbon',
  'Lyon',
  'Madrid',
  'Oslo',
  'Portland',
  'Prague',
  'Seattle',
  'Stockholm',
  'Toronto',
  'Utrecht',
  'Vienna',
  'Zurich',
]

const STATES = [
  'AL',
  'AK',
  'AZ',
  'CA',
  'CO',
  'FL',
  'GA',
  'IL',
  'MA',
  'MI',
  'MN',
  'NC',
  'NY',
  'OR',
  'PA',
  'TX',
  'UT',
  'VA',
  'WA',
  'WI',
]

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Norway',
  'Sweden',
  'Denmark',
  'Netherlands',
  'Portugal',
  'Ireland',
  'Japan',
  'Australia',
  'New Zealand',
  'Brazil',
  'Mexico',
  'India',
  'Singapore',
]

const COMPANIES = [
  'Northwind Labs',
  'Cedar & Co',
  'Bright Harbor',
  'Pixel Forge',
  'Lumen Works',
  'Atlas Grove',
  'Copperline',
  'Soft Current',
  'Fieldnote',
  'Grayline Systems',
  'Orbit Desk',
  'Helio Stack',
  'Maple Metric',
  'Quiet Signal',
  'Riverbend Soft',
  'Tidal Logic',
  'Summit Bits',
  'Paperkite',
  'Cobalt Nest',
  'True North App',
]

const JOB_TITLES = [
  'Engineer',
  'Designer',
  'Product Manager',
  'Analyst',
  'Researcher',
  'Support Lead',
  'Ops Specialist',
  'Data Scientist',
  'Frontend Dev',
  'Backend Dev',
  'QA Engineer',
  'Tech Writer',
  'SRE',
  'Marketing Lead',
  'Sales Associate',
  'Founder',
  'Intern',
  'Consultant',
  'Architect',
  'Coordinator',
]

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Support',
  'Finance',
  'People',
  'Operations',
  'Research',
  'Legal',
  'Security',
]

const EMAIL_DOMAINS = [
  'example.com',
  'mail.test',
  'demo.dev',
  'sample.org',
  'inbox.local',
  'fake.email',
]

const WORDS = [
  'alpha',
  'amber',
  'anchor',
  'arc',
  'basin',
  'beacon',
  'breeze',
  'canvas',
  'cedar',
  'circuit',
  'cloud',
  'copper',
  'current',
  'delta',
  'ember',
  'field',
  'flint',
  'forge',
  'glacier',
  'harbor',
  'horizon',
  'indigo',
  'ivory',
  'kernel',
  'lattice',
  'ledger',
  'lumen',
  'maple',
  'mirror',
  'nebula',
  'orbit',
  'pebble',
  'pixel',
  'plume',
  'quartz',
  'ridge',
  'river',
  'signal',
  'slate',
  'spark',
  'summit',
  'tide',
  'timber',
  'vector',
  'velvet',
  'volt',
  'willow',
  'zenith',
]

const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'NOK',
  'SEK',
  'DKK',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
]

export const DEFAULT_FAKE_FIELDS: FakeField[] = [
  { id: 'f1', name: 'id', type: 'uuid' },
  { id: 'f2', name: 'firstName', type: 'firstName' },
  { id: 'f3', name: 'lastName', type: 'lastName' },
  { id: 'f4', name: 'email', type: 'email' },
  { id: 'f5', name: 'phone', type: 'phone' },
  { id: 'f6', name: 'city', type: 'city' },
  { id: 'f7', name: 'company', type: 'company' },
]

export const MIN_FAKE_ROWS = 1
export const MAX_FAKE_ROWS = 1000

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function randomDateParts(options?: { withTime?: boolean }): string {
  const year = randomInt(2018, 2026)
  const month = randomInt(1, 12)
  const day = randomInt(1, 28)
  if (!options?.withTime) {
    return `${year}-${pad2(month)}-${pad2(day)}`
  }
  const hour = randomInt(0, 23)
  const minute = randomInt(0, 59)
  const second = randomInt(0, 59)
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}Z`
}

function firstName(): string {
  return randomPick(FIRST_NAMES)
}

function lastName(): string {
  return randomPick(LAST_NAMES)
}

function usernameFrom(first: string, last: string): string {
  const styles = [
    () => `${first.toLowerCase()}.${last.toLowerCase()}`,
    () => `${first.toLowerCase()}${randomInt(10, 99)}`,
    () => `${first.slice(0, 1).toLowerCase()}${last.toLowerCase()}`,
    () => `${last.toLowerCase()}_${randomInt(1, 999)}`,
  ] as const
  return randomPick(styles)()
}

function street(): string {
  return `${randomInt(10, 9999)} ${randomPick(STREET_NAMES)} ${randomPick(STREET_SUFFIXES)}`
}

function sentence(): string {
  const count = randomInt(6, 12)
  const words = Array.from({ length: count }, () => randomPick(WORDS))
  words[0] = words[0]!.charAt(0).toUpperCase() + words[0]!.slice(1)
  return `${words.join(' ')}.`
}

function paragraph(): string {
  return Array.from({ length: randomInt(2, 4) }, () => sentence()).join(' ')
}

export function fieldTypeLabel(type: FakeFieldType): string {
  for (const group of FAKE_FIELD_GROUPS) {
    const match = group.types.find((entry) => entry.id === type)
    if (match) return match.label
  }
  return type
}

export function createFieldId(): string {
  return `f_${randomUuid().slice(0, 8)}`
}

export function generateFakeValue(type: FakeFieldType): string | number | boolean {
  switch (type) {
    case 'uuid':
      return randomUuid()
    case 'boolean':
      return randomInt(0, 1) === 1
    case 'integer':
      return randomInt(0, 10_000)
    case 'float':
      return Number((randomInt(0, 100_000) / 100).toFixed(2))
    case 'firstName':
      return firstName()
    case 'lastName':
      return lastName()
    case 'fullName':
      return `${firstName()} ${lastName()}`
    case 'username': {
      const first = firstName()
      const last = lastName()
      return usernameFrom(first, last)
    }
    case 'email': {
      const first = firstName()
      const last = lastName()
      const local = usernameFrom(first, last).replace(/[^a-z0-9._-]/gi, '')
      return `${local}@${randomPick(EMAIL_DOMAINS)}`
    }
    case 'phone':
      return `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`
    case 'street':
      return street()
    case 'city':
      return randomPick(CITIES)
    case 'state':
      return randomPick(STATES)
    case 'zip':
      return String(randomInt(10000, 99999))
    case 'country':
      return randomPick(COUNTRIES)
    case 'address':
      return `${street()}, ${randomPick(CITIES)}, ${randomPick(STATES)} ${randomInt(10000, 99999)}`
    case 'company':
      return randomPick(COMPANIES)
    case 'jobTitle':
      return randomPick(JOB_TITLES)
    case 'department':
      return randomPick(DEPARTMENTS)
    case 'url': {
      const host = slugify(randomPick(COMPANIES)).replace(/-/g, '')
      const path = randomPick(WORDS)
      return `https://www.${host}.example/${path}`
    }
    case 'ipv4':
      return `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`
    case 'slug':
      return `${randomPick(WORDS)}-${randomPick(WORDS)}-${randomInt(1, 99)}`
    case 'hexColor': {
      const n = randomInt(0, 0xffffff)
      return `#${n.toString(16).padStart(6, '0')}`
    }
    case 'price':
      return Number((randomInt(199, 99999) / 100).toFixed(2))
    case 'currency':
      return randomPick(CURRENCIES)
    case 'date':
      return randomDateParts()
    case 'datetime':
      return randomDateParts({ withTime: true })
    case 'word':
      return randomPick(WORDS)
    case 'sentence':
      return sentence()
    case 'paragraph':
      return paragraph()
    default: {
      const _exhaustive: never = type
      return _exhaustive
    }
  }
}

export function normalizeFields(fields: FakeField[]): FakeField[] {
  const used = new Map<string, number>()
  return fields.map((field, index) => {
    const base = field.name.trim() || `field_${index + 1}`
    const safe = base.replace(/[^\w.-]+/g, '_').replace(/^(\d)/, '_$1')
    const count = used.get(safe) ?? 0
    used.set(safe, count + 1)
    const name = count === 0 ? safe : `${safe}_${count + 1}`
    return { ...field, name }
  })
}

export function generateFakeRows(
  fields: FakeField[],
  count: number,
): Array<Record<string, string | number | boolean>> {
  const normalized = normalizeFields(fields)
  if (normalized.length === 0) {
    throw new Error('Add at least one field.')
  }
  const rows = Math.min(MAX_FAKE_ROWS, Math.max(MIN_FAKE_ROWS, Math.floor(count)))
  return Array.from({ length: rows }, () => {
    const row: Record<string, string | number | boolean> = {}
    for (const field of normalized) {
      row[field.name] = generateFakeValue(field.type)
    }
    return row
  })
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function valueToCsvCell(value: string | number | boolean): string {
  if (typeof value === 'string') return escapeCsvCell(value)
  return String(value)
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function sqlLiteral(value: string | number | boolean): string {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  return `'${value.replace(/'/g, "''")}'`
}

function sqlIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

export function formatFakeRows(
  rows: Array<Record<string, string | number | boolean>>,
  format: FakeOutputFormat,
  options: { tableName?: string } = {},
): string {
  if (rows.length === 0) return ''
  const keys = Object.keys(rows[0]!)

  if (format === 'json') {
    return `${JSON.stringify(rows, null, 2)}\n`
  }

  if (format === 'csv') {
    const lines = [
      keys.map(escapeCsvCell).join(','),
      ...rows.map((row) => keys.map((key) => valueToCsvCell(row[key]!)).join(',')),
    ]
    return `${lines.join('\n')}\n`
  }

  if (format === 'sql') {
    const table = (options.tableName?.trim() || 'records').replace(
      /[^\w]+/g,
      '_',
    )
    const cols = keys.map(sqlIdent).join(', ')
    return `${rows
      .map((row) => {
        const values = keys.map((key) => sqlLiteral(row[key]!)).join(', ')
        return `INSERT INTO ${table} (${cols}) VALUES (${values});`
      })
      .join('\n')}\n`
  }

  // xml
  const body = rows
    .map((row) => {
      const fields = keys
        .map((key) => {
          const value = row[key]!
          const text =
            typeof value === 'string' ? escapeXml(value) : String(value)
          return `    <${key}>${text}</${key}>`
        })
        .join('\n')
      return `  <record>\n${fields}\n  </record>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<records>\n${body}\n</records>\n`
}

export function fakeOutputFilename(format: FakeOutputFormat): string {
  switch (format) {
    case 'json':
      return 'fake-data.json'
    case 'csv':
      return 'fake-data.csv'
    case 'sql':
      return 'fake-data.sql'
    case 'xml':
      return 'fake-data.xml'
  }
}

export function fakeOutputMime(format: FakeOutputFormat): string {
  switch (format) {
    case 'json':
      return 'application/json;charset=utf-8'
    case 'csv':
      return 'text/csv;charset=utf-8'
    case 'sql':
      return 'application/sql;charset=utf-8'
    case 'xml':
      return 'application/xml;charset=utf-8'
  }
}

export function downloadFakeOutput(
  content: string,
  format: FakeOutputFormat,
): void {
  const blob = new Blob([content], { type: fakeOutputMime(format) })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fakeOutputFilename(format)
  anchor.click()
  URL.revokeObjectURL(url)
}

export function defaultNameForType(type: FakeFieldType): string {
  return type
}
