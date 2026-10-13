export type RegexFlagId = "g" | "i" | "m" | "s" | "u";

export type CommonRegexPattern = {
  id: string;
  label: string;
  description: string;
  pattern: string;
  flags: RegexFlagId[];
  sample: string;
};

/** Curated presets — practical starters, not exhaustive validators. */
export const COMMON_REGEX_PATTERNS: CommonRegexPattern[] = [
  {
    id: "email",
    label: "Email",
    description: "Simple email shape for demos and quick checks",
    pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+",
    flags: ["g", "i"],
    sample: "Reach us at hello@webtools.dev or support@example.com — not an email: hello@",
  },
  {
    id: "url",
    label: "URL",
    description: "http(s) URLs with optional path/query",
    pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*",
    flags: ["g", "i"],
    sample: "Docs: https://example.com/docs?q=regex and http://localhost:43127/tools/regex",
  },
  {
    id: "ipv4",
    label: "IPv4",
    description: "Dotted IPv4 addresses (0–255 per octet)",
    pattern:
      "\\b(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\b",
    flags: ["g"],
    sample: "Gateway 192.168.1.1 · DNS 8.8.8.8 · invalid 999.1.1.1",
  },
  {
    id: "phone",
    label: "Phone",
    description: "Loose phone-ish numbers with optional country code",
    pattern: "(?:\\+?\\d{1,3}[\\s.-]?)?(?:\\(\\d{3}\\)|\\d{3})[\\s.-]?\\d{3}[\\s.-]?\\d{4}",
    flags: ["g"],
    sample: "Call +1 (555) 123-4567 or 555.987.6543 today.",
  },
  {
    id: "hex-color",
    label: "Hex color",
    description: "CSS hex colors (#RGB, #RRGGBB, optional alpha)",
    pattern: "#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b",
    flags: ["g"],
    sample: "Theme accents: #0f766e, #F59E0B, #fff, and #11223380.",
  },
  {
    id: "iso-date",
    label: "ISO date",
    description: "YYYY-MM-DD dates",
    pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b",
    flags: ["g"],
    sample: "Shipped 2026-10-04; draft was 2026-09-30; not a date: 26-10-04.",
  },
  {
    id: "uuid",
    label: "UUID",
    description: "Versioned UUID (8-4-4-4-12 hex)",
    pattern:
      "\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\b",
    flags: ["g", "i"],
    sample: "id=550e8400-e29b-41d4-a716-446655440000 · bad=550e8400-e29b-61d4-a716-446655440000",
  },
  {
    id: "html-tag",
    label: "HTML tag",
    description: "Opening/closing HTML-ish tags",
    pattern: "<\\/?[a-zA-Z][\\w:-]*(?:\\s[^>]*)?>",
    flags: ["g"],
    sample: '<div class="card">Hello</div> and <img src="x.png" />',
  },
  {
    id: "slug",
    label: "Slug",
    description: "URL-safe lowercase slugs",
    pattern: "\\b[a-z0-9]+(?:-[a-z0-9]+)*\\b",
    flags: ["g"],
    sample: "Routes: regex-editor, hex-rgba, and Not_A_Slug.",
  },
];
