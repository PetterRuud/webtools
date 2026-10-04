export type XmlJsonValue =
  | string
  | number
  | boolean
  | null
  | XmlJsonValue[]
  | { [key: string]: XmlJsonValue }

const ATTR_PREFIX = '@'
const TEXT_KEY = '#text'

function parserErrorMessage(doc: Document): string | null {
  const errorNode =
    doc.querySelector('parsererror') ??
    doc.getElementsByTagName('parsererror')[0]
  if (!errorNode) return null
  const text = errorNode.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  if (!text) return 'Invalid XML.'
  // Chromium: "error on line 1 at column 2: ..."
  const lineCol = text.match(/line\s+(\d+)\s+at\s+column\s+(\d+)/i)
  if (lineCol) {
    return `Invalid XML (line ${lineCol[1]}, column ${lineCol[2]}).`
  }
  // Firefox embeds a longer message; keep it short.
  const short = text.slice(0, 160)
  return short.length < text.length ? `${short}…` : short
}

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

function isText(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE
}

function collapseText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function elementToJson(el: Element): XmlJsonValue {
  const obj: Record<string, XmlJsonValue> = {}

  for (const attr of Array.from(el.attributes)) {
    obj[`${ATTR_PREFIX}${attr.name}`] = attr.value
  }

  const children = Array.from(el.childNodes)
  const elementChildren: Element[] = []
  const textParts: string[] = []
  for (const node of children) {
    if (isElement(node)) elementChildren.push(node)
    else if (isText(node)) textParts.push(node.nodeValue ?? '')
  }
  const text = collapseText(textParts.join(''))

  if (elementChildren.length === 0) {
    if (Object.keys(obj).length === 0) {
      return text
    }
    if (text) {
      obj[TEXT_KEY] = text
    }
    return obj
  }

  if (text) {
    obj[TEXT_KEY] = text
  }

  for (const child of elementChildren) {
    const key = child.tagName
    const value = elementToJson(child)
    const existing = obj[key]
    if (existing === undefined) {
      obj[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      obj[key] = [existing, value]
    }
  }

  return obj
}

/** Parse XML and return a JSON-serializable value (root tag as sole key). */
export function xmlToJson(xml: string): XmlJsonValue {
  const trimmed = xml.trim()
  if (!trimmed) {
    throw new Error('Paste XML first.')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(trimmed, 'application/xml')
  const parseError = parserErrorMessage(doc)
  if (parseError) {
    throw new Error(parseError)
  }

  const root = doc.documentElement
  if (!root) {
    throw new Error('Invalid XML: missing root element.')
  }

  return { [root.tagName]: elementToJson(root) }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function isPlainObject(value: unknown): value is Record<string, XmlJsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function valueToText(value: XmlJsonValue): string {
  if (value === null) return ''
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'string') return value
  throw new Error('Cannot serialize nested values as text content.')
}

function objectToXml(tag: string, value: XmlJsonValue, indent: number): string {
  const pad = '  '.repeat(indent)
  const childPad = '  '.repeat(indent + 1)

  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    const text = escapeXml(valueToText(value))
    return `${pad}<${tag}>${text}</${tag}>`
  }

  const attrs: string[] = []
  const children: Array<[string, XmlJsonValue]> = []
  let textContent = ''

  for (const [key, child] of Object.entries(value)) {
    if (key === TEXT_KEY) {
      textContent = valueToText(child)
      continue
    }
    if (key.startsWith(ATTR_PREFIX)) {
      const name = key.slice(ATTR_PREFIX.length)
      if (!name) {
        throw new Error('Attribute name after "@" cannot be empty.')
      }
      if (typeof child === 'object' && child !== null) {
        throw new Error(`Attribute "@${name}" must be a primitive.`)
      }
      attrs.push(` ${name}="${escapeXml(valueToText(child))}"`)
      continue
    }
    children.push([key, child])
  }

  const attrStr = attrs.join('')

  if (children.length === 0) {
    if (!textContent) {
      return `${pad}<${tag}${attrStr} />`
    }
    return `${pad}<${tag}${attrStr}>${escapeXml(textContent)}</${tag}>`
  }

  const lines: string[] = [`${pad}<${tag}${attrStr}>`]
  if (textContent) {
    lines.push(`${childPad}${escapeXml(textContent)}`)
  }
  for (const [childTag, childValue] of children) {
    if (Array.isArray(childValue)) {
      for (const item of childValue) {
        lines.push(objectToXml(childTag, item, indent + 1))
      }
    } else {
      lines.push(objectToXml(childTag, childValue, indent + 1))
    }
  }
  lines.push(`${pad}</${tag}>`)
  return lines.join('\n')
}

/**
 * Convert JSON to XML. Top-level must be a single-key object (root element),
 * or a primitive wrapped under `<root>`.
 */
export function jsonToXml(jsonText: string): string {
  const trimmed = jsonText.trim()
  if (!trimmed) {
    throw new Error('Paste JSON first.')
  }

  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON'
    throw new Error(`Invalid JSON: ${message}`)
  }

  if (Array.isArray(data)) {
    throw new Error('Top-level JSON array needs a root object, e.g. { "items": [...] }.')
  }

  if (!isPlainObject(data)) {
    return `<root>${escapeXml(valueToText(data as XmlJsonValue))}</root>`
  }

  const keys = Object.keys(data)
  if (keys.length === 0) {
    throw new Error('JSON object is empty — need a root element key.')
  }

  if (keys.length > 1) {
    throw new Error(
      `JSON needs a single root key (found ${keys.length}: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '…' : ''}).`,
    )
  }

  const rootKey = keys[0]!
  if (rootKey.startsWith(ATTR_PREFIX) || rootKey === TEXT_KEY) {
    throw new Error(`Root key cannot be "${rootKey}".`)
  }

  return objectToXml(rootKey, data[rootKey]!, 0)
}

export function stringifyJson(value: XmlJsonValue, pretty: boolean): string {
  return pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value)
}
