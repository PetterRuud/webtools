export type CaptureMode = "browser-rendering" | "node-chrome" | "node-playwright" | "mock";

export type ViewportPreset = "desktop" | "tablet" | "mobile" | "custom";

export type CaptureRequest = {
  url: string;
  width: number;
  height: number;
  fullPage: boolean;
  deviceScaleFactor: number;
};

export type CaptureResult = {
  png: Uint8Array;
  mode: CaptureMode;
};

export const VIEWPORT_PRESETS: Record<
  Exclude<ViewportPreset, "custom">,
  { width: number; height: number }
> = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};
