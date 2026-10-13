import { useMemo, useState } from "react";
import { CopyIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Slider } from "#/components/ui/slider";
import { Textarea } from "#/components/ui/textarea";
import { copyText } from "#/lib/clipboard";
import {
  MAX_GAP,
  MAX_TRACKS,
  MIN_TRACKS,
  TRACK_PRESETS,
  areaName,
  buildTemplateAreas,
  defaultTracks,
  generateGridCss,
  resizeTracks,
  type CssGridConfig,
} from "#/lib/cssGrid";
import { cn } from "#/lib/utils";

const PREVIEW_TONES = [
  "bg-primary/35 border-primary/55 text-foreground",
  "bg-secondary border-border text-secondary-foreground",
  "bg-accent/45 border-accent/60 text-foreground",
  "bg-muted border-border text-foreground",
  "bg-primary/40 border-primary/55 text-foreground",
];

function TrackList({
  label,
  tracks,
  onChange,
}: {
  label: string;
  tracks: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-col gap-1.5">
        {tracks.map((track, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <Input
              value={track}
              onValueChange={(value) => {
                const next = [...tracks];
                next[index] = value;
                onChange(next);
              }}
              spellCheck={false}
              aria-label={`${label} ${index + 1}`}
              className="font-mono text-[0.85rem]"
              list={`${label}-presets`}
            />
          </div>
        ))}
      </div>
      <datalist id={`${label}-presets`}>
        {TRACK_PRESETS.map((preset) => (
          <option key={preset} value={preset} />
        ))}
      </datalist>
    </div>
  );
}

function CountControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label id={`${id}-label`}>{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{value}</span>
      </div>
      <Slider
        aria-labelledby={`${id}-label`}
        min={MIN_TRACKS}
        max={MAX_TRACKS}
        step={1}
        value={[value]}
        onValueChange={(next) => {
          const n = Array.isArray(next) ? next[0] : next;
          if (typeof n !== "number" || !Number.isFinite(n)) return;
          onChange(Math.min(MAX_TRACKS, Math.max(MIN_TRACKS, n)));
        }}
      />
    </div>
  );
}

function GapControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-1">
          <Input
            id={id}
            type="number"
            min={0}
            max={MAX_GAP}
            value={String(value)}
            onValueChange={(raw) => {
              const n = Number(raw);
              if (!Number.isFinite(n)) return;
              onChange(Math.min(MAX_GAP, Math.max(0, Math.round(n))));
            }}
            className="h-7 w-16 text-right tabular-nums"
          />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <Slider
        min={0}
        max={MAX_GAP}
        step={1}
        value={[value]}
        onValueChange={(next) => {
          const n = Array.isArray(next) ? next[0] : next;
          if (typeof n !== "number" || !Number.isFinite(n)) return;
          onChange(Math.min(MAX_GAP, Math.max(0, n)));
        }}
      />
    </div>
  );
}

export function CssGridTool() {
  const [columns, setColumns] = useState(() => defaultTracks(3));
  const [rows, setRows] = useState(() => defaultTracks(3));
  const [columnGap, setColumnGap] = useState(8);
  const [rowGap, setRowGap] = useState(8);
  const [includeAreas, setIncludeAreas] = useState(false);

  const config: CssGridConfig = useMemo(
    () => ({
      columns,
      rows,
      columnGap,
      rowGap,
      includeAreas,
    }),
    [columns, rows, columnGap, rowGap, includeAreas],
  );

  const css = useMemo(() => generateGridCss(config), [config]);

  function setColumnCount(count: number) {
    setColumns((prev) => resizeTracks(prev, count));
  }

  function setRowCount(count: number) {
    setRows((prev) => resizeTracks(prev, count));
  }

  function reset() {
    setColumns(defaultTracks(3));
    setRows(defaultTracks(3));
    setColumnGap(8);
    setRowGap(8);
    setIncludeAreas(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
      <section className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card/30 p-3 sm:p-4">
        <CountControl
          id="grid-columns"
          label="Columns"
          value={columns.length}
          onChange={setColumnCount}
        />
        <CountControl id="grid-rows" label="Rows" value={rows.length} onChange={setRowCount} />
        <GapControl
          id="grid-column-gap"
          label="Column gap"
          value={columnGap}
          onChange={setColumnGap}
        />
        <GapControl id="grid-row-gap" label="Row gap" value={rowGap} onChange={setRowGap} />

        <TrackList label="Column sizes" tracks={columns} onChange={setColumns} />
        <TrackList label="Row sizes" tracks={rows} onChange={setRows} />

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="button"
            variant={includeAreas ? "default" : "outline"}
            size="sm"
            onClick={() => setIncludeAreas((v) => !v)}
            aria-pressed={includeAreas}
          >
            Template areas
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div
          className="min-h-64 rounded-xl border border-border/80 bg-card/50 p-3 sm:min-h-80 sm:p-4"
          style={{
            display: "grid",
            gridTemplateColumns: columns.join(" "),
            gridTemplateRows: rows.join(" "),
            columnGap: `${columnGap}px`,
            rowGap: `${rowGap}px`,
            ...(includeAreas
              ? {
                  gridTemplateAreas: buildTemplateAreas(rows.length, columns.length)
                    .map((row) => `"${row}"`)
                    .join(" "),
                }
              : {}),
          }}
          aria-label="Grid preview"
        >
          {rows.map((_, rowIndex) =>
            columns.map((__, colIndex) => {
              const tone =
                PREVIEW_TONES[(rowIndex * columns.length + colIndex) % PREVIEW_TONES.length];
              const name = areaName(rowIndex + 1, colIndex + 1);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "flex min-h-14 items-center justify-center rounded-md border px-2 text-xs font-semibold tabular-nums shadow-sm",
                    tone,
                  )}
                  style={includeAreas ? { gridArea: name } : undefined}
                >
                  {includeAreas ? name : `${rowIndex + 1}×${colIndex + 1}`}
                </div>
              );
            }),
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="grid-css">CSS</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copyText(css, "CSS")}
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </div>
          <Textarea
            id="grid-css"
            value={css}
            readOnly
            spellCheck={false}
            className="min-h-40 font-mono text-[0.8rem] leading-5"
          />
        </div>
      </section>
    </div>
  );
}
