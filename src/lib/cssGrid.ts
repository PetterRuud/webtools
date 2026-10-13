export const TRACK_PRESETS = [
  "1fr",
  "auto",
  "min-content",
  "max-content",
  "100px",
  "200px",
  "50%",
  "minmax(0, 1fr)",
  "minmax(120px, 1fr)",
] as const;

export type TrackSize = string;

export type CssGridConfig = {
  columns: TrackSize[];
  rows: TrackSize[];
  columnGap: number;
  rowGap: number;
  includeAreas: boolean;
};

export const MIN_TRACKS = 1;
export const MAX_TRACKS = 12;
export const MAX_GAP = 64;

export function defaultTracks(count: number, unit = "1fr"): TrackSize[] {
  return Array.from({ length: count }, () => unit);
}

export function resizeTracks(tracks: TrackSize[], count: number, fill = "1fr"): TrackSize[] {
  const next = tracks.slice(0, count);
  while (next.length < count) next.push(fill);
  return next;
}

export function areaName(row: number, col: number): string {
  // a1, b1, … style names that stay valid CSS identifiers
  const letter = String.fromCharCode(97 + ((col - 1) % 26));
  return `${letter}${row}`;
}

export function buildTemplateAreas(rowCount: number, columnCount: number): string[] {
  return Array.from({ length: rowCount }, (_, r) =>
    Array.from({ length: columnCount }, (_, c) => areaName(r + 1, c + 1)).join(" "),
  );
}

export function formatGap(columnGap: number, rowGap: number): string {
  if (columnGap === rowGap) return `${columnGap}px`;
  return `${rowGap}px ${columnGap}px`;
}

export function generateGridCss(config: CssGridConfig): string {
  const { columns, rows, columnGap, rowGap, includeAreas } = config;

  const lines = [
    ".grid {",
    "  display: grid;",
    `  grid-template-columns: ${columns.join(" ")};`,
    `  grid-template-rows: ${rows.join(" ")};`,
  ];

  if (columnGap !== 0 || rowGap !== 0) {
    if (columnGap === rowGap) {
      lines.push(`  gap: ${columnGap}px;`);
    } else {
      lines.push(`  column-gap: ${columnGap}px;`);
      lines.push(`  row-gap: ${rowGap}px;`);
    }
  }

  if (includeAreas) {
    const areas = buildTemplateAreas(rows.length, columns.length);
    lines.push("  grid-template-areas:");
    areas.forEach((row, index) => {
      const suffix = index === areas.length - 1 ? ";" : "";
      lines.push(`    "${row}"${suffix}`);
    });
  }

  lines.push("}");

  if (includeAreas) {
    lines.push("");
    for (let r = 1; r <= rows.length; r++) {
      for (let c = 1; c <= columns.length; c++) {
        const name = areaName(r, c);
        lines.push(`.${name} { grid-area: ${name}; }`);
      }
    }
  }

  return lines.join("\n");
}

export function cellCount(config: CssGridConfig): number {
  return config.columns.length * config.rows.length;
}
