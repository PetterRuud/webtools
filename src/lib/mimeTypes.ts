export type MimeCategory =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "archive"
  | "font"
  | "code"
  | "app";

export type MimeEntry = {
  ext: string;
  mime: string;
  label: string;
  category: MimeCategory;
};

export const MIME_CATEGORIES: Array<{ id: MimeCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "image", label: "Image" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "document", label: "Doc" },
  { id: "archive", label: "Archive" },
  { id: "font", label: "Font" },
  { id: "code", label: "Code" },
  { id: "app", label: "App" },
];

/** Common extension ↔ MIME mappings for local lookup. */
export const MIME_ENTRIES: MimeEntry[] = [
  // Text
  { ext: "html", mime: "text/html", label: "HTML", category: "text" },
  { ext: "htm", mime: "text/html", label: "HTML", category: "text" },
  { ext: "css", mime: "text/css", label: "CSS", category: "text" },
  { ext: "txt", mime: "text/plain", label: "Plain text", category: "text" },
  { ext: "md", mime: "text/markdown", label: "Markdown", category: "text" },
  { ext: "markdown", mime: "text/markdown", label: "Markdown", category: "text" },
  { ext: "csv", mime: "text/csv", label: "CSV", category: "text" },
  { ext: "tsv", mime: "text/tab-separated-values", label: "TSV", category: "text" },
  { ext: "log", mime: "text/plain", label: "Log", category: "text" },
  { ext: "ini", mime: "text/plain", label: "INI", category: "text" },
  { ext: "conf", mime: "text/plain", label: "Config", category: "text" },
  { ext: "env", mime: "text/plain", label: "Env file", category: "text" },
  { ext: "rtf", mime: "application/rtf", label: "Rich text", category: "text" },
  { ext: "ics", mime: "text/calendar", label: "iCalendar", category: "text" },
  { ext: "vcard", mime: "text/vcard", label: "vCard", category: "text" },
  { ext: "vcf", mime: "text/vcard", label: "vCard", category: "text" },

  // Documents
  { ext: "pdf", mime: "application/pdf", label: "PDF", category: "document" },
  { ext: "doc", mime: "application/msword", label: "Word", category: "document" },
  {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word OOXML",
    category: "document",
  },
  { ext: "xls", mime: "application/vnd.ms-excel", label: "Excel", category: "document" },
  {
    ext: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "Excel OOXML",
    category: "document",
  },
  { ext: "ppt", mime: "application/vnd.ms-powerpoint", label: "PowerPoint", category: "document" },
  {
    ext: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PowerPoint OOXML",
    category: "document",
  },
  {
    ext: "odt",
    mime: "application/vnd.oasis.opendocument.text",
    label: "OpenDocument text",
    category: "document",
  },
  {
    ext: "ods",
    mime: "application/vnd.oasis.opendocument.spreadsheet",
    label: "OpenDocument sheet",
    category: "document",
  },
  {
    ext: "odp",
    mime: "application/vnd.oasis.opendocument.presentation",
    label: "OpenDocument slides",
    category: "document",
  },
  { ext: "epub", mime: "application/epub+zip", label: "EPUB", category: "document" },

  // Images
  { ext: "png", mime: "image/png", label: "PNG", category: "image" },
  { ext: "jpg", mime: "image/jpeg", label: "JPEG", category: "image" },
  { ext: "jpeg", mime: "image/jpeg", label: "JPEG", category: "image" },
  { ext: "gif", mime: "image/gif", label: "GIF", category: "image" },
  { ext: "webp", mime: "image/webp", label: "WebP", category: "image" },
  { ext: "avif", mime: "image/avif", label: "AVIF", category: "image" },
  { ext: "svg", mime: "image/svg+xml", label: "SVG", category: "image" },
  { ext: "ico", mime: "image/x-icon", label: "Icon", category: "image" },
  { ext: "bmp", mime: "image/bmp", label: "Bitmap", category: "image" },
  { ext: "tif", mime: "image/tiff", label: "TIFF", category: "image" },
  { ext: "tiff", mime: "image/tiff", label: "TIFF", category: "image" },
  { ext: "heic", mime: "image/heic", label: "HEIC", category: "image" },
  { ext: "heif", mime: "image/heif", label: "HEIF", category: "image" },
  { ext: "apng", mime: "image/apng", label: "APNG", category: "image" },
  { ext: "jxl", mime: "image/jxl", label: "JPEG XL", category: "image" },

  // Audio
  { ext: "mp3", mime: "audio/mpeg", label: "MP3", category: "audio" },
  { ext: "wav", mime: "audio/wav", label: "WAV", category: "audio" },
  { ext: "ogg", mime: "audio/ogg", label: "Ogg audio", category: "audio" },
  { ext: "oga", mime: "audio/ogg", label: "Ogg audio", category: "audio" },
  { ext: "flac", mime: "audio/flac", label: "FLAC", category: "audio" },
  { ext: "aac", mime: "audio/aac", label: "AAC", category: "audio" },
  { ext: "m4a", mime: "audio/mp4", label: "M4A", category: "audio" },
  { ext: "opus", mime: "audio/opus", label: "Opus", category: "audio" },
  { ext: "wma", mime: "audio/x-ms-wma", label: "WMA", category: "audio" },
  { ext: "mid", mime: "audio/midi", label: "MIDI", category: "audio" },
  { ext: "midi", mime: "audio/midi", label: "MIDI", category: "audio" },
  { ext: "weba", mime: "audio/webm", label: "WebM audio", category: "audio" },

  // Video
  { ext: "mp4", mime: "video/mp4", label: "MP4", category: "video" },
  { ext: "webm", mime: "video/webm", label: "WebM", category: "video" },
  { ext: "ogv", mime: "video/ogg", label: "Ogg video", category: "video" },
  { ext: "mov", mime: "video/quicktime", label: "QuickTime", category: "video" },
  { ext: "avi", mime: "video/x-msvideo", label: "AVI", category: "video" },
  { ext: "mkv", mime: "video/x-matroska", label: "Matroska", category: "video" },
  { ext: "m4v", mime: "video/x-m4v", label: "M4V", category: "video" },
  { ext: "flv", mime: "video/x-flv", label: "Flash video", category: "video" },
  { ext: "wmv", mime: "video/x-ms-wmv", label: "WMV", category: "video" },
  { ext: "3gp", mime: "video/3gpp", label: "3GP", category: "video" },
  { ext: "m2ts", mime: "video/mp2t", label: "MPEG-TS", category: "video" },
  { ext: "ts", mime: "video/mp2t", label: "MPEG-TS", category: "video" },

  // Archives
  { ext: "zip", mime: "application/zip", label: "ZIP", category: "archive" },
  { ext: "gz", mime: "application/gzip", label: "Gzip", category: "archive" },
  { ext: "tgz", mime: "application/gzip", label: "Gzip tarball", category: "archive" },
  { ext: "tar", mime: "application/x-tar", label: "Tar", category: "archive" },
  { ext: "bz2", mime: "application/x-bzip2", label: "Bzip2", category: "archive" },
  { ext: "xz", mime: "application/x-xz", label: "XZ", category: "archive" },
  { ext: "7z", mime: "application/x-7z-compressed", label: "7-Zip", category: "archive" },
  { ext: "rar", mime: "application/vnd.rar", label: "RAR", category: "archive" },
  { ext: "zst", mime: "application/zstd", label: "Zstandard", category: "archive" },

  // Fonts
  { ext: "woff", mime: "font/woff", label: "WOFF", category: "font" },
  { ext: "woff2", mime: "font/woff2", label: "WOFF2", category: "font" },
  { ext: "ttf", mime: "font/ttf", label: "TrueType", category: "font" },
  { ext: "otf", mime: "font/otf", label: "OpenType", category: "font" },
  { ext: "eot", mime: "application/vnd.ms-fontobject", label: "EOT", category: "font" },

  // Code / data
  { ext: "js", mime: "text/javascript", label: "JavaScript", category: "code" },
  { ext: "mjs", mime: "text/javascript", label: "JS module", category: "code" },
  { ext: "cjs", mime: "text/javascript", label: "CommonJS", category: "code" },
  { ext: "jsx", mime: "text/javascript", label: "JSX", category: "code" },
  { ext: "ts", mime: "text/typescript", label: "TypeScript", category: "code" },
  { ext: "tsx", mime: "text/typescript", label: "TSX", category: "code" },
  { ext: "json", mime: "application/json", label: "JSON", category: "code" },
  { ext: "jsonc", mime: "application/json", label: "JSONC", category: "code" },
  { ext: "json5", mime: "application/json5", label: "JSON5", category: "code" },
  { ext: "xml", mime: "application/xml", label: "XML", category: "code" },
  { ext: "xsl", mime: "application/xml", label: "XSLT", category: "code" },
  { ext: "yaml", mime: "application/yaml", label: "YAML", category: "code" },
  { ext: "yml", mime: "application/yaml", label: "YAML", category: "code" },
  { ext: "toml", mime: "application/toml", label: "TOML", category: "code" },
  { ext: "graphql", mime: "application/graphql", label: "GraphQL", category: "code" },
  { ext: "gql", mime: "application/graphql", label: "GraphQL", category: "code" },
  { ext: "wasm", mime: "application/wasm", label: "WebAssembly", category: "code" },
  { ext: "map", mime: "application/json", label: "Source map", category: "code" },
  { ext: "py", mime: "text/x-python", label: "Python", category: "code" },
  { ext: "rb", mime: "text/x-ruby", label: "Ruby", category: "code" },
  { ext: "php", mime: "application/x-httpd-php", label: "PHP", category: "code" },
  { ext: "java", mime: "text/x-java-source", label: "Java", category: "code" },
  { ext: "kt", mime: "text/x-kotlin", label: "Kotlin", category: "code" },
  { ext: "swift", mime: "text/x-swift", label: "Swift", category: "code" },
  { ext: "go", mime: "text/x-go", label: "Go", category: "code" },
  { ext: "rs", mime: "text/x-rust", label: "Rust", category: "code" },
  { ext: "c", mime: "text/x-c", label: "C", category: "code" },
  { ext: "h", mime: "text/x-chdr", label: "C header", category: "code" },
  { ext: "cpp", mime: "text/x-c++src", label: "C++", category: "code" },
  { ext: "hpp", mime: "text/x-c++hdr", label: "C++ header", category: "code" },
  { ext: "cs", mime: "text/x-csharp", label: "C#", category: "code" },
  { ext: "sh", mime: "application/x-sh", label: "Shell", category: "code" },
  { ext: "bash", mime: "application/x-sh", label: "Bash", category: "code" },
  { ext: "zsh", mime: "application/x-sh", label: "Zsh", category: "code" },
  { ext: "ps1", mime: "application/x-powershell", label: "PowerShell", category: "code" },
  { ext: "sql", mime: "application/sql", label: "SQL", category: "code" },
  { ext: "vue", mime: "text/x-vue", label: "Vue", category: "code" },
  { ext: "svelte", mime: "text/x-svelte", label: "Svelte", category: "code" },

  // App / binary / security
  { ext: "bin", mime: "application/octet-stream", label: "Binary", category: "app" },
  {
    ext: "exe",
    mime: "application/vnd.microsoft.portable-executable",
    label: "Windows PE",
    category: "app",
  },
  {
    ext: "dll",
    mime: "application/vnd.microsoft.portable-executable",
    label: "DLL",
    category: "app",
  },
  { ext: "dmg", mime: "application/x-apple-diskimage", label: "macOS disk image", category: "app" },
  { ext: "pkg", mime: "application/octet-stream", label: "Installer package", category: "app" },
  {
    ext: "apk",
    mime: "application/vnd.android.package-archive",
    label: "Android APK",
    category: "app",
  },
  { ext: "aab", mime: "application/octet-stream", label: "Android App Bundle", category: "app" },
  { ext: "ipa", mime: "application/octet-stream", label: "iOS app", category: "app" },
  {
    ext: "deb",
    mime: "application/vnd.debian.binary-package",
    label: "Debian package",
    category: "app",
  },
  { ext: "rpm", mime: "application/x-rpm", label: "RPM package", category: "app" },
  { ext: "msi", mime: "application/x-msdownload", label: "Windows installer", category: "app" },
  { ext: "iso", mime: "application/x-iso9660-image", label: "ISO image", category: "app" },
  { ext: "cer", mime: "application/pkix-cert", label: "Certificate", category: "app" },
  { ext: "crt", mime: "application/x-x509-ca-cert", label: "CA certificate", category: "app" },
  { ext: "pem", mime: "application/x-pem-file", label: "PEM", category: "app" },
  { ext: "key", mime: "application/pkcs8", label: "Private key", category: "app" },
  { ext: "p12", mime: "application/x-pkcs12", label: "PKCS#12", category: "app" },
  { ext: "pfx", mime: "application/x-pkcs12", label: "PKCS#12", category: "app" },
];

export function normalizeMimeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/^\./, "");
}

export function filterMimeEntries(
  entries: MimeEntry[],
  options: { query?: string; category?: MimeCategory | "all" } = {},
): MimeEntry[] {
  const category = options.category ?? "all";
  const raw = (options.query ?? "").trim().toLowerCase();
  const tokens = normalizeMimeQuery(raw)
    .split(/[\s,/]+/)
    .filter(Boolean);

  return entries.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (tokens.length === 0) return true;

    const haystack =
      `${item.ext} .${item.ext} ${item.mime} ${item.label} ${item.category}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

export function lookupByExtension(ext: string): MimeEntry[] {
  const normalized = normalizeMimeQuery(ext);
  if (!normalized) return [];
  return MIME_ENTRIES.filter((item) => item.ext === normalized);
}

export function lookupByMime(mime: string): MimeEntry[] {
  const normalized = mime.trim().toLowerCase();
  if (!normalized) return [];
  return MIME_ENTRIES.filter((item) => item.mime === normalized);
}
