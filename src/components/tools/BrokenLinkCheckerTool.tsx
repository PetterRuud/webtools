import { useState, type FormEvent } from "react";
import { Link2OffIcon, Loader2Icon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { MAX_LINKS_TO_CHECK } from "#/lib/brokenLinks";
import { HTTP_STATUS_CLASS_STYLES, type HttpStatusClass } from "#/lib/httpStatus";
import { checkBrokenLinksFn } from "#/lib/seoFns";
import { cn } from "cn";

type BrokenResult = Awaited<ReturnType<typeof checkBrokenLinksFn>>;

function statusClass(code: number): HttpStatusClass {
  if (code >= 500) return "5xx";
  if (code >= 400) return "4xx";
  if (code >= 300) return "3xx";
  if (code >= 200) return "2xx";
  return "1xx";
}

export function BrokenLinkCheckerTool() {
  const checkLinks = useServerFn(checkBrokenLinksFn);
  const [url, setUrl] = useState("https://example.com");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BrokenResult | null>(null);
  const [filter, setFilter] = useState<"all" | "broken" | "ok" | "internal" | "external">("all");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await checkLinks({
        data: { url, maxLinks: MAX_LINKS_TO_CHECK },
      });
      setResult(data);
      setFilter(data.broken > 0 ? "broken" : "all");
      toast.success(
        data.broken > 0 ? `${data.broken} broken of ${data.checked}` : `${data.checked} links OK`,
      );
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setBusy(false);
    }
  }

  const visible =
    result?.links.filter((link) => {
      if (filter === "broken") return !link.ok;
      if (filter === "ok") return link.ok;
      if (filter === "internal") return !link.external;
      if (filter === "external") return link.external;
      return true;
    }) ?? [];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 lg:gap-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="broken-url" className="text-xs font-normal text-muted-foreground">
              Page URL
            </Label>
            <Input
              id="broken-url"
              value={url}
              onValueChange={setUrl}
              placeholder="https://example.com"
              autoComplete="url"
            />
          </div>
          <p className="m-0 text-[0.7rem] text-muted-foreground">
            Fetches the page, extracts links, checks up to {MAX_LINKS_TO_CHECK} unique URLs.
          </p>
          <Button type="submit" disabled={busy} className="w-fit">
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <Link2OffIcon data-icon="inline-start" />
            )}
            {busy ? "Scanning…" : "Check links"}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {error ? (
            <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {result ? (
            <>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono text-foreground">{result.finalUrl}</span>
                <span className="font-mono">HTTP {result.status}</span>
                <span>
                  {result.checked} checked
                  {result.capped ? ` (cap ${MAX_LINKS_TO_CHECK})` : ""}
                </span>
                <span>
                  {result.internalLinks} internal · {result.externalLinks} external
                </span>
                <span
                  className={
                    result.broken > 0
                      ? "font-medium text-destructive"
                      : "text-emerald-700 dark:text-emerald-300"
                  }
                >
                  {result.broken} broken · {result.ok} ok
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "broken", label: "Broken" },
                    { id: "ok", label: "OK" },
                    { id: "internal", label: "Internal" },
                    { id: "external", label: "External" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={
                      filter === item.id
                        ? "inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground"
                        : "inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <ul className="m-0 max-h-[32rem] list-none space-y-1.5 overflow-y-auto p-0">
                {visible.map((link) => {
                  const klass =
                    link.status != null && link.status > 0 ? statusClass(link.status) : "5xx";
                  const styles = HTTP_STATUS_CLASS_STYLES[klass];
                  return (
                    <li
                      key={`${link.href}-${link.text}`}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        link.ok ? styles.card : "border-destructive/40 bg-destructive/10",
                      )}
                    >
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        {link.status != null ? (
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tabular-nums",
                              link.ok ? styles.badge : "bg-destructive/20 text-destructive",
                            )}
                          >
                            {link.status}
                          </span>
                        ) : (
                          <span className="rounded bg-destructive/20 px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold text-destructive">
                            ERR
                          </span>
                        )}
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[0.65rem] font-medium uppercase",
                            link.external
                              ? "bg-sky-500/15 text-sky-900 dark:text-sky-100"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {link.external ? "external" : "internal"}
                        </span>
                        {link.ms != null ? (
                          <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground">
                            {link.ms} ms
                          </span>
                        ) : null}
                      </div>
                      <p className="m-0 mt-1 truncate text-sm text-foreground" title={link.text}>
                        {link.text}
                      </p>
                      <p
                        className="m-0 mt-0.5 break-all font-mono text-[0.7rem] text-muted-foreground"
                        title={link.href}
                      >
                        {link.href}
                      </p>
                      {link.error ? (
                        <p className="m-0 mt-1 text-xs text-destructive">{link.error}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              {visible.length === 0 ? (
                <p className="m-0 text-sm text-muted-foreground">No links in this filter.</p>
              ) : null}
            </>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">
              Scan a page for broken internal and external links.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
