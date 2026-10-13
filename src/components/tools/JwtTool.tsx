import { useEffect, useMemo, useState } from "react";
import { CopyIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { copyText } from "#/lib/clipboard";
import { decodeJwt, encodeJwt, prettyJson } from "#/lib/jwt";

type Mode = "decode" | "encode";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ3ZWJ0b29scyIsIm5hbWUiOiJQZXR0ZXIiLCJpYXQiOjE3MTAwMDAwMDB9.signature";

const DEFAULT_HEADER = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

const DEFAULT_PAYLOAD = `{
  "sub": "webtools",
  "name": "Petter",
  "iat": 1710000000
}`;

export function JwtTool() {
  const [mode, setMode] = useState<Mode>("decode");
  const [token, setToken] = useState("");
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState("");
  const [encoded, setEncoded] = useState("");
  const [encodeError, setEncodeError] = useState<string | null>(null);

  const decoded = useMemo(() => decodeJwt(token), [token]);

  useEffect(() => {
    if (mode !== "encode") return;
    let cancelled = false;
    void encodeJwt({ header, payload, secret }).then((result) => {
      if (cancelled) return;
      if ("error" in result) {
        setEncoded("");
        setEncodeError(result.error);
      } else {
        setEncoded(result.token);
        setEncodeError(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, header, payload, secret]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => setMode("decode")}
        >
          Decode
        </Button>
        <Button
          type="button"
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => setMode("encode")}
        >
          Encode
        </Button>
        {mode === "decode" ? (
          <Button type="button" variant="ghost" onClick={() => setToken(SAMPLE)}>
            Sample
          </Button>
        ) : null}
      </div>

      {mode === "decode" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jwt-token">Token</Label>
            <Textarea
              id="jwt-token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              spellCheck={false}
              placeholder="eyJhbGciOi…"
              className="min-h-48 font-mono text-[0.8rem] leading-5"
            />
            {decoded.ok === false && token.trim() ? (
              <p className="m-0 text-sm text-destructive">{decoded.error}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            {decoded.ok ? (
              <>
                <PartBlock
                  title="Header"
                  value={prettyJson(decoded.header.json)}
                  onCopy={() => void copyText(prettyJson(decoded.header.json), "header")}
                />
                <PartBlock
                  title="Payload"
                  value={prettyJson(decoded.payload.json)}
                  onCopy={() => void copyText(prettyJson(decoded.payload.json), "payload")}
                />
                <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                      Signature
                    </span>
                    <span className="text-[0.7rem] text-muted-foreground">
                      {decoded.signed ? "present (not verified)" : "empty"}
                    </span>
                  </div>
                  <p className="m-0 break-all font-mono text-[0.75rem] text-foreground">
                    {decoded.signature || "—"}
                  </p>
                </div>
              </>
            ) : (
              <p className="m-0 text-sm text-muted-foreground">Decoded parts appear here.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jwt-header">Header</Label>
              <Textarea
                id="jwt-header"
                value={header}
                onChange={(event) => setHeader(event.target.value)}
                spellCheck={false}
                className="min-h-28 font-mono text-[0.8rem] leading-5"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jwt-payload">Payload</Label>
              <Textarea
                id="jwt-payload"
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                spellCheck={false}
                className="min-h-36 font-mono text-[0.8rem] leading-5"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jwt-secret">Secret (HS256)</Label>
              <Input
                id="jwt-secret"
                type="password"
                value={secret}
                onValueChange={setSecret}
                placeholder="Local only — never sent"
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="jwt-encoded">JWT</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!encoded}
                onClick={() => void copyText(encoded, "JWT")}
              >
                <CopyIcon data-icon="inline-start" />
                Copy
              </Button>
            </div>
            <Textarea
              id="jwt-encoded"
              value={encoded}
              readOnly
              spellCheck={false}
              className="min-h-64 font-mono text-[0.8rem] leading-5"
              placeholder={encodeError ?? "Token updates as you edit…"}
            />
            {encodeError ? <p className="m-0 text-sm text-destructive">{encodeError}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}

function PartBlock({ title, value, onCopy }: { title: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{title}</Label>
        <Button type="button" size="sm" variant="outline" onClick={onCopy}>
          <CopyIcon data-icon="inline-start" />
          Copy
        </Button>
      </div>
      <Textarea
        value={value}
        readOnly
        spellCheck={false}
        className="min-h-28 font-mono text-[0.8rem] leading-5"
      />
    </div>
  );
}
