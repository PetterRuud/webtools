export type OutputFormat = "png" | "jpeg" | "webp";

export const OUTPUT_FORMATS: {
  id: OutputFormat;
  label: string;
  mime: string;
  extension: string;
  lossy: boolean;
}[] = [
  {
    id: "png",
    label: "PNG",
    mime: "image/png",
    extension: "png",
    lossy: false,
  },
  {
    id: "jpeg",
    label: "JPEG",
    mime: "image/jpeg",
    extension: "jpg",
    lossy: true,
  },
  {
    id: "webp",
    label: "WebP",
    mime: "image/webp",
    extension: "webp",
    lossy: true,
  },
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function outputFileName(sourceName: string, format: OutputFormat): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "converted";
  const extension = OUTPUT_FORMATS.find((item) => item.id === format)?.extension ?? format;
  return `${base}.${extension}`;
}

/** Fast path from name/MIME before loading the HEIC decoder. */
export function looksLikeHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) return true;
  const type = file.type.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence"
  );
}

type HeicModule = typeof import("heic-to");

let heicModulePromise: Promise<HeicModule> | null = null;

function loadHeicModule(): Promise<HeicModule> {
  heicModulePromise ??= import("heic-to");
  return heicModulePromise;
}

export async function isHeicFile(file: File): Promise<boolean> {
  if (looksLikeHeic(file)) {
    try {
      const { isHeic } = await loadHeicModule();
      return await isHeic(file);
    } catch {
      // Fall through — some browsers omit HEIC MIME; trust the extension.
      return true;
    }
  }
  // Empty MIME + HEIC magic still happens on some Android pickers.
  if (!file.type) {
    try {
      const { isHeic } = await loadHeicModule();
      return await isHeic(file);
    } catch {
      return false;
    }
  }
  return false;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode that image"));
    };
    image.src = url;
  });
}

async function loadDrawable(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
}> {
  if (await isHeicFile(file)) {
    try {
      const { heicTo } = await loadHeicModule();
      const bitmap = await heicTo({ blob: file, type: "bitmap" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "HEIC decode failed";
      throw new Error(
        `Could not decode HEIC/HEIF (${message}). Try another export from the camera roll.`,
      );
    }
  }

  const image = await loadImage(file);
  return {
    source: image,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
}

/** Browser-safe preview URL (decodes HEIC when needed). Caller must revoke. */
export async function createSourcePreviewUrl(file: File): Promise<string> {
  if (!(await isHeicFile(file))) {
    return URL.createObjectURL(file);
  }
  const { heicTo } = await loadHeicModule();
  const blob = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.88,
  });
  return URL.createObjectURL(blob);
}

export async function convertImageFormat(
  file: File,
  format: OutputFormat,
  quality: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const meta = OUTPUT_FORMATS.find((item) => item.id === format);
  if (!meta) throw new Error("Unknown output format");

  const loaded = await loadDrawable(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = loaded.width;
    canvas.height = loaded.height;
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("Image has no dimensions");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable in this browser");

    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(loaded.source, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      if (meta.lossy) {
        canvas.toBlob(resolve, meta.mime, quality);
      } else {
        canvas.toBlob(resolve, meta.mime);
      }
    });

    if (!blob) {
      throw new Error(`This browser could not encode ${meta.label}. Try PNG or JPEG.`);
    }

    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    loaded.close?.();
  }
}
