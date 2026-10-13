import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { QrCodeTool } from "#/components/tools/QrCodeTool";

export const Route = createFileRoute("/tools/qrcode")({
  head: () => ({
    meta: [
      { title: "QR code · WebTools" },
      {
        name: "description",
        content:
          "Generate a QR code from text or a URL in your browser. Size, error correction, download PNG.",
      },
    ],
  }),
  component: QrCodePage,
});

function QrCodePage() {
  return (
    <ToolShell>
      <QrCodeTool />
    </ToolShell>
  );
}
