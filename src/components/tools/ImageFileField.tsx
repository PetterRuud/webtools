import {
  useRef,
  useState,
  type ComponentProps,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { cn } from "cn";

/** @deprecated Kept for callers that styled the old file input chrome. */
export const imageFileInputClassName =
  "file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80";

/** Full-size preview — never clip with fixed/max height. */
export const imagePreviewClassName = "mx-auto h-auto w-full max-w-full object-contain";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileMatchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1);
      if (type.startsWith(prefix)) return true;
      // Some OS/browser drops omit MIME; allow common image extensions for image/*.
      if (prefix === "image/") {
        return /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i.test(name);
      }
      return false;
    }
    return type === token;
  });
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

type ImageFileFieldProps = {
  id: string;
  label?: ReactNode;
  accept?: string;
  /** Selected file for dense status inside the dropzone. */
  file?: File | null;
  /** Short type hint under the main drop copy (e.g. "PNG or JPEG"). */
  hint?: ReactNode;
  onFile: (file: File | null) => void;
  meta?: ReactNode;
  className?: string;
  inputClassName?: string;
  inputRef?: Ref<HTMLInputElement>;
  disabled?: boolean;
} & Omit<
  ComponentProps<"input">,
  "id" | "type" | "accept" | "onChange" | "className" | "ref" | "disabled"
>;

export function ImageFileField({
  id,
  label = "Image",
  accept = "image/*",
  file = null,
  hint,
  onFile,
  meta,
  className,
  inputClassName,
  inputRef,
  disabled = false,
  ...inputProps
}: ImageFileFieldProps) {
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const setInputRef = (node: HTMLInputElement | null) => {
    localInputRef.current = node;
    assignRef(inputRef, node);
  };

  const openPicker = () => {
    if (disabled) return;
    localInputRef.current?.click();
  };

  const applyFile = (next: File | null) => {
    if (disabled) return;
    onFile(next);
    if (!next && localInputRef.current) {
      localInputRef.current.value = "";
    }
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.dataTransfer.types.includes("Files")) return;
    dragDepthRef.current += 1;
    setDragging(true);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setDragging(false);
    const next = event.dataTransfer.files?.[0] ?? null;
    if (!next) return;
    if (!fileMatchesAccept(next, accept)) return;
    applyFile(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-controls={id}
        aria-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-6 text-center outline-none transition-colors",
          "hover:border-border hover:bg-muted/45",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          dragging && "border-primary bg-primary/5",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <input
          {...inputProps}
          ref={setInputRef}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          className={cn("sr-only", inputClassName)}
          onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
          onClick={(event) => {
            // Allow re-selecting the same file.
            event.currentTarget.value = "";
          }}
        />
        <UploadIcon className="size-5 text-muted-foreground" aria-hidden />
        {file ? (
          <div className="flex min-w-0 flex-col items-center gap-0.5">
            <p className="m-0 max-w-full truncate text-sm font-medium">{file.name}</p>
            <p className="m-0 text-xs text-muted-foreground">
              {formatBytes(file.size)} · Drop to replace, or browse
            </p>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col items-center gap-0.5">
            <p className="m-0 text-sm">
              Drop an image, or{" "}
              <span className="font-medium text-foreground underline-offset-4">browse</span>
            </p>
            {hint ? <p className="m-0 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            openPicker();
          }}
        >
          {file ? "Replace" : "Browse"}
        </Button>
      </div>
      {meta}
    </div>
  );
}

type ImagePreviewFrameProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export function ImagePreviewFrame({ children, className, innerClassName }: ImagePreviewFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border/80 bg-muted/40 p-3",
        className,
      )}
    >
      <div className={cn("overflow-hidden rounded-md bg-card/80", innerClassName)}>{children}</div>
    </div>
  );
}
