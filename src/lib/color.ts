export type Rgba = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type ColorFormat = "hex" | "rgba" | "hsl" | "hwb" | "oklch";

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function clampChannel(value: number, max = 255): number {
  return clamp(value, 0, max);
}

function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatAlpha(a: number): string {
  const clamped = clamp(a, 0, 1);
  if (Number.isInteger(clamped)) return String(clamped);
  return clamped.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatPercent(value: number, digits = 1): string {
  const n = round(value, digits);
  return Number.isInteger(n) ? String(n) : String(n);
}

function parseNumberToken(raw: string): number | null {
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

function parseAlphaToken(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const trimmed = raw.trim();
  if (trimmed.endsWith("%")) {
    const value = Number.parseFloat(trimmed.slice(0, -1));
    if (!Number.isFinite(value)) return 1;
    return clamp(value / 100, 0, 1);
  }
  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value)) return 1;
  return clamp(value, 0, 1);
}

function parsePercentToken(raw: string, allowUnitless = false): number | null {
  const trimmed = raw.trim();
  if (trimmed.endsWith("%")) {
    const value = Number.parseFloat(trimmed.slice(0, -1));
    return Number.isFinite(value) ? value : null;
  }
  if (!allowUnitless) return null;
  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : null;
}

function parseHueToken(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase();
  const match = trimmed.match(/^(-?[\d.]+)(deg|grad|rad|turn)?$/);
  if (!match) return null;
  const value = Number.parseFloat(match[1]!);
  if (!Number.isFinite(value)) return null;
  const unit = match[2] ?? "deg";
  switch (unit) {
    case "grad":
      return value * 0.9;
    case "rad":
      return (value * 180) / Math.PI;
    case "turn":
      return value * 360;
    default:
      return value;
  }
}

function normalizeHue(hue: number): number {
  const mod = hue % 360;
  return mod < 0 ? mod + 360 : mod;
}

function splitColorArgs(body: string): string[] | null {
  const trimmed = body.trim();
  if (!trimmed) return null;

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  const slashParts = trimmed.split(/\s*\/\s*/);
  if (slashParts.length > 2) return null;
  const main = slashParts[0]!.trim().split(/\s+/).filter(Boolean);
  if (slashParts[1]) main.push(slashParts[1].trim());
  return main.length ? main : null;
}

export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((ch) => `${ch}${ch}`)
      .join("")
      .toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{4}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((ch) => `${ch}${ch}`)
      .join("")
      .toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{8}$/.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  return null;
}

export function hexToRgba(hexInput: string): Rgba | null {
  const hex = normalizeHex(hexInput);
  if (!hex) return null;
  const body = hex.slice(1);
  if (body.length === 6) {
    return {
      r: Number.parseInt(body.slice(0, 2), 16),
      g: Number.parseInt(body.slice(2, 4), 16),
      b: Number.parseInt(body.slice(4, 6), 16),
      a: 1,
    };
  }
  return {
    r: Number.parseInt(body.slice(0, 2), 16),
    g: Number.parseInt(body.slice(2, 4), 16),
    b: Number.parseInt(body.slice(4, 6), 16),
    a: Number.parseInt(body.slice(6, 8), 16) / 255,
  };
}

export function rgbaToHex({ r, g, b, a }: Rgba, includeAlpha = a < 1): string {
  const toHex = (n: number) => clampChannel(Math.round(n)).toString(16).padStart(2, "0");
  const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (!includeAlpha) return base;
  return `${base}${toHex(clamp(a, 0, 1) * 255)}`;
}

export function formatRgba({ r, g, b, a }: Rgba): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${formatAlpha(a)})`;
}

export function parseRgba(input: string): Rgba | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^rgba?\(\s*(.+)\s*\)$/i);
  if (!match) return null;
  const args = splitColorArgs(match[1]!);
  if (!args || (args.length !== 3 && args.length !== 4)) return null;

  const parseRgbChannel = (token: string): number | null => {
    if (token.endsWith("%")) {
      const pct = parsePercentToken(token);
      if (pct === null) return null;
      return clampChannel((pct / 100) * 255);
    }
    const value = parseNumberToken(token);
    if (value === null) return null;
    return clampChannel(value);
  };

  const r = parseRgbChannel(args[0]!);
  const g = parseRgbChannel(args[1]!);
  const b = parseRgbChannel(args[2]!);
  if (r === null || g === null || b === null) return null;
  return { r, g, b, a: parseAlphaToken(args[3]) };
}

function rgbaToHsl({ r, g, b, a }: Rgba): {
  h: number;
  s: number;
  l: number;
  a: number;
} {
  const rn = clampChannel(r) / 255;
  const gn = clampChannel(g) / 255;
  const bn = clampChannel(b) / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: normalizeHue(h),
    s: s * 100,
    l: l * 100,
    a: clamp(a, 0, 1),
  };
}

function hslToRgba(h: number, s: number, l: number, a = 1): Rgba {
  const hue = normalizeHue(h);
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (hue < 60) [rn, gn, bn] = [c, x, 0];
  else if (hue < 120) [rn, gn, bn] = [x, c, 0];
  else if (hue < 180) [rn, gn, bn] = [0, c, x];
  else if (hue < 240) [rn, gn, bn] = [0, x, c];
  else if (hue < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];

  return {
    r: (rn + m) * 255,
    g: (gn + m) * 255,
    b: (bn + m) * 255,
    a: clamp(a, 0, 1),
  };
}

export function formatHsl(color: Rgba): string {
  const { h, s, l, a } = rgbaToHsl(color);
  const hue = round(h, 1);
  const sat = formatPercent(s);
  const light = formatPercent(l);
  if (a < 1) {
    return `hsla(${hue}, ${sat}%, ${light}%, ${formatAlpha(a)})`;
  }
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

export function parseHsl(input: string): Rgba | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^hsla?\(\s*(.+)\s*\)$/i);
  if (!match) return null;
  const args = splitColorArgs(match[1]!);
  if (!args || (args.length !== 3 && args.length !== 4)) return null;

  const h = parseHueToken(args[0]!);
  const s = parsePercentToken(args[1]!, true);
  const l = parsePercentToken(args[2]!, true);
  if (h === null || s === null || l === null) return null;
  return hslToRgba(h, s, l, parseAlphaToken(args[3]));
}

function rgbaToHwb({ r, g, b, a }: Rgba): {
  h: number;
  w: number;
  bl: number;
  a: number;
} {
  const { h } = rgbaToHsl({ r, g, b, a });
  const rn = clampChannel(r) / 255;
  const gn = clampChannel(g) / 255;
  const bn = clampChannel(b) / 255;
  const white = Math.min(rn, gn, bn);
  const black = 1 - Math.max(rn, gn, bn);
  return {
    h,
    w: white * 100,
    bl: black * 100,
    a: clamp(a, 0, 1),
  };
}

function hwbToRgba(h: number, w: number, bl: number, a = 1): Rgba {
  let white = clamp(w, 0, 100) / 100;
  let black = clamp(bl, 0, 100) / 100;
  if (white + black > 1) {
    const sum = white + black;
    white /= sum;
    black /= sum;
  }
  const { r, g, b } = hslToRgba(h, 100, 50, 1);
  const mix = (channel: number) => {
    const normalized = clampChannel(channel) / 255;
    return (normalized * (1 - white - black) + white) * 255;
  };
  return {
    r: mix(r),
    g: mix(g),
    b: mix(b),
    a: clamp(a, 0, 1),
  };
}

export function formatHwb(color: Rgba): string {
  const { h, w, bl, a } = rgbaToHwb(color);
  const hue = round(h, 1);
  const white = formatPercent(w);
  const black = formatPercent(bl);
  if (a < 1) {
    return `hwb(${hue} ${white}% ${black}% / ${formatAlpha(a)})`;
  }
  return `hwb(${hue} ${white}% ${black}%)`;
}

export function parseHwb(input: string): Rgba | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^hwb\(\s*(.+)\s*\)$/i);
  if (!match) return null;
  const args = splitColorArgs(match[1]!);
  if (!args || (args.length !== 3 && args.length !== 4)) return null;

  const h = parseHueToken(args[0]!);
  const w = parsePercentToken(args[1]!, true);
  const bl = parsePercentToken(args[2]!, true);
  if (h === null || w === null || bl === null) return null;
  return hwbToRgba(h, w, bl, parseAlphaToken(args[3]));
}

function srgbToLinear(channel: number): number {
  const c = clampChannel(channel) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  const c = clamp(channel, 0, 1);
  const encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return encoded * 255;
}

function rgbaToOklch({ r, g, b, a }: Rgba): {
  l: number;
  c: number;
  h: number;
  a: number;
} {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(A * A + B * B);
  let H = 0;
  if (C > 1e-8) {
    H = (Math.atan2(B, A) * 180) / Math.PI;
    if (H < 0) H += 360;
  }

  return {
    l: clamp(L, 0, 1),
    c: Math.max(0, C),
    h: normalizeHue(H),
    a: clamp(a, 0, 1),
  };
}

function oklchToRgba(l: number, c: number, h: number, a = 1): Rgba {
  const L = clamp(l, 0, 1);
  const C = Math.max(0, c);
  const hue = (normalizeHue(h) * Math.PI) / 180;
  const A = C * Math.cos(hue);
  const B = C * Math.sin(hue);

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.291485548 * B;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const lr = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: linearToSrgb(lr),
    g: linearToSrgb(lg),
    b: linearToSrgb(lb),
    a: clamp(a, 0, 1),
  };
}

export function formatOklch(color: Rgba): string {
  const { l, c, h, a } = rgbaToOklch(color);
  const light = round(l, 4);
  const chroma = round(c, 4);
  const hue = round(h, 1);
  if (a < 1) {
    return `oklch(${light} ${chroma} ${hue} / ${formatAlpha(a)})`;
  }
  return `oklch(${light} ${chroma} ${hue})`;
}

export function parseOklch(input: string): Rgba | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^oklch\(\s*(.+)\s*\)$/i);
  if (!match) return null;
  const args = splitColorArgs(match[1]!);
  if (!args || (args.length !== 3 && args.length !== 4)) return null;

  let l = parseNumberToken(args[0]!);
  if (l === null) return null;
  if (args[0]!.trim().endsWith("%")) {
    l /= 100;
  }
  // CSS allows L as 0–1 or 0%–100%; also accept 0–100 without % when > 1.
  if (l > 1) l /= 100;

  const c = parseNumberToken(args[1]!);
  const h = parseHueToken(args[2]!);
  if (c === null || h === null) return null;
  return oklchToRgba(l, Math.max(0, c), h, parseAlphaToken(args[3]));
}

export function formatColor(format: ColorFormat, color: Rgba): string {
  switch (format) {
    case "hex":
      return rgbaToHex(color);
    case "rgba":
      return formatRgba(color);
    case "hsl":
      return formatHsl(color);
    case "hwb":
      return formatHwb(color);
    case "oklch":
      return formatOklch(color);
  }
}

export function parseColor(format: ColorFormat, input: string): Rgba | null {
  switch (format) {
    case "hex":
      return hexToRgba(input);
    case "rgba":
      return parseRgba(input);
    case "hsl":
      return parseHsl(input);
    case "hwb":
      return parseHwb(input);
    case "oklch":
      return parseOklch(input);
  }
}

export const COLOR_FORMAT_META: Record<
  ColorFormat,
  { label: string; hint: string; error: string }
> = {
  hex: {
    label: "Hex",
    hint: "Accepts #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.",
    error: "Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA",
  },
  rgba: {
    label: "RGBA",
    hint: "Comma or modern space syntax: rgba(47, 111, 102, 1) or rgb(47 111 102 / 1).",
    error: "Use rgb()/rgba() with comma or space syntax",
  },
  hsl: {
    label: "HSL / HSLA",
    hint: "Paste hsl() or hsla(), classic or modern slash alpha.",
    error: "Use hsl()/hsla() with percentages for S and L",
  },
  hwb: {
    label: "HWB",
    hint: "Modern CSS hwb(hue white% black% / alpha).",
    error: "Use hwb(hue white% black%)",
  },
  oklch: {
    label: "OKLCH",
    hint: "Perceptual oklch(L C H). L as 0–1 or percent.",
    error: "Use oklch(L C H) with optional / alpha",
  },
};
