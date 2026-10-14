import { useState, type FormEvent } from "react";
import { BotIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import type { CompareResult, ViewSnapshot } from "#/lib/spaVsBot";
import { cn } from "cn";

const SAMPLE = "https://example.com";

const OG_KEYS = [
  "og:title",
  "og:description",
  "og:image",
  "og:url",
  "og:type",
  "og:site_name",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
] as const;

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "m-0 min-w-0 break-words",
          mono && "font-mono text-[0.8rem] tabular-nums",
          !mono && "font-medium",
        )}
        title={display === "—" ? undefined : display}
      >
        {display}
      </dd>
    </>
  );
}

function SnapshotPanel({
  label,
  mode,
  snapshot,
  emptyHint,
  screenshotPngBase64,
}: {
  label: string;
  mode?: string | null;
  snapshot: ViewSnapshot | null;
  emptyHint?: string | null;
  /** With-JS viewport PNG (base64). Omitted for No-JS. */
  screenshotPngBase64?: string | null;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </h2>
        {mode ? (
          <span className="rounded-md border border-border/80 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
            {mode}
          </span>
        ) : null}
      </div>

      {!snapshot ? (
        <p className="m-0 text-sm text-muted-foreground">{emptyHint ?? "—"}</p>
      ) : (
        <>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <Field label="Status" value={snapshot.status} mono />
            <Field label="Final URL" value={snapshot.finalUrl} mono />
            <Field label="Title" value={snapshot.title || "(none)"} />
            <Field label="Title len" value={snapshot.title ? snapshot.title.length : 0} mono />
            <Field label="Description" value={snapshot.metaDescription || "(none)"} />
            <Field
              label="Desc len"
              value={snapshot.metaDescription ? snapshot.metaDescription.length : 0}
              mono
            />
            <Field label="Canonical" value={snapshot.canonical || "(none)"} mono />
            <Field label="Robots" value={snapshot.robots || "(none)"} mono />
            <Field label="Words" value={snapshot.wordCount} mono />
            <Field label="H1s" value={snapshot.h1s.length} mono />
            <Field
              label="Links"
              value={`${snapshot.linkCount} (${snapshot.internalLinks} in / ${snapshot.externalLinks} out)`}
              mono
            />
            <Field label="HTML" value={`${snapshot.htmlBytes.toLocaleString()} B`} mono />
          </dl>

          {snapshot.h1s.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                H1
              </h3>
              <ul className="m-0 list-none space-y-0.5 p-0 text-sm">
                {snapshot.h1s.map((h, i) => (
                  <li key={`${h}-${i}`} className="truncate" title={h}>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {snapshot.headings.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Headings
              </h3>
              <ul className="m-0 max-h-40 list-none space-y-0.5 overflow-y-auto p-0 font-mono text-[0.75rem]">
                {snapshot.headings.map((h, i) => (
                  <li
                    key={`${h.level}-${h.text}-${i}`}
                    className="truncate"
                    style={{ paddingLeft: `${(h.level - 1) * 0.75}rem` }}
                    title={h.text}
                  >
                    <span className="text-muted-foreground">h{h.level}</span> {h.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {Object.keys(snapshot.og).length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                OG / Twitter
              </h3>
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.8rem]">
                {OG_KEYS.filter((k) => snapshot.og[k]).map((key) => (
                  <Field key={key} label={key} value={snapshot.og[key]} mono />
                ))}
                {Object.entries(snapshot.og)
                  .filter(([k]) => !(OG_KEYS as readonly string[]).includes(k))
                  .map(([key, value]) => (
                    <Field key={key} label={key} value={value} mono />
                  ))}
              </dl>
            </div>
          ) : null}

          {snapshot.links.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Links (sample)
              </h3>
              <ul className="m-0 max-h-36 list-none space-y-1 overflow-y-auto p-0 text-[0.75rem]">
                {snapshot.links.map((link, i) => (
                  <li key={`${link.href}-${i}`} className="flex gap-2 truncate" title={link.href}>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1 py-0.5 font-mono text-[0.65rem]",
                        link.external
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-foreground",
                      )}
                    >
                      {link.external ? "ext" : "int"}
                    </span>
                    <span className="truncate font-mono">{link.href}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-muted-foreground">Text snapshot</Label>
            <Textarea
              readOnly
              value={snapshot.text || "(empty)"}
              className="min-h-28 font-mono text-xs leading-relaxed"
            />
          </div>

          {screenshotPngBase64 ? (
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-normal text-muted-foreground">Screenshot</Label>
              <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                <img
                  src={`data:image/png;base64,${screenshotPngBase64}`}
                  alt={`${label} viewport screenshot`}
                  className="block h-auto w-full"
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-muted-foreground">HTML preview</Label>
            <Textarea
              readOnly
              value={snapshot.htmlPreview || "(empty)"}
              className="min-h-28 font-mono text-[0.7rem] leading-relaxed"
            />
          </div>
        </>
      )}
    </section>
  );
}

export function CrawlerSimulatorTool() {
  const [url, setUrl] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResult | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/crawler-simulator/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        let msg = res.statusText;
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const data = (await res.json()) as CompareResult;
      setResult(data);
      if (data.jsMode === "unavailable") {
        toast.message("No-JS ready · JS view unavailable");
      } else {
        toast.success("Crawl ready");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crawl failed");
    } finally {
      setBusy(false);
    }
  }

  const delta =
    result?.withJs && result.noJs
      ? {
          text: result.withJs.text.length - result.noJs.text.length,
          words: result.withJs.wordCount - result.noJs.wordCount,
          links: result.withJs.linkCount - result.noJs.linkCount,
          html: result.withJs.htmlBytes - result.noJs.htmlBytes,
        }
      : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 lg:gap-4">
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3 sm:flex-row sm:items-end sm:gap-3 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label
            htmlFor="crawler-simulator-url"
            className="text-xs font-normal text-muted-foreground"
          >
            URL
          </Label>
          <Input
            id="crawler-simulator-url"
            type="url"
            value={url}
            placeholder="https://example.com"
            onValueChange={setUrl}
            required
          />
        </div>
        <Button type="submit" disabled={busy || !url.trim()} className="shrink-0">
          {busy ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <BotIcon data-icon="inline-start" />
          )}
          {busy ? "Crawling…" : "Crawl"}
        </Button>
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {result ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 text-sm",
            result.likelySpa === true && "text-amber-600 dark:text-amber-400",
          )}
        >
          <span className="rounded-md border border-border/80 px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
            {result.likelySpa === true
              ? "JS adds content (thin no-JS)"
              : result.likelySpa === false
                ? "similar no-JS / JS"
                : "JS pending"}
          </span>
          {delta ? (
            <span className="font-mono text-[0.7rem] text-muted-foreground">
              Δ words {delta.words >= 0 ? "+" : ""}
              {delta.words} · Δ links {delta.links >= 0 ? "+" : ""}
              {delta.links} · Δ HTML {delta.html >= 0 ? "+" : ""}
              {delta.html.toLocaleString()} B
            </span>
          ) : null}
          {result.jsError ? (
            <span className="text-[0.75rem] text-muted-foreground">{result.jsError}</span>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <SnapshotPanel
          label="No-JS (crawler)"
          mode="raw-fetch"
          snapshot={result?.noJs ?? null}
          emptyHint="Crawl to see no-JS HTML"
        />
        <SnapshotPanel
          label="With JS (rendered)"
          mode={result?.jsMode ?? null}
          snapshot={result?.withJs ?? null}
          emptyHint={result?.jsError ?? "Crawl to see JS-rendered view"}
          screenshotPngBase64={result?.jsScreenshotPngBase64}
        />
      </div>
    </form>
  );
}

/** @deprecated Use CrawlerSimulatorTool */
export const SpaVsBotTool = CrawlerSimulatorTool;
