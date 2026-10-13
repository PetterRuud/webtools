import { useState, type FormEvent } from "react";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { SAMPLE_ROBOTS } from "#/lib/robotsTxt";
import { checkRobotsTxtFn } from "#/lib/seoFns";
import { cn } from "cn";

type RobotsResult = Awaited<ReturnType<typeof checkRobotsTxtFn>>;

export function RobotsTxtTool() {
  const checkRobots = useServerFn(checkRobotsTxtFn);
  const [url, setUrl] = useState("https://example.com");
  const [paths, setPaths] = useState("/\n/admin\n/blog/post\n/private/secret");
  const [userAgent, setUserAgent] = useState("*");
  const [robotsText, setRobotsText] = useState("");
  const [usePaste, setUsePaste] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RobotsResult | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await checkRobots({
        data: {
          url: usePaste ? undefined : url,
          paths,
          userAgent,
          robotsText: usePaste ? robotsText : null,
        },
      });
      setResult(data);
      toast.success("robots.txt checked");
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 lg:gap-4">
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: false, label: "Fetch URL" },
            { id: true, label: "Paste robots.txt" },
          ] as const
        ).map((item) => (
          <button
            key={String(item.id)}
            type="button"
            onClick={() => setUsePaste(item.id)}
            className={
              usePaste === item.id
                ? "inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground"
                : "inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
          {!usePaste ? (
            <div className="flex flex-col gap-1">
              <Label htmlFor="robots-url" className="text-xs font-normal text-muted-foreground">
                Site URL
              </Label>
              <Input
                id="robots-url"
                value={url}
                onValueChange={setUrl}
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="robots-raw" className="text-xs font-normal text-muted-foreground">
                  robots.txt
                </Label>
                <button
                  type="button"
                  className="text-[0.7rem] text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => setRobotsText(SAMPLE_ROBOTS)}
                >
                  Sample
                </button>
              </div>
              <Textarea
                id="robots-raw"
                value={robotsText}
                onChange={(e) => setRobotsText(e.target.value)}
                className="min-h-40 font-mono text-xs"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="robots-ua" className="text-xs font-normal text-muted-foreground">
              User-agent
            </Label>
            <Input id="robots-ua" value={userAgent} onValueChange={setUserAgent} placeholder="*" />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="robots-paths" className="text-xs font-normal text-muted-foreground">
              Paths to test (one per line)
            </Label>
            <Textarea
              id="robots-paths"
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              className="min-h-28 font-mono text-xs"
            />
          </div>

          <Button type="submit" disabled={busy} className="w-fit">
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <ShieldCheckIcon data-icon="inline-start" />
            )}
            {busy ? "Checking…" : "Check"}
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
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {result.robotsUrl ? (
                  <span className="font-mono">{result.robotsUrl}</span>
                ) : (
                  <span>Pasted robots.txt</span>
                )}
                {result.status != null ? (
                  <span className="font-mono">HTTP {result.status}</span>
                ) : null}
                <span>{result.rules.length} rule group(s)</span>
              </div>

              {result.checks.length > 0 ? (
                <ul className="m-0 list-none space-y-1.5 p-0">
                  {result.checks.map((check) => (
                    <li
                      key={check.path}
                      className={cn(
                        "flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-sm",
                        check.allowed
                          ? "border-emerald-500/35 bg-emerald-500/10"
                          : "border-destructive/40 bg-destructive/10",
                      )}
                    >
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase",
                          check.allowed
                            ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                            : "bg-destructive/20 text-destructive",
                        )}
                      >
                        {check.allowed ? "allow" : "disallow"}
                      </span>
                      <span className="font-mono text-[0.8rem]">{check.path}</span>
                      {check.matchedBy ? (
                        <span className="text-xs text-muted-foreground">{check.matchedBy}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">no rule match</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 text-sm text-muted-foreground">No paths to test.</p>
              )}

              {result.sitemaps.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <h3 className="m-0 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                    Sitemaps
                  </h3>
                  <ul className="m-0 list-none space-y-0.5 p-0 font-mono text-[0.75rem]">
                    {result.sitemaps.map((s) => (
                      <li key={s} className="truncate" title={s}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-normal text-muted-foreground">Raw</Label>
                <Textarea
                  readOnly
                  value={result.raw}
                  className="min-h-40 font-mono text-[0.7rem]"
                />
              </div>
            </>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">
              Check to see allow/disallow for each path.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
