import QRCode from "qrcode";

export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export type QrGenerateOptions = {
  text: string;
  size: number;
  errorCorrection: QrErrorCorrection;
  margin: number;
  darkColor: string;
  lightColor: string;
};

export async function generateQrDataUrl(options: QrGenerateOptions): Promise<string> {
  const text = options.text.trim();
  if (!text) {
    throw new Error("Enter text or a URL.");
  }

  return QRCode.toDataURL(text, {
    errorCorrectionLevel: options.errorCorrection,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.darkColor,
      light: options.lightColor,
    },
  });
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}
