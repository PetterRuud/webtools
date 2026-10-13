export type TextCleanOptions = {
  trimLines: boolean;
  collapseWhitespace: boolean;
  removeEmptyLines: boolean;
  stripHtml: boolean;
  smartQuotes: boolean;
  normalizeLineBreaks: boolean;
  removeLineBreaks: boolean;
  removeControlChars: boolean;
  fullwidthToHalfwidth: boolean;
};

export const DEFAULT_TEXT_CLEAN_OPTIONS: TextCleanOptions = {
  trimLines: true,
  collapseWhitespace: true,
  removeEmptyLines: true,
  stripHtml: false,
  smartQuotes: false,
  normalizeLineBreaks: true,
  removeLineBreaks: false,
  removeControlChars: false,
  fullwidthToHalfwidth: false,
};

const SMART_QUOTE_MAP: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201A": "'",
  "\u201B": "'",
  "\u2032": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u201E": '"',
  "\u201F": '"',
  "\u2033": '"',
  "\u00AB": '"',
  "\u00BB": '"',
  "\u2039": "'",
  "\u203A": "'",
};

function stripHtmlTags(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|table|section|article|header|footer)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function toHalfwidth(input: string): string {
  return input
    .replace(/[\uFF01-\uFF5E]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, " ");
}

function replaceSmartQuotes(input: string): string {
  return input.replace(
    /[\u2018\u2019\u201A\u201B\u2032\u201C\u201D\u201E\u201F\u2033\u00AB\u00BB\u2039\u203A]/g,
    (char) => SMART_QUOTE_MAP[char] ?? char,
  );
}

function stripControlChars(input: string): string {
  // Keep tab (\t), LF (\n), CR (\r); drop other C0/C1 controls.
  // eslint-disable-next-line no-control-regex -- intentional C0/C1 strip
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

export function cleanText(input: string, options: TextCleanOptions): string {
  let text = input;

  if (options.stripHtml) {
    text = stripHtmlTags(text);
  }
  if (options.fullwidthToHalfwidth) {
    text = toHalfwidth(text);
  }
  if (options.smartQuotes) {
    text = replaceSmartQuotes(text);
  }
  if (options.removeControlChars) {
    text = stripControlChars(text);
  }
  if (options.normalizeLineBreaks || options.removeLineBreaks) {
    text = text.replace(/\r\n?/g, "\n");
  }

  let lines = text.split("\n");

  if (options.trimLines) {
    lines = lines.map((line) => line.trim());
  }

  if (options.collapseWhitespace) {
    lines = lines.map((line) => line.replace(/[^\S\n]+/g, " "));
  }

  if (options.removeEmptyLines) {
    lines = lines.filter((line) => line.length > 0);
  }

  text = lines.join("\n");

  if (options.removeLineBreaks) {
    text = text
      .replace(/\n+/g, " ")
      .replace(/[^\S\n]+/g, " ")
      .trim();
  }

  return text;
}

export type TextCleanStats = {
  charsIn: number;
  charsOut: number;
  linesIn: number;
  linesOut: number;
};

export function textCleanStats(input: string, output: string): TextCleanStats {
  return {
    charsIn: input.length,
    charsOut: output.length,
    linesIn: input.length === 0 ? 0 : input.split(/\r\n?|\n/).length,
    linesOut: output.length === 0 ? 0 : output.split(/\r\n?|\n/).length,
  };
}
