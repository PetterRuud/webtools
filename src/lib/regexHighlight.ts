export type RegexMatchInfo = {
  index: number;
  text: string;
  groups: Array<string | undefined>;
  /** [start, end) for full match (0) and each capture group; undefined if unmatched */
  indices: Array<[number, number] | undefined>;
};

export type HighlightSegment = {
  start: number;
  end: number;
  /** 0 = full match, 1+ = capture group */
  group: number;
  matchIndex: number;
};

/** Background classes for full match (0) then $1, $2, … (cycle). */
export const REGEX_GROUP_BG = [
  "bg-primary/45 dark:bg-primary/35",
  "bg-sky-500/35 dark:bg-sky-400/30",
  "bg-violet-500/35 dark:bg-violet-400/30",
  "bg-emerald-500/35 dark:bg-emerald-400/30",
  "bg-orange-500/35 dark:bg-orange-400/30",
  "bg-rose-500/35 dark:bg-rose-400/30",
  "bg-cyan-500/35 dark:bg-cyan-400/30",
  "bg-fuchsia-500/35 dark:bg-fuchsia-400/30",
] as const;

export const REGEX_GROUP_ACTIVE_RING = "ring-2 ring-inset ring-primary/70 dark:ring-primary/50";

export function groupBgClass(group: number): string {
  return REGEX_GROUP_BG[group % REGEX_GROUP_BG.length] ?? REGEX_GROUP_BG[0];
}

export function groupLegendLabel(group: number): string {
  return group === 0 ? "Match" : `$${group}`;
}

export function collectRegexMatches(regex: RegExp, text: string): RegexMatchInfo[] {
  const flagSet = new Set(regex.flags.split("").filter(Boolean));
  flagSet.add("g");
  flagSet.add("d");
  const global = new RegExp(regex.source, [...flagSet].join(""));
  const matches: RegexMatchInfo[] = [];
  let match: RegExpExecArray | null;
  let guard = 0;
  while ((match = global.exec(text)) !== null) {
    const indices = match.indices
      ? Array.from(match.indices, (pair) =>
          pair ? ([pair[0], pair[1]] as [number, number]) : undefined,
        )
      : fallbackIndices(match);
    matches.push({
      index: match.index,
      text: match[0],
      groups: match.slice(1),
      indices,
    });
    if (match[0].length === 0) {
      global.lastIndex += 1;
    }
    guard += 1;
    if (guard > 5000) break;
  }
  return matches;
}

/** When `d` is unavailable, approximate group starts via sequential search in the match. */
function fallbackIndices(match: RegExpExecArray): Array<[number, number] | undefined> {
  const fullStart = match.index;
  const fullEnd = fullStart + match[0].length;
  const out: Array<[number, number] | undefined> = [[fullStart, fullEnd]];
  let searchFrom = 0;
  for (let i = 1; i < match.length; i += 1) {
    const value = match[i];
    if (value === undefined) {
      out.push(undefined);
      continue;
    }
    const offset = match[0].indexOf(value, searchFrom);
    if (offset < 0) {
      out.push(undefined);
      continue;
    }
    const start = fullStart + offset;
    out.push([start, start + value.length]);
    searchFrom = offset + value.length;
  }
  return out;
}

/**
 * Flatten overlapping match/group ranges into non-overlapping segments.
 * When ranges overlap, the highest group index wins (innermost capture).
 */
export function buildHighlightSegments(matches: RegexMatchInfo[]): HighlightSegment[] {
  type Cover = { group: number; matchIndex: number; start: number; end: number };
  const covers: Cover[] = [];

  matches.forEach((match, matchIndex) => {
    match.indices.forEach((pair, group) => {
      if (!pair) return;
      const [start, end] = pair;
      if (end <= start) return;
      covers.push({ group, matchIndex, start, end });
    });
  });

  if (covers.length === 0) return [];

  const points = new Set<number>();
  for (const c of covers) {
    points.add(c.start);
    points.add(c.end);
  }
  const sorted = [...points].sort((a, b) => a - b);
  const segments: HighlightSegment[] = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const start = sorted[i]!;
    const end = sorted[i + 1]!;
    if (end <= start) continue;

    let best: Cover | null = null;
    for (const c of covers) {
      if (c.start <= start && c.end >= end) {
        if (
          !best ||
          c.group > best.group ||
          (c.group === best.group && c.matchIndex < best.matchIndex)
        ) {
          best = c;
        }
      }
    }
    if (best) {
      const last = segments[segments.length - 1];
      if (
        last &&
        last.end === start &&
        last.group === best.group &&
        last.matchIndex === best.matchIndex
      ) {
        last.end = end;
      } else {
        segments.push({
          start,
          end,
          group: best.group,
          matchIndex: best.matchIndex,
        });
      }
    }
  }

  return segments;
}

export function maxGroupInMatches(matches: RegexMatchInfo[]): number {
  let max = -1;
  for (const match of matches) {
    for (let i = 0; i < match.indices.length; i += 1) {
      if (match.indices[i]) max = Math.max(max, i);
    }
  }
  return max;
}
