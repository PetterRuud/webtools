export type WindowChrome = "macos" | "windows" | "none";

export type BackgroundPreset = {
  id: string;
  label: string;
  value: string;
};

export const DEFAULT_PADDING = 8;
export const DEFAULT_LINE_HEIGHT = 1.18;

export const SAMPLE_CODE = `function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const values = Array.from({ length: 10 }, (_, i) => fibonacci(i))
console.log(values.join(', '))
console.log('soft-wrap demo: ' + 'x'.repeat(96))
`;

export const LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "tsx", label: "TSX" },
  { id: "javascript", label: "JavaScript" },
  { id: "jsx", label: "JSX" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "java", label: "Java" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "markdown", label: "Markdown" },
  { id: "sql", label: "SQL" },
  { id: "bash", label: "Bash" },
  { id: "shell", label: "Shell" },
  { id: "dockerfile", label: "Dockerfile" },
  { id: "toml", label: "TOML" },
  { id: "xml", label: "XML" },
  { id: "graphql", label: "GraphQL" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const THEMES = [
  { id: "github-dark", label: "GitHub Dark" },
  { id: "github-light", label: "GitHub Light" },
  { id: "dracula", label: "Dracula" },
  { id: "nord", label: "Nord" },
  { id: "one-dark-pro", label: "One Dark Pro" },
  { id: "one-light", label: "One Light" },
  { id: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { id: "catppuccin-latte", label: "Catppuccin Latte" },
  { id: "vitesse-dark", label: "Vitesse Dark" },
  { id: "vitesse-light", label: "Vitesse Light" },
  { id: "material-theme-darker", label: "Material Darker" },
  { id: "material-theme-lighter", label: "Material Lighter" },
  { id: "tokyo-night", label: "Tokyo Night" },
  { id: "min-dark", label: "Min Dark" },
  { id: "min-light", label: "Min Light" },
  { id: "synthwave-84", label: "Synthwave 84" },
  { id: "rose-pine", label: "Rosé Pine" },
  { id: "rose-pine-dawn", label: "Rosé Pine Dawn" },
  { id: "night-owl", label: "Night Owl" },
  { id: "solarized-dark", label: "Solarized Dark" },
  { id: "solarized-light", label: "Solarized Light" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "mint-dusk",
    label: "Mint dusk",
    value: "linear-gradient(135deg, #0f766e 0%, #134e4a 45%, #042f2e 100%)",
  },
  {
    id: "slate-glow",
    label: "Slate glow",
    value: "linear-gradient(145deg, #1e293b 0%, #0f172a 55%, #020617 100%)",
  },
  {
    id: "amber-ink",
    label: "Amber ink",
    value: "linear-gradient(140deg, #78350f 0%, #451a03 50%, #1c1917 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    value: "linear-gradient(135deg, #0c4a6e 0%, #164e63 40%, #083344 100%)",
  },
  {
    id: "solid-ink",
    label: "Solid ink",
    value: "#111827",
  },
  {
    id: "solid-paper",
    label: "Solid paper",
    value: "#f4f4f5",
  },
  {
    id: "transparent",
    label: "Transparent",
    value: "transparent",
  },
];

export const WINDOW_CHROMES: Array<{ id: WindowChrome; label: string }> = [
  { id: "macos", label: "macOS" },
  { id: "windows", label: "Windows" },
  { id: "none", label: "None" },
];

export const FONT_FAMILIES = [
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    stack: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
  },
  {
    id: "fira",
    label: "Fira Code",
    stack: '"Fira Code", "SF Mono", Menlo, Consolas, monospace',
  },
  {
    id: "ibm",
    label: "IBM Plex Mono",
    stack: '"IBM Plex Mono", "SF Mono", Menlo, Consolas, monospace',
  },
  {
    id: "system",
    label: "System mono",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
] as const;

export type FontFamilyId = (typeof FONT_FAMILIES)[number]["id"];

type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "type"
  | "operator"
  | "punctuation"
  | "property"
  | "tag"
  | "attr"
  | "boolean"
  | "regex";

type ThemePalette = {
  bg: string;
  fg: string;
  comment: string;
  string: string;
  keyword: string;
  number: string;
  function: string;
  type: string;
  operator: string;
  punctuation: string;
  property: string;
  tag: string;
  attr: string;
  boolean: string;
  regex: string;
};

const THEME_PALETTES: Record<ThemeId, ThemePalette> = {
  "github-dark": {
    bg: "#0d1117",
    fg: "#e6edf3",
    comment: "#8b949e",
    string: "#a5d6ff",
    keyword: "#ff7b72",
    number: "#79c0ff",
    function: "#d2a8ff",
    type: "#ffa657",
    operator: "#ff7b72",
    punctuation: "#e6edf3",
    property: "#79c0ff",
    tag: "#7ee787",
    attr: "#79c0ff",
    boolean: "#79c0ff",
    regex: "#a5d6ff",
  },
  "github-light": {
    bg: "#ffffff",
    fg: "#1f2328",
    comment: "#6e7781",
    string: "#0a3069",
    keyword: "#cf222e",
    number: "#0550ae",
    function: "#8250df",
    type: "#953800",
    operator: "#cf222e",
    punctuation: "#1f2328",
    property: "#0550ae",
    tag: "#116329",
    attr: "#0550ae",
    boolean: "#0550ae",
    regex: "#0a3069",
  },
  dracula: {
    bg: "#282a36",
    fg: "#f8f8f2",
    comment: "#6272a4",
    string: "#f1fa8c",
    keyword: "#ff79c6",
    number: "#bd93f9",
    function: "#50fa7b",
    type: "#8be9fd",
    operator: "#ff79c6",
    punctuation: "#f8f8f2",
    property: "#66d9ef",
    tag: "#ff79c6",
    attr: "#50fa7b",
    boolean: "#bd93f9",
    regex: "#f1fa8c",
  },
  nord: {
    bg: "#2e3440",
    fg: "#d8dee9",
    comment: "#616e88",
    string: "#a3be8c",
    keyword: "#81a1c1",
    number: "#b48ead",
    function: "#88c0d0",
    type: "#8fbcbb",
    operator: "#81a1c1",
    punctuation: "#eceff4",
    property: "#d8dee9",
    tag: "#81a1c1",
    attr: "#8fbcbb",
    boolean: "#b48ead",
    regex: "#ebcb8b",
  },
  "one-dark-pro": {
    bg: "#282c34",
    fg: "#abb2bf",
    comment: "#5c6370",
    string: "#98c379",
    keyword: "#c678dd",
    number: "#d19a66",
    function: "#61afef",
    type: "#e5c07b",
    operator: "#56b6c2",
    punctuation: "#abb2bf",
    property: "#e06c75",
    tag: "#e06c75",
    attr: "#d19a66",
    boolean: "#d19a66",
    regex: "#98c379",
  },
  "one-light": {
    bg: "#fafafa",
    fg: "#383a42",
    comment: "#a0a1a7",
    string: "#50a14f",
    keyword: "#a626a4",
    number: "#986801",
    function: "#4078f2",
    type: "#c18401",
    operator: "#0184bc",
    punctuation: "#383a42",
    property: "#e45649",
    tag: "#e45649",
    attr: "#986801",
    boolean: "#986801",
    regex: "#50a14f",
  },
  "catppuccin-mocha": {
    bg: "#1e1e2e",
    fg: "#cdd6f4",
    comment: "#6c7086",
    string: "#a6e3a1",
    keyword: "#cba6f7",
    number: "#fab387",
    function: "#89b4fa",
    type: "#f9e2af",
    operator: "#89dceb",
    punctuation: "#cdd6f4",
    property: "#b4befe",
    tag: "#f38ba8",
    attr: "#f9e2af",
    boolean: "#fab387",
    regex: "#a6e3a1",
  },
  "catppuccin-latte": {
    bg: "#eff1f5",
    fg: "#4c4f69",
    comment: "#9ca0b0",
    string: "#40a02b",
    keyword: "#8839ef",
    number: "#fe640b",
    function: "#1e66f5",
    type: "#df8e1d",
    operator: "#04a5e5",
    punctuation: "#4c4f69",
    property: "#7287fd",
    tag: "#d20f39",
    attr: "#df8e1d",
    boolean: "#fe640b",
    regex: "#40a02b",
  },
  "vitesse-dark": {
    bg: "#121212",
    fg: "#dbd7ca",
    comment: "#75815e",
    string: "#c98a7d",
    keyword: "#4d9375",
    number: "#4C9A91",
    function: "#80a665",
    type: "#5da994",
    operator: "#cb7676",
    punctuation: "#dbd7ca",
    property: "#b8a965",
    tag: "#4d9375",
    attr: "#80a665",
    boolean: "#4d9375",
    regex: "#c98a7d",
  },
  "vitesse-light": {
    bg: "#ffffff",
    fg: "#393a34",
    comment: "#a0ada0",
    string: "#b56959",
    keyword: "#1e754f",
    number: "#2f798a",
    function: "#59873a",
    type: "#2e808f",
    operator: "#ab5959",
    punctuation: "#393a34",
    property: "#998418",
    tag: "#1e754f",
    attr: "#59873a",
    boolean: "#1e754f",
    regex: "#b56959",
  },
  "material-theme-darker": {
    bg: "#212121",
    fg: "#eeffff",
    comment: "#545454",
    string: "#c3e88d",
    keyword: "#c792ea",
    number: "#f78c6c",
    function: "#82aaff",
    type: "#ffcb6b",
    operator: "#89ddff",
    punctuation: "#eeffff",
    property: "#f07178",
    tag: "#f07178",
    attr: "#ffcb6b",
    boolean: "#f78c6c",
    regex: "#c3e88d",
  },
  "material-theme-lighter": {
    bg: "#fafafa",
    fg: "#90a4ae",
    comment: "#90a4ae",
    string: "#91b859",
    keyword: "#7c4dff",
    number: "#f76d47",
    function: "#6182b8",
    type: "#e2931d",
    operator: "#39adb5",
    punctuation: "#90a4ae",
    property: "#e53935",
    tag: "#e53935",
    attr: "#e2931d",
    boolean: "#f76d47",
    regex: "#91b859",
  },
  "tokyo-night": {
    bg: "#1a1b26",
    fg: "#a9b1d6",
    comment: "#565f89",
    string: "#9ece6a",
    keyword: "#bb9af7",
    number: "#ff9e64",
    function: "#7aa2f7",
    type: "#2ac3de",
    operator: "#89ddff",
    punctuation: "#a9b1d6",
    property: "#73daca",
    tag: "#f7768e",
    attr: "#e0af68",
    boolean: "#ff9e64",
    regex: "#9ece6a",
  },
  "min-dark": {
    bg: "#1f1f1f",
    fg: "#b392f0",
    comment: "#6b737c",
    string: "#9ecbff",
    keyword: "#f97583",
    number: "#f97583",
    function: "#b392f0",
    type: "#ffab70",
    operator: "#f97583",
    punctuation: "#e1e4e8",
    property: "#79b8ff",
    tag: "#85e89d",
    attr: "#79b8ff",
    boolean: "#f97583",
    regex: "#9ecbff",
  },
  "min-light": {
    bg: "#ffffff",
    fg: "#24292e",
    comment: "#6a737d",
    string: "#032f62",
    keyword: "#d73a49",
    number: "#005cc5",
    function: "#6f42c1",
    type: "#e36209",
    operator: "#d73a49",
    punctuation: "#24292e",
    property: "#005cc5",
    tag: "#22863a",
    attr: "#005cc5",
    boolean: "#005cc5",
    regex: "#032f62",
  },
  "synthwave-84": {
    bg: "#262335",
    fg: "#ffffff",
    comment: "#848bbd",
    string: "#ff8b39",
    keyword: "#fede5d",
    number: "#f97e72",
    function: "#36f9f6",
    type: "#fe4450",
    operator: "#fede5d",
    punctuation: "#ffffff",
    property: "#72f1b8",
    tag: "#fe4450",
    attr: "#ff7edb",
    boolean: "#f97e72",
    regex: "#ff8b39",
  },
  "rose-pine": {
    bg: "#191812",
    fg: "#e0def4",
    comment: "#6e6a86",
    string: "#f6c177",
    keyword: "#c4a7e7",
    number: "#eb6f92",
    function: "#ebbcba",
    type: "#9ccfd8",
    operator: "#31748f",
    punctuation: "#e0def4",
    property: "#9ccfd8",
    tag: "#eb6f92",
    attr: "#c4a7e7",
    boolean: "#eb6f92",
    regex: "#f6c177",
  },
  "rose-pine-dawn": {
    bg: "#faf4ed",
    fg: "#575279",
    comment: "#9893a5",
    string: "#ea9d34",
    keyword: "#907aa9",
    number: "#b4637a",
    function: "#d7827e",
    type: "#56949f",
    operator: "#286983",
    punctuation: "#575279",
    property: "#56949f",
    tag: "#b4637a",
    attr: "#907aa9",
    boolean: "#b4637a",
    regex: "#ea9d34",
  },
  "night-owl": {
    bg: "#011627",
    fg: "#d6deeb",
    comment: "#637777",
    string: "#ecc48d",
    keyword: "#c792ea",
    number: "#f78c6c",
    function: "#82aaff",
    type: "#ffcb8b",
    operator: "#7fdbca",
    punctuation: "#d6deeb",
    property: "#addb67",
    tag: "#7fdbca",
    attr: "#addb67",
    boolean: "#ff5874",
    regex: "#5ca7e4",
  },
  "solarized-dark": {
    bg: "#002b36",
    fg: "#839496",
    comment: "#586e75",
    string: "#2aa198",
    keyword: "#859900",
    number: "#d33682",
    function: "#268bd2",
    type: "#b58900",
    operator: "#859900",
    punctuation: "#839496",
    property: "#268bd2",
    tag: "#268bd2",
    attr: "#b58900",
    boolean: "#d33682",
    regex: "#dc322f",
  },
  "solarized-light": {
    bg: "#fdf6e3",
    fg: "#657b83",
    comment: "#93a1a1",
    string: "#2aa198",
    keyword: "#859900",
    number: "#d33682",
    function: "#268bd2",
    type: "#b58900",
    operator: "#859900",
    punctuation: "#657b83",
    property: "#268bd2",
    tag: "#268bd2",
    attr: "#b58900",
    boolean: "#d33682",
    regex: "#dc322f",
  },
};

type LangProfile = {
  keywords: Set<string>;
  types: Set<string>;
  lineComment: string | null;
  blockComment: [string, string] | null;
  hashComment?: boolean;
  strings: Array<'"' | "'" | "`">;
  regexLiterals?: boolean;
  markup?: boolean;
  css?: boolean;
};

const C_TYPES = [
  "int",
  "long",
  "short",
  "float",
  "double",
  "char",
  "void",
  "bool",
  "boolean",
  "byte",
  "string",
  "String",
  "number",
  "Number",
  "object",
  "Object",
  "any",
  "unknown",
  "never",
  "undefined",
  "null",
  "usize",
  "isize",
  "u8",
  "u16",
  "u32",
  "u64",
  "i8",
  "i16",
  "i32",
  "i64",
  "f32",
  "f64",
  "str",
  "Self",
  "self",
];

function kw(...words: string[]) {
  return new Set(words);
}

const JS_KEYWORDS = kw(
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "of",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "true",
  "false",
  "null",
  "undefined",
);

const LANG_PROFILES: Record<LanguageId, LangProfile> = {
  javascript: {
    keywords: JS_KEYWORDS,
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
    regexLiterals: true,
  },
  jsx: {
    keywords: JS_KEYWORDS,
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
    regexLiterals: true,
    markup: true,
  },
  typescript: {
    keywords: JS_KEYWORDS,
    types: kw(...C_TYPES, "Record", "Partial", "Readonly", "Promise"),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
    regexLiterals: true,
  },
  tsx: {
    keywords: JS_KEYWORDS,
    types: kw(...C_TYPES, "Record", "Partial", "Readonly", "Promise"),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
    regexLiterals: true,
    markup: true,
  },
  python: {
    keywords: kw(
      "and",
      "as",
      "assert",
      "async",
      "await",
      "break",
      "class",
      "continue",
      "def",
      "del",
      "elif",
      "else",
      "except",
      "False",
      "finally",
      "for",
      "from",
      "global",
      "if",
      "import",
      "in",
      "is",
      "lambda",
      "None",
      "nonlocal",
      "not",
      "or",
      "pass",
      "raise",
      "return",
      "True",
      "try",
      "while",
      "with",
      "yield",
    ),
    types: kw("int", "str", "float", "bool", "list", "dict", "set", "tuple"),
    lineComment: "#",
    blockComment: null,
    strings: ['"', "'", "`"],
  },
  go: {
    keywords: kw(
      "break",
      "break",
      "case",
      "chan",
      "const",
      "continue",
      "default",
      "defer",
      "else",
      "fallthrough",
      "for",
      "func",
      "go",
      "goto",
      "if",
      "import",
      "interface",
      "map",
      "package",
      "range",
      "return",
      "select",
      "struct",
      "switch",
      "type",
      "var",
      "true",
      "false",
      "nil",
    ),
    types: kw(...C_TYPES, "error", "rune"),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
  },
  rust: {
    keywords: kw(
      "as",
      "async",
      "await",
      "break",
      "const",
      "continue",
      "crate",
      "dyn",
      "else",
      "enum",
      "extern",
      "false",
      "fn",
      "for",
      "if",
      "impl",
      "in",
      "let",
      "loop",
      "match",
      "mod",
      "move",
      "mut",
      "pub",
      "ref",
      "return",
      "self",
      "Self",
      "static",
      "struct",
      "super",
      "trait",
      "true",
      "type",
      "unsafe",
      "use",
      "where",
      "while",
    ),
    types: kw(...C_TYPES, "Option", "Result", "Vec", "String"),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'"],
  },
  java: {
    keywords: kw(
      "abstract",
      "assert",
      "break",
      "case",
      "catch",
      "class",
      "const",
      "continue",
      "default",
      "do",
      "else",
      "enum",
      "extends",
      "final",
      "finally",
      "for",
      "if",
      "implements",
      "import",
      "instanceof",
      "interface",
      "native",
      "new",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "static",
      "strictfp",
      "super",
      "switch",
      "synchronized",
      "this",
      "throw",
      "throws",
      "transient",
      "try",
      "void",
      "volatile",
      "while",
      "true",
      "false",
      "null",
    ),
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'"],
  },
  kotlin: {
    keywords: kw(
      "as",
      "break",
      "class",
      "continue",
      "do",
      "else",
      "false",
      "for",
      "fun",
      "if",
      "in",
      "interface",
      "is",
      "null",
      "object",
      "package",
      "return",
      "super",
      "this",
      "throw",
      "true",
      "try",
      "typealias",
      "typeof",
      "val",
      "var",
      "when",
      "while",
    ),
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
  },
  swift: {
    keywords: kw(
      "as",
      "associatedtype",
      "break",
      "case",
      "catch",
      "class",
      "continue",
      "default",
      "defer",
      "do",
      "else",
      "enum",
      "extension",
      "false",
      "fileprivate",
      "for",
      "func",
      "guard",
      "if",
      "import",
      "in",
      "init",
      "inout",
      "internal",
      "let",
      "nil",
      "operator",
      "private",
      "protocol",
      "public",
      "repeat",
      "return",
      "self",
      "static",
      "struct",
      "subscript",
      "super",
      "switch",
      "throw",
      "throws",
      "true",
      "try",
      "typealias",
      "var",
      "where",
      "while",
    ),
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'"],
  },
  c: {
    keywords: kw(
      "auto",
      "break",
      "case",
      "const",
      "continue",
      "default",
      "do",
      "else",
      "enum",
      "extern",
      "for",
      "goto",
      "if",
      "inline",
      "register",
      "return",
      "sizeof",
      "static",
      "struct",
      "switch",
      "typedef",
      "union",
      "volatile",
      "while",
    ),
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'"],
  },
  cpp: {
    keywords: kw(
      "alignas",
      "alignof",
      "and",
      "auto",
      "bool",
      "break",
      "case",
      "catch",
      "class",
      "const",
      "constexpr",
      "continue",
      "default",
      "delete",
      "do",
      "else",
      "enum",
      "explicit",
      "export",
      "extern",
      "false",
      "for",
      "friend",
      "goto",
      "if",
      "inline",
      "mutable",
      "namespace",
      "new",
      "noexcept",
      "nullptr",
      "operator",
      "private",
      "protected",
      "public",
      "return",
      "sizeof",
      "static",
      "struct",
      "switch",
      "template",
      "this",
      "throw",
      "true",
      "try",
      "typedef",
      "typeid",
      "typename",
      "union",
      "using",
      "virtual",
      "volatile",
      "while",
    ),
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'"],
  },
  csharp: {
    keywords: kw(
      "abstract",
      "as",
      "base",
      "break",
      "case",
      "catch",
      "checked",
      "class",
      "const",
      "continue",
      "default",
      "delegate",
      "do",
      "else",
      "enum",
      "event",
      "explicit",
      "extern",
      "false",
      "finally",
      "fixed",
      "for",
      "foreach",
      "goto",
      "if",
      "implicit",
      "in",
      "interface",
      "internal",
      "is",
      "lock",
      "namespace",
      "new",
      "null",
      "operator",
      "out",
      "override",
      "params",
      "private",
      "protected",
      "public",
      "readonly",
      "ref",
      "return",
      "sealed",
      "sizeof",
      "stackalloc",
      "static",
      "struct",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "typeof",
      "unchecked",
      "unsafe",
      "using",
      "virtual",
      "void",
      "volatile",
      "while",
    ),
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
  },
  php: {
    keywords: kw(
      "abstract",
      "and",
      "array",
      "as",
      "break",
      "callable",
      "case",
      "catch",
      "class",
      "clone",
      "const",
      "continue",
      "declare",
      "default",
      "do",
      "echo",
      "else",
      "elseif",
      "empty",
      "enddeclare",
      "endfor",
      "endforeach",
      "endif",
      "endswitch",
      "endwhile",
      "extends",
      "final",
      "finally",
      "fn",
      "for",
      "foreach",
      "function",
      "global",
      "goto",
      "if",
      "implements",
      "include",
      "include_once",
      "instanceof",
      "insteadof",
      "interface",
      "isset",
      "list",
      "match",
      "namespace",
      "new",
      "or",
      "print",
      "private",
      "protected",
      "public",
      "require",
      "require_once",
      "return",
      "static",
      "switch",
      "throw",
      "trait",
      "try",
      "unset",
      "use",
      "var",
      "while",
      "xor",
      "yield",
      "true",
      "false",
      "null",
    ),
    types: kw(...C_TYPES),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    hashComment: true,
    strings: ['"', "'", "`"],
  },
  ruby: {
    keywords: kw(
      "alias",
      "and",
      "begin",
      "break",
      "case",
      "class",
      "def",
      "defined?",
      "do",
      "else",
      "elsif",
      "end",
      "ensure",
      "false",
      "for",
      "if",
      "in",
      "module",
      "next",
      "nil",
      "not",
      "or",
      "redo",
      "rescue",
      "retry",
      "return",
      "self",
      "super",
      "then",
      "true",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield",
    ),
    types: kw(),
    lineComment: "#",
    blockComment: null,
    strings: ['"', "'", "`"],
  },
  html: {
    keywords: kw(),
    types: kw(),
    lineComment: null,
    blockComment: ["<!--", "-->"],
    strings: ['"', "'"],
    markup: true,
  },
  xml: {
    keywords: kw(),
    types: kw(),
    lineComment: null,
    blockComment: ["<!--", "-->"],
    strings: ['"', "'"],
    markup: true,
  },
  css: {
    keywords: kw(
      "important",
      "from",
      "to",
      "and",
      "or",
      "not",
      "only",
      "inherit",
      "initial",
      "unset",
    ),
    types: kw(),
    lineComment: null,
    blockComment: ["/*", "*/"],
    strings: ['"', "'"],
    css: true,
  },
  scss: {
    keywords: kw(
      "important",
      "from",
      "to",
      "and",
      "or",
      "not",
      "only",
      "inherit",
      "initial",
      "unset",
      "mixin",
      "include",
      "extend",
      "if",
      "else",
      "for",
      "each",
      "while",
      "function",
      "return",
    ),
    types: kw(),
    lineComment: "//",
    blockComment: ["/*", "*/"],
    strings: ['"', "'"],
    css: true,
  },
  json: {
    keywords: kw("true", "false", "null"),
    types: kw(),
    lineComment: null,
    blockComment: null,
    strings: ['"'],
  },
  yaml: {
    keywords: kw("true", "false", "null", "yes", "no", "on", "off"),
    types: kw(),
    lineComment: "#",
    blockComment: null,
    hashComment: true,
    strings: ['"', "'"],
  },
  markdown: {
    keywords: kw(),
    types: kw(),
    lineComment: null,
    blockComment: null,
    strings: ['"', "'", "`"],
  },
  sql: {
    keywords: kw(
      "select",
      "from",
      "where",
      "and",
      "or",
      "not",
      "insert",
      "into",
      "values",
      "update",
      "set",
      "delete",
      "create",
      "table",
      "alter",
      "drop",
      "index",
      "join",
      "left",
      "right",
      "inner",
      "outer",
      "on",
      "as",
      "order",
      "by",
      "group",
      "having",
      "limit",
      "offset",
      "union",
      "all",
      "distinct",
      "case",
      "when",
      "then",
      "else",
      "end",
      "null",
      "true",
      "false",
      "in",
      "is",
      "like",
      "between",
      "exists",
      "primary",
      "key",
      "foreign",
      "references",
      "unique",
      "check",
      "default",
      "constraint",
    ),
    types: kw(
      "int",
      "integer",
      "varchar",
      "text",
      "boolean",
      "bool",
      "date",
      "timestamp",
      "float",
      "double",
      "decimal",
      "json",
      "uuid",
    ),
    lineComment: "--",
    blockComment: ["/*", "*/"],
    strings: ['"', "'", "`"],
  },
  bash: {
    keywords: kw(
      "if",
      "then",
      "else",
      "elif",
      "fi",
      "for",
      "while",
      "do",
      "done",
      "case",
      "esac",
      "function",
      "return",
      "in",
      "select",
      "time",
      "coproc",
      "export",
      "local",
      "readonly",
      "declare",
      "typeset",
      "unset",
      "shift",
      "true",
      "false",
    ),
    types: kw(),
    lineComment: "#",
    blockComment: null,
    hashComment: true,
    strings: ['"', "'", "`"],
  },
  shell: {
    keywords: kw(
      "if",
      "then",
      "else",
      "elif",
      "fi",
      "for",
      "while",
      "do",
      "done",
      "case",
      "esac",
      "function",
      "return",
      "in",
      "export",
      "local",
      "true",
      "false",
    ),
    types: kw(),
    lineComment: "#",
    blockComment: null,
    hashComment: true,
    strings: ['"', "'", "`"],
  },
  dockerfile: {
    keywords: kw(
      "FROM",
      "RUN",
      "CMD",
      "LABEL",
      "MAINTAINER",
      "EXPOSE",
      "ENV",
      "ADD",
      "COPY",
      "ENTRYPOINT",
      "VOLUME",
      "USER",
      "WORKDIR",
      "ARG",
      "ONBUILD",
      "STOPSIGNAL",
      "HEALTHCHECK",
      "SHELL",
      "AS",
    ),
    types: kw(),
    lineComment: "#",
    blockComment: null,
    hashComment: true,
    strings: ['"', "'"],
  },
  toml: {
    keywords: kw("true", "false"),
    types: kw(),
    lineComment: "#",
    blockComment: null,
    hashComment: true,
    strings: ['"', "'"],
  },
  graphql: {
    keywords: kw(
      "type",
      "interface",
      "union",
      "enum",
      "input",
      "scalar",
      "schema",
      "extend",
      "implements",
      "query",
      "mutation",
      "subscription",
      "fragment",
      "on",
      "true",
      "false",
      "null",
    ),
    types: kw("Int", "Float", "String", "Boolean", "ID"),
    lineComment: "#",
    blockComment: null,
    hashComment: true,
    strings: ['"', "'"],
  },
};

type Token = { kind: TokenKind; text: string };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isIdentStart(ch: string) {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentPart(ch: string) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function readIdent(input: string, start: number): string {
  let end = start + 1;
  while (end < input.length && isIdentPart(input[end]!)) end += 1;
  return input.slice(start, end);
}

function tokenizeCode(code: string, language: LanguageId): Token[][] {
  const profile = LANG_PROFILES[language];
  const lines = code.replace(/\r\n/g, "\n").split("\n");
  const result: Token[][] = [];
  let inBlockComment = false;
  let blockEnd = profile.blockComment?.[1] ?? "";

  for (const line of lines) {
    const tokens: Token[] = [];
    let i = 0;

    if (language === "markdown" && !inBlockComment) {
      result.push(tokenizeMarkdownLine(line));
      continue;
    }

    while (i < line.length) {
      if (inBlockComment) {
        const endIdx = line.indexOf(blockEnd, i);
        if (endIdx === -1) {
          tokens.push({ kind: "comment", text: line.slice(i) });
          i = line.length;
          break;
        }
        tokens.push({ kind: "comment", text: line.slice(i, endIdx + blockEnd.length) });
        i = endIdx + blockEnd.length;
        inBlockComment = false;
        continue;
      }

      const ch = line[i]!;
      const rest = line.slice(i);

      if (profile.blockComment && rest.startsWith(profile.blockComment[0])) {
        const endIdx = line.indexOf(profile.blockComment[1], i + profile.blockComment[0].length);
        if (endIdx === -1) {
          tokens.push({ kind: "comment", text: line.slice(i) });
          inBlockComment = true;
          blockEnd = profile.blockComment[1];
          i = line.length;
        } else {
          tokens.push({
            kind: "comment",
            text: line.slice(i, endIdx + profile.blockComment[1].length),
          });
          i = endIdx + profile.blockComment[1].length;
        }
        continue;
      }

      if (profile.lineComment && rest.startsWith(profile.lineComment)) {
        tokens.push({ kind: "comment", text: line.slice(i) });
        break;
      }

      if (profile.hashComment && ch === "#") {
        tokens.push({ kind: "comment", text: line.slice(i) });
        break;
      }

      if (profile.markup && ch === "<") {
        const close = line.indexOf(">", i);
        if (close === -1) {
          tokens.push({ kind: "tag", text: line.slice(i) });
          break;
        }
        tokens.push(...tokenizeMarkupChunk(line.slice(i, close + 1)));
        i = close + 1;
        continue;
      }

      if (profile.strings.includes(ch as '"' | "'" | "`")) {
        const quote = ch;
        let j = i + 1;
        let escaped = false;
        while (j < line.length) {
          const current = line[j]!;
          if (escaped) {
            escaped = false;
            j += 1;
            continue;
          }
          if (current === "\\") {
            escaped = true;
            j += 1;
            continue;
          }
          if (current === quote) {
            j += 1;
            break;
          }
          j += 1;
        }
        tokens.push({ kind: "string", text: line.slice(i, j) });
        i = j;
        continue;
      }

      if (profile.regexLiterals && ch === "/" && !rest.startsWith("//") && !rest.startsWith("/*")) {
        const prev = [...tokens].reverse().find((t) => t.text.trim().length > 0);
        const prevText = prev?.text ?? "";
        const canBeRegex =
          !prev ||
          /[({[=,:;!&|?+\-*%^~]$/.test(prevText) ||
          prev.kind === "keyword" ||
          prev.kind === "operator";
        if (canBeRegex) {
          let j = i + 1;
          let escaped = false;
          while (j < line.length) {
            const current = line[j]!;
            if (escaped) {
              escaped = false;
              j += 1;
              continue;
            }
            if (current === "\\") {
              escaped = true;
              j += 1;
              continue;
            }
            if (current === "/") {
              j += 1;
              while (j < line.length && /[a-z]/i.test(line[j]!)) j += 1;
              break;
            }
            j += 1;
          }
          tokens.push({ kind: "regex", text: line.slice(i, j) });
          i = j;
          continue;
        }
      }

      if (/[0-9]/.test(ch)) {
        let j = i + 1;
        while (j < line.length && /[0-9a-fxob._]/i.test(line[j]!)) j += 1;
        tokens.push({ kind: "number", text: line.slice(i, j) });
        i = j;
        continue;
      }

      if (isIdentStart(ch)) {
        const ident = readIdent(line, i);
        const next = line[i + ident.length];
        let kind: TokenKind = "plain";
        const keywordHit =
          profile.keywords.has(ident) ||
          ((language === "dockerfile" || language === "sql") &&
            profile.keywords.has(ident.toLowerCase())) ||
          (language === "dockerfile" && profile.keywords.has(ident.toUpperCase()));
        if (keywordHit) {
          const lower = ident.toLowerCase();
          kind =
            lower === "true" ||
            lower === "false" ||
            lower === "null" ||
            lower === "undefined" ||
            ident === "None" ||
            ident === "nil"
              ? "boolean"
              : "keyword";
        } else if (profile.types.has(ident) || /^[A-Z]/.test(ident)) {
          kind = "type";
        } else if (next === "(") {
          kind = "function";
        } else if (profile.css && (ident.startsWith("--") || next === ":")) {
          kind = "property";
        }
        tokens.push({ kind, text: ident });
        i += ident.length;
        continue;
      }

      if (/[{}()[\];,.:]/.test(ch)) {
        tokens.push({ kind: "punctuation", text: ch });
        i += 1;
        continue;
      }

      if (/[=<>!+\-*/%&|^~?]/.test(ch)) {
        let j = i + 1;
        while (j < line.length && /[=<>!+\-*/%&|^~?]/.test(line[j]!)) j += 1;
        tokens.push({ kind: "operator", text: line.slice(i, j) });
        i = j;
        continue;
      }

      tokens.push({ kind: "plain", text: ch });
      i += 1;
    }

    result.push(tokens.length > 0 ? tokens : [{ kind: "plain", text: "" }]);
  }

  return result;
}

function tokenizeMarkupChunk(chunk: string): Token[] {
  const tokens: Token[] = [];
  const match = chunk.match(/^<\/?([^\s/>]+)([^>]*)(\/?)>$/);
  if (!match) return [{ kind: "tag", text: chunk }];

  const [, tagName = "", attrs = "", selfClose = ""] = match;
  const isClose = chunk.startsWith("</");
  tokens.push({ kind: "punctuation", text: isClose ? "</" : "<" });
  tokens.push({ kind: "tag", text: tagName });

  const attrRe = /([^\s=]+)(=)?(".*?"|'.*?'|[^\s]*)?/g;
  let attrMatch: RegExpExecArray | null;
  let cursor = 0;
  while ((attrMatch = attrRe.exec(attrs)) != null) {
    const whole = attrMatch[0];
    const leading = attrs.slice(cursor, attrMatch.index);
    if (leading) tokens.push({ kind: "plain", text: leading });
    if (!whole.trim()) {
      cursor = attrMatch.index + whole.length;
      continue;
    }
    const name = attrMatch[1] ?? "";
    const eq = attrMatch[2] ?? "";
    const value = attrMatch[3] ?? "";
    if (name) tokens.push({ kind: "attr", text: name });
    if (eq) tokens.push({ kind: "operator", text: eq });
    if (value) tokens.push({ kind: "string", text: value });
    cursor = attrMatch.index + whole.length;
  }
  const trailing = attrs.slice(cursor);
  if (trailing) tokens.push({ kind: "plain", text: trailing });
  tokens.push({ kind: "punctuation", text: `${selfClose}>` });
  return tokens;
}

function tokenizeMarkdownLine(line: string): Token[] {
  if (/^\s*#+\s/.test(line)) return [{ kind: "keyword", text: line }];
  if (/^\s*([-*+]|\d+\.)\s/.test(line)) return [{ kind: "operator", text: line }];
  if (/^\s*>/.test(line)) return [{ kind: "comment", text: line }];
  if (/^\s*```/.test(line)) return [{ kind: "punctuation", text: line }];
  if (/^\s*\|/.test(line)) return [{ kind: "property", text: line }];

  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === "`") {
      const end = line.indexOf("`", i + 1);
      if (end !== -1) {
        tokens.push({ kind: "string", text: line.slice(i, end + 1) });
        i = end + 1;
        continue;
      }
    }
    if (line.startsWith("**", i) || line.startsWith("__", i)) {
      const marker = line.slice(i, i + 2);
      const end = line.indexOf(marker, i + 2);
      if (end !== -1) {
        tokens.push({ kind: "keyword", text: line.slice(i, end + 2) });
        i = end + 2;
        continue;
      }
    }
    if (line[i] === "[") {
      const close = line.indexOf("]", i);
      const openParen = close === -1 ? -1 : line.indexOf("(", close);
      const closeParen = openParen === -1 ? -1 : line.indexOf(")", openParen);
      if (close !== -1 && openParen === close + 1 && closeParen !== -1) {
        tokens.push({ kind: "tag", text: line.slice(i, closeParen + 1) });
        i = closeParen + 1;
        continue;
      }
    }
    tokens.push({ kind: "plain", text: line[i]! });
    i += 1;
  }
  return tokens.length > 0 ? tokens : [{ kind: "plain", text: "" }];
}

function colorFor(kind: TokenKind, palette: ThemePalette): string {
  switch (kind) {
    case "comment":
      return palette.comment;
    case "string":
      return palette.string;
    case "keyword":
      return palette.keyword;
    case "number":
      return palette.number;
    case "function":
      return palette.function;
    case "type":
      return palette.type;
    case "operator":
      return palette.operator;
    case "punctuation":
      return palette.punctuation;
    case "property":
      return palette.property;
    case "tag":
      return palette.tag;
    case "attr":
      return palette.attr;
    case "boolean":
      return palette.boolean;
    case "regex":
      return palette.regex;
    default:
      return palette.fg;
  }
}

export function getThemeBackground(theme: ThemeId): string {
  return THEME_PALETTES[theme].bg;
}

/** Lightweight tokenizer → HTML with per-line spans. */
export function highlightCode(
  code: string,
  language: LanguageId,
  theme: ThemeId,
): { html: string; background: string } {
  const palette = THEME_PALETTES[theme];
  const lines = tokenizeCode(code.length > 0 ? code : " ", language);
  const body = lines
    .map((tokens) => {
      const inner = tokens
        .map((token) => {
          if (!token.text) return "";
          const color = colorFor(token.kind, palette);
          return `<span style="color:${color}">${escapeHtml(token.text)}</span>`;
        })
        .join("");
      return `<span class="line">${inner || " "}</span>`;
    })
    .join("\n");

  const html = `<pre class="code-shot-pre" style="background-color:${palette.bg};color:${palette.fg}"><code>${body}</code></pre>`;
  return { html, background: palette.bg };
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function cssTextFromComputed(style: CSSStyleDeclaration): string {
  let css = "";
  for (let i = 0; i < style.length; i += 1) {
    const name = style.item(i);
    // Skip external resource props that can taint the canvas.
    if (name.startsWith("background-image") && /url\(/i.test(style.getPropertyValue(name))) {
      continue;
    }
    css += `${name}:${style.getPropertyValue(name)};`;
  }
  return css;
}

function copyComputedStyles(source: Element, target: Element) {
  if (source instanceof HTMLElement && target instanceof HTMLElement) {
    target.style.cssText = cssTextFromComputed(getComputedStyle(source));
  } else if (source instanceof SVGElement && target instanceof SVGElement) {
    target.setAttribute("style", cssTextFromComputed(getComputedStyle(source)));
  }

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  for (let i = 0; i < sourceChildren.length; i += 1) {
    const nextSource = sourceChildren[i];
    const nextTarget = targetChildren[i];
    if (nextSource && nextTarget) copyComputedStyles(nextSource, nextTarget);
  }
}

function parseCssContent(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed || trimmed === "none" || trimmed === "normal") return null;

  let text = trimmed;
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1);
  }

  text = text
    .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/\\(.)/g, "$1");

  return text.length > 0 ? text : null;
}

function resolvePseudoText(source: HTMLElement, style: CSSStyleDeclaration): string | null {
  const raw = style.content.trim();
  if (!raw || raw === "none" || raw === "normal") return null;

  // Some engines leave counters unresolved (`counter(code-line)`). Compute line nos.
  if (/counter\s*\(/i.test(raw)) {
    if (source.classList.contains("line")) {
      const parent = source.parentElement;
      if (parent) {
        const lines = Array.from(parent.querySelectorAll(":scope > .line"));
        const index = lines.indexOf(source);
        if (index >= 0) return String(index + 1);
      }
    }
    return null;
  }

  return parseCssContent(raw);
}

function materializePseudo(
  source: HTMLElement,
  target: HTMLElement,
  pseudo: "::before" | "::after",
) {
  const style = getComputedStyle(source, pseudo);
  const text = resolvePseudoText(source, style);
  if (text == null) return;

  const span = document.createElement("span");
  span.textContent = text;
  span.style.cssText = cssTextFromComputed(style);
  span.style.content = "";
  // Keep line-number gutters from colliding with code.
  if (source.classList.contains("line") && pseudo === "::before") {
    span.style.display = "inline-block";
    span.style.width = span.style.width || "2.25em";
    span.style.marginRight = span.style.marginRight || "1em";
    span.style.textAlign = span.style.textAlign || "right";
    span.style.userSelect = "none";
  }
  if (pseudo === "::before") {
    target.insertBefore(span, target.firstChild);
  } else {
    target.appendChild(span);
  }
}

function applyPseudoElements(source: Element, target: Element) {
  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  for (let i = 0; i < sourceChildren.length; i += 1) {
    const nextSource = sourceChildren[i];
    const nextTarget = targetChildren[i];
    if (nextSource && nextTarget) applyPseudoElements(nextSource, nextTarget);
  }

  if (source instanceof HTMLElement && target instanceof HTMLElement) {
    materializePseudo(source, target, "::before");
    materializePseudo(source, target, "::after");
  }
}

function forceExportSafeFonts(root: HTMLElement) {
  const safe =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
  root.style.fontFamily = safe;
  root.querySelectorAll<HTMLElement>("*").forEach((node) => {
    node.style.fontFamily = safe;
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to rasterize preview"));
    image.src = url;
  });
}

/** Rasterize a DOM node to a PNG data URL via SVG foreignObject → canvas. */
export async function exportElementToPng(
  element: HTMLElement,
  options: { pixelRatio?: number } = {},
): Promise<string> {
  const pixelRatio = options.pixelRatio ?? 2;
  await document.fonts.ready;

  const width = element.offsetWidth;
  const height = element.offsetHeight;
  if (width <= 0 || height <= 0) {
    throw new Error("Preview has no size");
  }

  const clone = element.cloneNode(true) as HTMLElement;
  copyComputedStyles(element, clone);
  applyPseudoElements(element, clone);
  // Pseudos are real nodes now; drop counter-driven classes.
  clone.classList.remove("code-shot-lines");
  clone
    .querySelectorAll(".code-shot-lines")
    .forEach((node) => node.classList.remove("code-shot-lines"));
  forceExportSafeFonts(clone);

  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.boxSizing = "border-box";
  clone.style.margin = "0";

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <foreignObject x="0" y="0" width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;">
      ${serialized}
    </div>
  </foreignObject>
</svg>`;

  // data: URL avoids blob+foreignObject canvas tainting in Chromium.
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const image = await loadImage(svgUrl);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * pixelRatio));
  canvas.height = Math.max(1, Math.round(height * pixelRatio));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.scale(pixelRatio, pixelRatio);
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}
