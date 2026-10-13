export type CsvJsonOptions = {
  /** Treat first CSV row as object keys. Default true. */
  headerRow?: boolean;
  /** Pretty-print JSON output. Default true. */
  pretty?: boolean;
};

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/** RFC4180-ish CSV parse: quotes, escaped "", commas/newlines in quotes. */
export function parseCsv(input: string): string[][] {
  const text = normalizeNewlines(input);
  if (!text.trim()) return [];

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }

    field += char;
    i += 1;
  }

  if (inQuotes) {
    throw new Error("Unclosed quoted field.");
  }

  // Final field/row (file may omit trailing newline).
  row.push(field);
  const isOnlyTrailingEmpty =
    row.length === 1 && row[0] === "" && rows.length > 0 && text.endsWith("\n");
  if (!isOnlyTrailingEmpty) {
    rows.push(row);
  }

  return rows;
}

function uniqueHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((raw, index) => {
    const base = raw.trim() || `column_${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

function cellToJsonValue(cell: string): string | number | boolean | null {
  const trimmed = cell.trim();
  if (trimmed === "") return "";
  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return cell;
}

export function csvToJson(input: string, options: CsvJsonOptions = {}): string {
  const headerRow = options.headerRow ?? true;
  const pretty = options.pretty ?? true;
  const rows = parseCsv(input);
  if (rows.length === 0) {
    throw new Error("CSV is empty.");
  }

  let data: unknown;
  if (headerRow) {
    const [headerCells, ...body] = rows;
    if (!headerCells?.length) {
      throw new Error("Missing header row.");
    }
    const headers = uniqueHeaders(headerCells);
    data = body.map((cells) => {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < headers.length; i += 1) {
        obj[headers[i]!] = cellToJsonValue(cells[i] ?? "");
      }
      return obj;
    });
  } else {
    data = rows.map((cells) => cells.map(cellToJsonValue));
  }

  return JSON.stringify(data, null, pretty ? 2 : undefined);
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function valueToCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return escapeCsvCell(value);
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return escapeCsvCell(JSON.stringify(value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function jsonToCsv(input: string, options: CsvJsonOptions = {}): string {
  const headerRow = options.headerRow ?? true;
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    throw new Error(err instanceof Error ? `Invalid JSON: ${err.message}` : "Invalid JSON.");
  }

  let rows: unknown[];
  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (isPlainObject(parsed)) {
    rows = [parsed];
  } else {
    throw new Error("JSON must be an array or an object.");
  }

  if (rows.length === 0) {
    return "";
  }

  const allArrays = rows.every((row) => Array.isArray(row));
  if (allArrays) {
    const matrix = rows as unknown[][];
    const width = Math.max(0, ...matrix.map((row) => row.length));
    if (width === 0) return "";

    const lines: string[] = [];
    if (headerRow) {
      lines.push(
        Array.from({ length: width }, (_, i) => `column_${i + 1}`)
          .map(escapeCsvCell)
          .join(","),
      );
    }
    for (const row of matrix) {
      lines.push(Array.from({ length: width }, (_, i) => valueToCsvCell(row[i])).join(","));
    }
    return `${lines.join("\n")}\n`;
  }

  const objects = rows.map((row, index) => {
    if (!isPlainObject(row)) {
      throw new Error(`Row ${index + 1} must be an object when converting object arrays.`);
    }
    return row;
  });

  const headers: string[] = [];
  const seen = new Set<string>();
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    }
  }

  if (headers.length === 0) {
    throw new Error("Objects have no keys to use as columns.");
  }

  const lines: string[] = [];
  if (headerRow) {
    lines.push(headers.map(escapeCsvCell).join(","));
  }
  for (const obj of objects) {
    lines.push(headers.map((key) => valueToCsvCell(obj[key])).join(","));
  }
  return `${lines.join("\n")}\n`;
}
