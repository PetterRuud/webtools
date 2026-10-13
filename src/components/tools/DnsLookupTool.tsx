import { Loader2Icon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import type { CheckStatus } from "#/lib/emailDns";
import { checkEmailDnsFn, lookupDnsFn } from "#/lib/networkFns";
import { cn } from "cn";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "SRV", "CAA"] as const;

type Mode = "records" | "email";

type DnsResult = Awaited<ReturnType<typeof lookupDnsFn>>;
type DnsRecord = DnsResult["answer"][number];
type EmailResult = Awaited<ReturnType<typeof checkEmailDnsFn>>;

const STATUS_STYLE: Record<CheckStatus, string> = {
  pass: "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  warn: "border-amber-500/35 bg-amber-500/15 text-amber-900 dark:text-amber-100",
  fail: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-border bg-muted/50 text-muted-foreground",
};

function RecordTable({ title, rows }: { title: string; rows: DnsRecord[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-border/70">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted/50 text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">TTL</th>
              <th className="px-3 py-2 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.name}-${row.data}-${index}`} className="border-t border-border/60">
                <td className="px-3 py-2 font-mono text-[0.8rem]">{row.name}</td>
                <td className="px-3 py-2 font-mono text-[0.8rem] tabular-nums">{row.TTL}</td>
                <td className="px-3 py-2 break-all font-mono text-[0.8rem]">{row.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(
        [
          { id: "records", label: "Records" },
          { id: "email", label: "Email setup" },
        ] as const
      ).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            mode === item.id
              ? "inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground"
              : "inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function EmailChecks({ result }: { result: EmailResult }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-sm text-foreground">{result.domain}</span>
        <span className="text-xs text-muted-foreground">
          {result.summary.pass} pass · {result.summary.warn} warn · {result.summary.fail} fail
          {result.summary.info ? ` · ${result.summary.info} info` : ""}
        </span>
        <span className="text-xs text-muted-foreground">{result.resolver}</span>
      </div>

      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {result.checks.map((check) => (
          <li key={check.id} className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-5 min-w-10 items-center justify-center rounded px-1.5 text-[0.65rem] font-semibold tracking-wide uppercase",
                  STATUS_STYLE[check.status],
                )}
              >
                {check.status}
              </span>
              <span className="text-sm font-medium text-foreground">{check.label}</span>
              <span className="text-sm text-muted-foreground">{check.detail}</span>
            </div>
            {check.records && check.records.length > 0 ? (
              <ul className="mt-1.5 mb-0 list-none space-y-0.5 p-0">
                {check.records.map((record, index) => (
                  <li
                    key={`${check.id}-${index}`}
                    className="break-all font-mono text-[0.75rem] text-muted-foreground"
                  >
                    {record}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="m-0 text-[0.7rem] text-muted-foreground">
        DNS only — does not prove mailbox exists, keys publish correctly to all selectors, or inbox
        placement.
      </p>
    </div>
  );
}

export function DnsLookupTool() {
  const lookupDns = useServerFn(lookupDnsFn);
  const checkEmail = useServerFn(checkEmailDnsFn);
  const [mode, setMode] = useState<Mode>("records");
  const [name, setName] = useState("cloudflare.com");
  const [type, setType] = useState<(typeof RECORD_TYPES)[number]>("A");
  const [result, setResult] = useState<DnsResult | null>(null);
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    const host = name.trim();
    if (!host) {
      setError("Enter a hostname");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === "email") {
        const data = await checkEmail({ data: { domain: host } });
        setEmailResult(data);
        setResult(null);
      } else {
        const data = await lookupDns({ data: { name: host, type } });
        setResult(data);
        setEmailResult(null);
      }
    } catch (err) {
      setResult(null);
      setEmailResult(null);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ModeToggle mode={mode} onChange={setMode} />

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dns-name">{mode === "email" ? "Domain" : "Name"}</Label>
          <Input
            id="dns-name"
            value={name}
            onValueChange={setName}
            spellCheck={false}
            autoComplete="off"
            className="font-mono"
            placeholder={mode === "email" ? "example.com or user@example.com" : undefined}
            onKeyDown={(event) => {
              if (event.key === "Enter") void run();
            }}
          />
        </div>
        <Button type="button" disabled={loading} onClick={() => void run()}>
          {loading ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <SearchIcon data-icon="inline-start" />
          )}
          {mode === "email" ? "Check" : "Lookup"}
        </Button>
      </div>

      {mode === "records" ? (
        <div className="flex flex-wrap gap-1.5">
          {RECORD_TYPES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              className={
                type === item
                  ? "inline-flex h-7 items-center rounded-md bg-primary px-2.5 font-mono text-xs font-medium text-primary-foreground"
                  : "inline-flex h-7 items-center rounded-md border border-border/80 bg-card/40 px-2.5 font-mono text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="m-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {mode === "email" && emailResult ? <EmailChecks result={emailResult} /> : null}

      {mode === "records" && result ? (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
              <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                Status
              </p>
              <p className="m-0 font-mono text-sm text-foreground">
                {result.statusText} ({result.status})
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
              <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                Query
              </p>
              <p className="m-0 break-all font-mono text-sm text-foreground">
                {result.name} · {result.type}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
              <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                Resolver
              </p>
              <p className="m-0 font-mono text-sm text-foreground">{result.resolver}</p>
            </div>
            {result.answer.length === 0 &&
            result.authority.length === 0 &&
            result.additional.length === 0 ? (
              <p className="m-0 text-sm text-muted-foreground">No records.</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            <RecordTable title="Answer" rows={result.answer} />
            <RecordTable title="Authority" rows={result.authority} />
            <RecordTable title="Additional" rows={result.additional} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
