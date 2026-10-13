import { useEffect, useState, type FormEvent } from "react";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { ImageFileField, imagePreviewClassName } from "#/components/tools/ImageFileField";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

const CHECKER =
  "linear-gradient(45deg, color-mix(in oklab, var(--border) 70%, transparent) 25%, transparent 25%), linear-gradient(-45deg, color-mix(in oklab, var(--border) 70%, transparent) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, color-mix(in oklab, var(--border) 70%, transparent) 75%), linear-gradient(-45deg, transparent 75%, color-mix(in oklab, var(--border) 70%, transparent) 75%)";

type FitMode = "inside" | "outside" | "cover" | "contain" | "fill";

function optNumber(value: string): string {
  return value.trim();
}

export function TransparentTool() {
  const [white, setWhite] = useState<File | null>(null);
  const [black, setBlack] = useState<File | null>(null);
  const [cropLeft, setCropLeft] = useState("");
  const [cropTop, setCropTop] = useState("");
  const [cropWidth, setCropWidth] = useState("");
  const [cropHeight, setCropHeight] = useState("");
  const [resizeWidth, setResizeWidth] = useState("");
  const [resizeHeight, setResizeHeight] = useState("");
  const [resizeFit, setResizeFit] = useState<FitMode>("inside");
  const [resizeNoUpscale, setResizeNoUpscale] = useState(false);
  const [trimInputs, setTrimInputs] = useState(false);
  const [trimThreshold, setTrimThreshold] = useState("");
  const [trimResult, setTrimResult] = useState(false);
  const [trimResultThreshold, setTrimResultThreshold] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!white || !black) {
      setError("Choose both white-bg and black-bg images.");
      return;
    }

    setBusy(true);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    const fd = new FormData();
    fd.set("white", white);
    fd.set("black", black);
    if (optNumber(cropLeft)) fd.set("cropLeft", optNumber(cropLeft));
    if (optNumber(cropTop)) fd.set("cropTop", optNumber(cropTop));
    if (optNumber(cropWidth)) fd.set("cropWidth", optNumber(cropWidth));
    if (optNumber(cropHeight)) fd.set("cropHeight", optNumber(cropHeight));
    if (optNumber(resizeWidth)) fd.set("resizeWidth", optNumber(resizeWidth));
    if (optNumber(resizeHeight)) fd.set("resizeHeight", optNumber(resizeHeight));
    fd.set("resizeFit", resizeFit);
    if (resizeNoUpscale) fd.set("resizeNoUpscale", "true");
    if (trimInputs) fd.set("trimInputs", "true");
    if (optNumber(trimThreshold)) {
      fd.set("trimThreshold", optNumber(trimThreshold));
    }
    if (trimResult) fd.set("trimResult", "true");
    if (optNumber(trimResultThreshold)) {
      fd.set("trimResultThreshold", optNumber(trimResultThreshold));
    }

    try {
      const res = await fetch("/api/transparent/extract", {
        method: "POST",
        body: fd,
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
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
      toast.success("PNG ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-4"
    >
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <ImageFileField
            id="transparent-white"
            label="On white"
            file={white}
            hint="PNG or JPEG"
            onFile={setWhite}
          />
          <ImageFileField
            id="transparent-black"
            label="On black"
            file={black}
            hint="PNG or JPEG"
            onFile={setBlack}
          />
        </div>

        <fieldset className="m-0 flex flex-col gap-2.5 rounded-lg border border-border/80 bg-card/40 p-3">
          <legend className="px-1 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
            Adjust (both)
          </legend>

          <div className="grid grid-cols-2 gap-2">
            <NumField label="Crop left" value={cropLeft} onChange={setCropLeft} />
            <NumField label="Crop top" value={cropTop} onChange={setCropTop} />
            <NumField label="Crop width" value={cropWidth} onChange={setCropWidth} />
            <NumField label="Crop height" value={cropHeight} onChange={setCropHeight} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <NumField label="Resize width" value={resizeWidth} onChange={setResizeWidth} />
            <NumField label="Resize height" value={resizeHeight} onChange={setResizeHeight} />
            <div className="col-span-2 flex flex-col gap-1">
              <Label
                htmlFor="transparent-fit"
                className="text-xs font-normal text-muted-foreground"
              >
                Fit mode
              </Label>
              <Select
                value={resizeFit}
                onValueChange={(value) => {
                  if (value) setResizeFit(value as FitMode);
                }}
              >
                <SelectTrigger id="transparent-fit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inside">Inside</SelectItem>
                  <SelectItem value="outside">Outside</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CheckRow
            checked={resizeNoUpscale}
            onCheckedChange={setResizeNoUpscale}
            label="Do not enlarge"
          />
          <CheckRow
            checked={trimInputs}
            onCheckedChange={setTrimInputs}
            label="Trim transparent margins on inputs"
          />
          <NumField
            label="Input trim threshold (0–255)"
            value={trimThreshold}
            onChange={setTrimThreshold}
            placeholder="10"
          />
          <CheckRow
            checked={trimResult}
            onCheckedChange={setTrimResult}
            label="Crop result to content"
          />
          <NumField
            label="Result empty-alpha max (0–255)"
            value={trimResultThreshold}
            onChange={setTrimResultThreshold}
            placeholder="10"
          />
        </fieldset>

        <Button type="submit" disabled={busy || !white || !black}>
          {busy ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <SparklesIcon data-icon="inline-start" />
          )}
          {busy ? "Processing…" : "Generate PNG"}
        </Button>

        {error ? (
          <p className="m-0 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Result
        </h2>
        <div
          className="flex min-h-48 flex-1 items-center justify-center rounded-lg border border-border bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] p-4"
          style={{ backgroundImage: CHECKER, backgroundColor: "#2a2a2a" }}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Transparent PNG result" className={imagePreviewClassName} />
          ) : (
            <span className="text-sm text-muted-foreground">Preview after processing</span>
          )}
        </div>
        {previewUrl ? (
          <a
            href={previewUrl}
            download="transparent.png"
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            Download transparent.png
          </a>
        ) : null}
      </section>
    </form>
  );
}

function NumField({
  label,
  value,
  onChange,
  placeholder = "—",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Label className="flex flex-col gap-1 font-normal">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={0}
        value={value}
        placeholder={placeholder}
        onValueChange={onChange}
      />
    </Label>
  );
}

function CheckRow({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <Label className="gap-2 font-normal">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
      {label}
    </Label>
  );
}
