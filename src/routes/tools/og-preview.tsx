import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { OgPreviewTool } from "#/components/tools/OgPreviewTool";

export const Route = createFileRoute("/tools/og-preview")({
  head: () => ({
    meta: [
      { title: "Open Graph preview · WebTools" },
      {
        name: "description",
        content:
          "Fetch a URL and preview Facebook, X, and LinkedIn share cards from OG / Twitter tags.",
      },
    ],
  }),
  component: OgPreviewPage,
});

function OgPreviewPage() {
  return (
    <ToolShell>
      <OgPreviewTool />
    </ToolShell>
  );
}
