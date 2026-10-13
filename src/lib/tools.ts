export type ToolCategoryId = "text" | "image" | "color" | "encode" | "network" | "seo";

export type ToolCategory = {
  id: ToolCategoryId;
  label: string;
};

export type ToolLink = {
  to:
    | "/tools/hex-rgba"
    | "/tools/flexbox"
    | "/tools/box-shadow"
    | "/tools/css-grid"
    | "/tools/image-compress"
    | "/tools/image-crop"
    | "/tools/image-resize"
    | "/tools/image-format"
    | "/tools/image-square"
    | "/tools/app-icon"
    | "/tools/svg-editor"
    | "/tools/nine-slice"
    | "/tools/transparent"
    | "/tools/json-formatter"
    | "/tools/csv-json"
    | "/tools/regex"
    | "/tools/base64"
    | "/tools/qrcode"
    | "/tools/text-diff"
    | "/tools/text-cleaner"
    | "/tools/random"
    | "/tools/markdown"
    | "/tools/code-screenshot"
    | "/tools/ip-lookup"
    | "/tools/dns-lookup"
    | "/tools/browser-info"
    | "/tools/http-status"
    | "/tools/mime"
    | "/tools/jwt"
    | "/tools/crontab"
    | "/tools/tailwind-cheat-sheet"
    | "/tools/git-commands"
    | "/tools/xml-json"
    | "/tools/tip-calculator"
    | "/tools/sitemap"
    | "/tools/ts-interface"
    | "/tools/website-screenshot"
    | "/tools/crawler-simulator"
    | "/tools/serp-preview"
    | "/tools/og-preview"
    | "/tools/robots-txt"
    | "/tools/utm-builder"
    | "/tools/redirect-checker"
    | "/tools/broken-link-checker"
    | "/tools/seo-audit";
  name: string;
  shortName: string;
  blurb: string;
  category: ToolCategoryId;
  keywords: string[];
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: "text", label: "Text" },
  { id: "image", label: "Images" },
  { id: "color", label: "Color / CSS / Layout" },
  { id: "encode", label: "Encode" },
  { id: "network", label: "Network" },
  { id: "seo", label: "SEO" },
];

export const TOOLS: ToolLink[] = [
  {
    to: "/tools/json-formatter",
    name: "JSON formatter",
    shortName: "JSON",
    blurb: "Pretty-print, minify, validate.",
    category: "text",
    keywords: ["json", "pretty", "minify", "validate", "format"],
  },
  {
    to: "/tools/csv-json",
    name: "CSV ↔ JSON",
    shortName: "CSV/JSON",
    blurb: "Convert either way.",
    category: "text",
    keywords: ["csv", "json", "convert", "delimiter", "spreadsheet", "table"],
  },
  {
    to: "/tools/regex",
    name: "Regex editor",
    shortName: "Regex",
    blurb: "Pattern, flags, matches, breakdown.",
    category: "text",
    keywords: ["regex", "regexp", "pattern", "match", "test"],
  },
  {
    to: "/tools/text-diff",
    name: "Text diff",
    shortName: "Diff",
    blurb: "Side-by-side or unified line diff.",
    category: "text",
    keywords: ["diff", "compare", "delta", "changes", "patch"],
  },
  {
    to: "/tools/text-cleaner",
    name: "Text cleaner",
    shortName: "Clean",
    blurb: "Trim, spaces, HTML, quotes.",
    category: "text",
    keywords: [
      "clean",
      "trim",
      "whitespace",
      "spaces",
      "blank",
      "html",
      "quotes",
      "normalize",
      "sanitize",
    ],
  },
  {
    to: "/tools/markdown",
    name: "Markdown",
    shortName: "MD",
    blurb: "Edit, live preview, HTML export.",
    category: "text",
    keywords: ["markdown", "md", "preview", "gfm", "readme", "html", "editor", "render"],
  },
  {
    to: "/tools/random",
    name: "Random",
    shortName: "Random",
    blurb: "Numbers, UUID, coin, dice, D&D, roulette.",
    category: "text",
    keywords: [
      "random",
      "number",
      "string",
      "uuid",
      "password",
      "coin",
      "dice",
      "dnd",
      "dungeons",
      "dragons",
      "advantage",
      "shuffle",
      "pick",
      "roulette",
      "wheel",
      "generator",
      "decision",
    ],
  },
  {
    to: "/tools/tip-calculator",
    name: "Tip calculator",
    shortName: "Tip",
    blurb: "Bill, tip %, split per person.",
    category: "text",
    keywords: ["tip", "calculator", "bill", "split", "gratuity", "percent", "restaurant", "money"],
  },
  {
    to: "/tools/xml-json",
    name: "XML ↔ JSON",
    shortName: "XML/JSON",
    blurb: "Bidirectional convert. Local.",
    category: "text",
    keywords: ["xml", "json", "convert", "parse", "serialize", "text"],
  },
  {
    to: "/tools/ts-interface",
    name: "TS interface",
    shortName: "TS iface",
    blurb: "JSON → interfaces / types.",
    category: "text",
    keywords: [
      "typescript",
      "ts",
      "interface",
      "type",
      "json",
      "generate",
      "codegen",
      "types",
      "dto",
    ],
  },
  {
    to: "/tools/code-screenshot",
    name: "Code screenshot",
    shortName: "Code shot",
    blurb: "Themed window → PNG.",
    category: "text",
    keywords: [
      "code",
      "screenshot",
      "syntax",
      "highlight",
      "theme",
      "png",
      "carbon",
      "snippet",
      "image",
      "export",
    ],
  },
  {
    to: "/tools/git-commands",
    name: "Git commands",
    shortName: "Git",
    blurb: "Clever git: forensics, undo, stash, bisect…",
    category: "text",
    keywords: [
      "git",
      "log",
      "shortlog",
      "churn",
      "authors",
      "bugs",
      "hotfix",
      "revert",
      "velocity",
      "reflog",
      "stash",
      "bisect",
      "worktree",
      "fixup",
      "rebase",
      "cheat sheet",
      "commands",
      "cli",
    ],
  },
  {
    to: "/tools/image-compress",
    name: "Image compress",
    shortName: "Compress",
    blurb: "Scale, quality, download.",
    category: "image",
    keywords: ["image", "compress", "jpg", "jpeg", "png", "webp", "quality", "scale", "size"],
  },
  {
    to: "/tools/image-crop",
    name: "Image crop",
    shortName: "Crop",
    blurb: "Visual crop + aspect presets.",
    category: "image",
    keywords: ["image", "crop", "slice", "aspect", "trim", "cut", "frame"],
  },
  {
    to: "/tools/image-resize",
    name: "Image resize",
    shortName: "Resize",
    blurb: "Width, height, lock aspect.",
    category: "image",
    keywords: [
      "image",
      "resize",
      "scale",
      "width",
      "height",
      "dimensions",
      "pixels",
      "aspect",
      "png",
      "jpeg",
      "webp",
    ],
  },
  {
    to: "/tools/image-format",
    name: "Image format",
    shortName: "Format",
    blurb: "HEIC → JPG/PNG/WebP · PNG ↔ JPEG ↔ WebP.",
    category: "image",
    keywords: [
      "image",
      "convert",
      "png",
      "jpeg",
      "jpg",
      "webp",
      "heic",
      "heif",
      "iphone",
      "format",
    ],
  },
  {
    to: "/tools/image-square",
    name: "Square & round",
    shortName: "Square",
    blurb: "Pad to square + rounded corners.",
    category: "image",
    keywords: [
      "image",
      "square",
      "pad",
      "padding",
      "round",
      "rounded",
      "corners",
      "border-radius",
      "radius",
      "png",
      "avatar",
      "icon",
    ],
  },
  {
    to: "/tools/app-icon",
    name: "App icon & manifest",
    shortName: "App icon",
    blurb: "Favicon, PWA icons, site.webmanifest.",
    category: "image",
    keywords: [
      "favicon",
      "icon",
      "ico",
      "apple-touch",
      "pwa",
      "manifest",
      "lucide",
      "svg",
      "gradient",
      "png",
      "image",
      "app",
    ],
  },
  {
    to: "/tools/svg-editor",
    name: "SVG editor",
    shortName: "SVG",
    blurb: "Source, preview, minify, export.",
    category: "image",
    keywords: ["svg", "vector", "minify", "prettify", "viewbox", "xml", "icon", "png"],
  },
  {
    to: "/tools/nine-slice",
    name: "9-slicer",
    shortName: "9-slice",
    blurb: "Guides, preview, border-image CSS.",
    category: "image",
    keywords: [
      "nine",
      "9-slice",
      "9slice",
      "slice",
      "border-image",
      "ui",
      "scale",
      "tile",
      "stretch",
      "image",
    ],
  },
  {
    to: "/tools/transparent",
    name: "Transparent",
    shortName: "Alpha",
    blurb: "White+black pair → PNG alpha (Node/sharp).",
    category: "image",
    keywords: [
      "transparent",
      "alpha",
      "png",
      "sharp",
      "white",
      "black",
      "background",
      "matte",
      "image",
      "node",
    ],
  },
  {
    to: "/tools/hex-rgba",
    name: "CSS Color",
    shortName: "Color",
    blurb: "Hex, rgba, hsl, hwb, oklch.",
    category: "color",
    keywords: ["color", "hex", "rgba", "hsl", "hwb", "oklch", "css"],
  },
  {
    to: "/tools/flexbox",
    name: "Flexbox",
    shortName: "Flex",
    blurb: "Direction, wrap, justify, align, gap.",
    category: "color",
    keywords: ["flexbox", "flex", "css", "layout", "justify", "align", "gap", "wrap"],
  },
  {
    to: "/tools/box-shadow",
    name: "Box shadow",
    shortName: "Shadow",
    blurb: "Offset, blur, spread, color, inset.",
    category: "color",
    keywords: ["box-shadow", "shadow", "css", "blur", "spread", "inset", "offset"],
  },
  {
    to: "/tools/css-grid",
    name: "CSS Grid",
    shortName: "Grid",
    blurb: "Columns, rows, gaps, areas.",
    category: "color",
    keywords: ["css", "grid", "layout", "columns", "rows", "gap", "template", "areas", "fr"],
  },
  {
    to: "/tools/tailwind-cheat-sheet",
    name: "Tailwind cheat sheet",
    shortName: "Tailwind",
    blurb: "Searchable utility reference.",
    category: "color",
    keywords: [
      "tailwind",
      "css",
      "utility",
      "cheat sheet",
      "flex",
      "grid",
      "spacing",
      "layout",
      "typography",
      "colors",
    ],
  },
  {
    to: "/tools/base64",
    name: "Base64",
    shortName: "Base64",
    blurb: "UTF-8 encode / decode.",
    category: "encode",
    keywords: ["base64", "encode", "decode", "utf-8", "b64"],
  },
  {
    to: "/tools/qrcode",
    name: "QR code",
    shortName: "QR",
    blurb: "Text/URL → PNG. Size, ECC.",
    category: "encode",
    keywords: ["qr", "qrcode", "qr code", "barcode", "encode", "url", "png", "scan"],
  },
  {
    to: "/tools/jwt",
    name: "JWT",
    shortName: "JWT",
    blurb: "Decode / encode. Secrets stay local.",
    category: "encode",
    keywords: ["jwt", "token", "encode", "decode", "hs256", "json web token"],
  },
  {
    to: "/tools/xml-json",
    name: "XML ↔ JSON",
    shortName: "XML/JSON",
    blurb: "Bidirectional convert. Local.",
    category: "encode",
    keywords: ["xml", "json", "convert", "encode", "decode", "transform"],
  },
  {
    to: "/tools/ip-lookup",
    name: "IP lookup",
    shortName: "IP",
    blurb: "Your IP or any address.",
    category: "network",
    keywords: ["ip", "lookup", "geo", "asn", "network", "address", "web", "http", "browser"],
  },
  {
    to: "/tools/dns-lookup",
    name: "DNS lookup",
    shortName: "DNS",
    blurb: "Records + email MX/SPF/DKIM/DMARC.",
    category: "network",
    keywords: [
      "dns",
      "lookup",
      "doh",
      "a",
      "aaaa",
      "mx",
      "txt",
      "cname",
      "ns",
      "spf",
      "dkim",
      "dmarc",
      "email",
      "deliverability",
      "bimi",
      "mta-sts",
      "network",
      "web",
      "http",
      "browser",
    ],
  },
  {
    to: "/tools/browser-info",
    name: "Browser info",
    shortName: "Browser",
    blurb: "UA, viewport, storage flags.",
    category: "network",
    keywords: [
      "browser",
      "user agent",
      "viewport",
      "cookies",
      "localStorage",
      "navigator",
      "device",
      "web",
      "http",
      "network",
    ],
  },
  {
    to: "/tools/http-status",
    name: "HTTP status",
    shortName: "Status",
    blurb: "Searchable status codes.",
    category: "network",
    keywords: ["http", "status", "code", "404", "500", "response", "web", "browser", "network"],
  },
  {
    to: "/tools/mime",
    name: "MIME types",
    shortName: "MIME",
    blurb: "Extension ↔ Content-Type.",
    category: "network",
    keywords: [
      "mime",
      "content-type",
      "content type",
      "extension",
      "media type",
      "mimetype",
      "file type",
      "http",
      "web",
      "browser",
      "network",
    ],
  },
  {
    to: "/tools/website-screenshot",
    name: "Website screenshot",
    shortName: "Web shot",
    blurb: "URL → PNG. Viewport or full page.",
    category: "network",
    keywords: [
      "screenshot",
      "website",
      "url",
      "capture",
      "png",
      "viewport",
      "full page",
      "browser",
      "render",
      "web",
      "network",
    ],
  },
  {
    to: "/tools/crontab",
    name: "Crontab builder",
    shortName: "Cron",
    blurb: "Build, decode, next runs.",
    category: "network",
    keywords: [
      "cron",
      "crontab",
      "schedule",
      "scheduler",
      "expression",
      "job",
      "timer",
      "interval",
      "web",
      "network",
    ],
  },
  {
    to: "/tools/sitemap",
    name: "Sitemap generator",
    shortName: "Sitemap",
    blurb: "URL list → sitemap.xml.",
    category: "seo",
    keywords: [
      "sitemap",
      "xml",
      "seo",
      "urls",
      "urlset",
      "lastmod",
      "changefreq",
      "priority",
      "robots",
      "web",
    ],
  },
  {
    to: "/tools/crawler-simulator",
    name: "Crawler simulator",
    shortName: "Crawler",
    blurb: "No-JS vs JS: title, meta, headings, OG, links.",
    category: "seo",
    keywords: [
      "crawler",
      "simulator",
      "bot",
      "spa",
      "seo",
      "no-js",
      "javascript",
      "ssr",
      "csr",
      "render",
      "compare",
      "html",
      "meta",
      "canonical",
      "robots",
      "og",
      "headings",
      "web",
    ],
  },
  {
    to: "/tools/serp-preview",
    name: "SERP preview",
    shortName: "SERP",
    blurb: "Google snippet: title, description, pixel width.",
    category: "seo",
    keywords: [
      "serp",
      "google",
      "snippet",
      "preview",
      "title",
      "meta",
      "description",
      "seo",
      "pixel",
      "web",
    ],
  },
  {
    to: "/tools/og-preview",
    name: "Open Graph preview",
    shortName: "OG",
    blurb: "Facebook / X / LinkedIn share cards from URL.",
    category: "seo",
    keywords: [
      "open graph",
      "og",
      "twitter",
      "facebook",
      "linkedin",
      "social",
      "share",
      "preview",
      "meta",
      "seo",
      "web",
    ],
  },
  {
    to: "/tools/robots-txt",
    name: "robots.txt tester",
    shortName: "robots.txt",
    blurb: "Fetch or paste; test allow/disallow paths.",
    category: "seo",
    keywords: [
      "robots",
      "robots.txt",
      "crawl",
      "allow",
      "disallow",
      "sitemap",
      "seo",
      "bot",
      "web",
    ],
  },
  {
    to: "/tools/utm-builder",
    name: "UTM builder",
    shortName: "UTM",
    blurb: "Campaign URLs with source, medium, campaign…",
    category: "seo",
    keywords: [
      "utm",
      "campaign",
      "source",
      "medium",
      "tracking",
      "analytics",
      "marketing",
      "url",
      "seo",
      "web",
    ],
  },
  {
    to: "/tools/redirect-checker",
    name: "Redirect checker",
    shortName: "Redirects",
    blurb: "Follow hops: status, timing, final URL.",
    category: "seo",
    keywords: [
      "redirect",
      "redirects",
      "301",
      "302",
      "308",
      "location",
      "chain",
      "hops",
      "seo",
      "http",
      "web",
    ],
  },
  {
    to: "/tools/broken-link-checker",
    name: "Broken link checker",
    shortName: "Broken links",
    blurb: "Scan page links; status + internal/external.",
    category: "seo",
    keywords: [
      "broken",
      "links",
      "404",
      "crawl",
      "internal",
      "external",
      "dead",
      "status",
      "seo",
      "web",
    ],
  },
  {
    to: "/tools/seo-audit",
    name: "SEO audit",
    shortName: "SEO audit",
    blurb: "Title, meta, headings, canonical, OG, alts…",
    category: "seo",
    keywords: [
      "seo",
      "audit",
      "title",
      "meta",
      "description",
      "canonical",
      "robots",
      "og",
      "headings",
      "alt",
      "on-page",
      "technical",
      "web",
    ],
  },
];

export function categoryLabel(id: ToolCategoryId): string {
  return TOOL_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function toolMatchesQuery(tool: ToolLink, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    tool.name,
    tool.shortName,
    tool.blurb,
    categoryLabel(tool.category),
    ...tool.keywords,
  ]
    .join(" ")
    .toLowerCase();

  return normalized.split(/\s+/).every((token) => haystack.includes(token));
}

export function filterTools(
  tools: ToolLink[],
  options: { query?: string; category?: ToolCategoryId | "all" } = {},
): ToolLink[] {
  const category = options.category ?? "all";
  const query = options.query ?? "";

  return tools.filter((tool) => {
    if (category !== "all" && tool.category !== category) return false;
    return toolMatchesQuery(tool, query);
  });
}

export function groupToolsByCategory(tools: ToolLink[]): Array<{
  category: ToolCategory;
  tools: ToolLink[];
}> {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category.id),
  })).filter((group) => group.tools.length > 0);
}
