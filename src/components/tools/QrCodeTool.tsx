import { useEffect, useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Slider } from "#/components/ui/slider";
import { Textarea } from "#/components/ui/textarea";
import { downloadDataUrl, generateQrDataUrl, type QrErrorCorrection } from "#/lib/qrcode";

const SAMPLE = "https://example.com";
const ECC_LEVELS: Array<{ id: QrErrorCorrection; label: string }> = [
  { id: "L", label: "L" },
  { id: "M", label: "M" },
  { id: "Q", label: "Q" },
  { id: "H", label: "H" },
];

export function QrCodeTool() {
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>("M");
  const [darkColor, setDarkColor] = useState("#0f172a");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const trimmed = text.trim();
    if (!trimmed) {
      setDataUrl(null);
      setError(null);
      return;
    }

    setBusy(true);
    const handle = window.setTimeout(() => {
      void generateQrDataUrl({
        text: trimmed,
        size,
        margin,
        errorCorrection,
        darkColor,
        lightColor,
      })
        .then((url) => {
          if (cancelled) return;
          setDataUrl(url);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setDataUrl(null);
          setError(err instanceof Error ? err.message : "Could not generate QR");
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [text, size, margin, errorCorrection, darkColor, lightColor]);

  function downloadPng() {
    if (!dataUrl) {
      toast.error("Nothing to download");
      return;
    }
    downloadDataUrl(dataUrl, "qrcode.png");
    toast.success("Downloaded PNG");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="bg-card flex flex-col gap-3 rounded-xl border border-border/80 p-3 sm:p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="qr-text">Text / URL</Label>
            <Button type="button" size="sm" variant="ghost" onClick={() => setText(SAMPLE)}>
              Sample
            </Button>
          </div>
          <Textarea
            id="qr-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
            placeholder="https://…"
            className="min-h-28 font-mono text-[0.8rem] leading-5"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label id="qr-size-label">Size</Label>
            <span className="text-sm tabular-nums text-muted-foreground">{size}px</span>
          </div>
          <Slider
            aria-labelledby="qr-size-label"
            min={128}
            max={1024}
            step={8}
            value={[size]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              if (typeof next === "number") setSize(next);
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label id="qr-margin-label">Margin</Label>
            <span className="text-sm tabular-nums text-muted-foreground">{margin}</span>
          </div>
          <Slider
            aria-labelledby="qr-margin-label"
            min={0}
            max={8}
            step={1}
            value={[margin]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              if (typeof next === "number") setMargin(next);
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Error correction</Label>
          <div className="flex flex-wrap gap-1.5">
            {ECC_LEVELS.map((level) => (
              <Button
                key={level.id}
                type="button"
                size="sm"
                variant={errorCorrection === level.id ? "default" : "outline"}
                onClick={() => setErrorCorrection(level.id)}
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qr-dark">Dark</Label>
            <div className="flex items-center gap-2">
              <Input
                id="qr-dark"
                type="color"
                value={darkColor}
                onChange={(event) => setDarkColor(event.target.value)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                value={darkColor}
                onChange={(event) => setDarkColor(event.target.value)}
                spellCheck={false}
                className="font-mono text-xs uppercase"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qr-light">Light</Label>
            <div className="flex items-center gap-2">
              <Input
                id="qr-light"
                type="color"
                value={lightColor}
                onChange={(event) => setLightColor(event.target.value)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                value={lightColor}
                onChange={(event) => setLightColor(event.target.value)}
                spellCheck={false}
                className="font-mono text-xs uppercase"
              />
            </div>
          </div>
        </div>

        {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/50 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <Label>Preview</Label>
          <Button type="button" size="sm" disabled={!dataUrl || busy} onClick={downloadPng}>
            {busy ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            Download PNG
          </Button>
        </div>

        <div className="flex min-h-64 items-center justify-center p-2">
          {dataUrl ? (
            <div className="relative w-full max-w-72 rounded-xl border border-border/90 bg-card p-4">
              <div className="rounded-lg border border-border/60 bg-white p-3">
                <img
                  src={dataUrl}
                  alt="Generated QR code"
                  width={Math.min(size, 280)}
                  height={Math.min(size, 280)}
                  className="mx-auto max-h-64 max-w-full object-contain"
                />
              </div>
              <p className="m-0 mt-3 truncate text-center font-mono text-[0.65rem] tracking-wide text-muted-foreground">
                {text.trim() || "—"}
              </p>
              <p className="m-0 mt-1 text-center font-mono text-[0.6rem] tabular-nums text-muted-foreground/80">
                {size}×{size} · ECC {errorCorrection}
                {busy ? " · …" : ""}
              </p>
            </div>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">
              {busy ? "Generating…" : "Enter text to generate"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
