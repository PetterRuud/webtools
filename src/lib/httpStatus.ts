export type HttpStatusClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx'

export type HttpStatusCode = {
  code: number
  phrase: string
  class: HttpStatusClass
  meaning: string
}

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  { code: 100, phrase: 'Continue', class: '1xx', meaning: 'Request headers OK; continue with body.' },
  { code: 101, phrase: 'Switching Protocols', class: '1xx', meaning: 'Server is switching protocols as requested.' },
  { code: 102, phrase: 'Processing', class: '1xx', meaning: 'Request accepted; still processing (WebDAV).' },
  { code: 103, phrase: 'Early Hints', class: '1xx', meaning: 'Preliminary headers while full response prepares.' },

  { code: 200, phrase: 'OK', class: '2xx', meaning: 'Request succeeded.' },
  { code: 201, phrase: 'Created', class: '2xx', meaning: 'Resource created successfully.' },
  { code: 202, phrase: 'Accepted', class: '2xx', meaning: 'Accepted for processing; not finished yet.' },
  { code: 203, phrase: 'Non-Authoritative Information', class: '2xx', meaning: 'OK, but payload may be modified by a proxy.' },
  { code: 204, phrase: 'No Content', class: '2xx', meaning: 'Succeeded with an empty body.' },
  { code: 205, phrase: 'Reset Content', class: '2xx', meaning: 'Succeeded; client should reset the document view.' },
  { code: 206, phrase: 'Partial Content', class: '2xx', meaning: 'Partial range of the resource returned.' },
  { code: 207, phrase: 'Multi-Status', class: '2xx', meaning: 'Multiple status codes for different parts (WebDAV).' },
  { code: 208, phrase: 'Already Reported', class: '2xx', meaning: 'Members already enumerated (WebDAV).' },
  { code: 226, phrase: 'IM Used', class: '2xx', meaning: 'Response is a delta of instance manipulations.' },

  { code: 300, phrase: 'Multiple Choices', class: '3xx', meaning: 'Multiple options for the resource.' },
  { code: 301, phrase: 'Moved Permanently', class: '3xx', meaning: 'Permanent redirect; use the new URI.' },
  { code: 302, phrase: 'Found', class: '3xx', meaning: 'Temporary redirect; originally “Moved Temporarily”.' },
  { code: 303, phrase: 'See Other', class: '3xx', meaning: 'Get the result from another URI (usually GET).' },
  { code: 304, phrase: 'Not Modified', class: '3xx', meaning: 'Cached version is still valid.' },
  { code: 305, phrase: 'Use Proxy', class: '3xx', meaning: 'Deprecated; must access via the given proxy.' },
  { code: 307, phrase: 'Temporary Redirect', class: '3xx', meaning: 'Temporary redirect; keep the same method.' },
  { code: 308, phrase: 'Permanent Redirect', class: '3xx', meaning: 'Permanent redirect; keep the same method.' },

  { code: 400, phrase: 'Bad Request', class: '4xx', meaning: 'Malformed request or invalid parameters.' },
  { code: 401, phrase: 'Unauthorized', class: '4xx', meaning: 'Authentication required or failed.' },
  { code: 402, phrase: 'Payment Required', class: '4xx', meaning: 'Reserved for future use / payment gates.' },
  { code: 403, phrase: 'Forbidden', class: '4xx', meaning: 'Understood but refused (auth may be fine).' },
  { code: 404, phrase: 'Not Found', class: '4xx', meaning: 'No matching resource for this URI.' },
  { code: 405, phrase: 'Method Not Allowed', class: '4xx', meaning: 'HTTP method not allowed for this resource.' },
  { code: 406, phrase: 'Not Acceptable', class: '4xx', meaning: 'No representation matches Accept headers.' },
  { code: 407, phrase: 'Proxy Authentication Required', class: '4xx', meaning: 'Authenticate with the proxy first.' },
  { code: 408, phrase: 'Request Timeout', class: '4xx', meaning: 'Client took too long to send the request.' },
  { code: 409, phrase: 'Conflict', class: '4xx', meaning: 'Conflicts with current resource state.' },
  { code: 410, phrase: 'Gone', class: '4xx', meaning: 'Resource permanently removed.' },
  { code: 411, phrase: 'Length Required', class: '4xx', meaning: 'Content-Length header required.' },
  { code: 412, phrase: 'Precondition Failed', class: '4xx', meaning: 'One or more preconditions failed.' },
  { code: 413, phrase: 'Content Too Large', class: '4xx', meaning: 'Request body larger than the server allows.' },
  { code: 414, phrase: 'URI Too Long', class: '4xx', meaning: 'Request URI is too long.' },
  { code: 415, phrase: 'Unsupported Media Type', class: '4xx', meaning: 'Payload format is not supported.' },
  { code: 416, phrase: 'Range Not Satisfiable', class: '4xx', meaning: 'Requested range cannot be fulfilled.' },
  { code: 417, phrase: 'Expectation Failed', class: '4xx', meaning: 'Expectation in Expect header cannot be met.' },
  { code: 418, phrase: "I'm a teapot", class: '4xx', meaning: 'April Fools’ joke from HTCPCP; not an error to fix.' },
  { code: 421, phrase: 'Misdirected Request', class: '4xx', meaning: 'Sent to a server that cannot produce a response.' },
  { code: 422, phrase: 'Unprocessable Content', class: '4xx', meaning: 'Well-formed but semantically invalid.' },
  { code: 423, phrase: 'Locked', class: '4xx', meaning: 'Resource is locked (WebDAV).' },
  { code: 424, phrase: 'Failed Dependency', class: '4xx', meaning: 'Failed because of a previous request (WebDAV).' },
  { code: 425, phrase: 'Too Early', class: '4xx', meaning: 'Server unwilling to risk replay.' },
  { code: 426, phrase: 'Upgrade Required', class: '4xx', meaning: 'Client should switch protocols.' },
  { code: 428, phrase: 'Precondition Required', class: '4xx', meaning: 'Request must be conditional.' },
  { code: 429, phrase: 'Too Many Requests', class: '4xx', meaning: 'Rate limit exceeded.' },
  { code: 431, phrase: 'Request Header Fields Too Large', class: '4xx', meaning: 'Headers are too large.' },
  { code: 451, phrase: 'Unavailable For Legal Reasons', class: '4xx', meaning: 'Blocked for legal reasons.' },

  { code: 500, phrase: 'Internal Server Error', class: '5xx', meaning: 'Unexpected server failure.' },
  { code: 501, phrase: 'Not Implemented', class: '5xx', meaning: 'Server does not support this method/feature.' },
  { code: 502, phrase: 'Bad Gateway', class: '5xx', meaning: 'Invalid response from an upstream server.' },
  { code: 503, phrase: 'Service Unavailable', class: '5xx', meaning: 'Temporarily overloaded or under maintenance.' },
  { code: 504, phrase: 'Gateway Timeout', class: '5xx', meaning: 'Upstream server did not respond in time.' },
  { code: 505, phrase: 'HTTP Version Not Supported', class: '5xx', meaning: 'HTTP version in the request is unsupported.' },
  { code: 506, phrase: 'Variant Also Negotiates', class: '5xx', meaning: 'Content negotiation configuration error.' },
  { code: 507, phrase: 'Insufficient Storage', class: '5xx', meaning: 'Cannot store the representation (WebDAV).' },
  { code: 508, phrase: 'Loop Detected', class: '5xx', meaning: 'Infinite loop while processing (WebDAV).' },
  { code: 510, phrase: 'Not Extended', class: '5xx', meaning: 'Further extensions required for the request.' },
  { code: 511, phrase: 'Network Authentication Required', class: '5xx', meaning: 'Authenticate to gain network access.' },
]

export const HTTP_STATUS_CLASSES: Array<{ id: HttpStatusClass | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: '1xx', label: '1xx' },
  { id: '2xx', label: '2xx' },
  { id: '3xx', label: '3xx' },
  { id: '4xx', label: '4xx' },
  { id: '5xx', label: '5xx' },
]

export function filterHttpStatusCodes(
  codes: HttpStatusCode[],
  options: { query?: string; klass?: HttpStatusClass | 'all' } = {},
): HttpStatusCode[] {
  const klass = options.klass ?? 'all'
  const tokens = (options.query ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  return codes.filter((item) => {
    if (klass !== 'all' && item.class !== klass) return false
    if (tokens.length === 0) return true
    const haystack = `${item.code} ${item.phrase} ${item.meaning} ${item.class}`.toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
}
