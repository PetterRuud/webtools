import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { SerpPreviewTool } from "#/components/tools/SerpPreviewTool";

export const Route = createFileRoute("/tools/serp-preview")({
  head: () => ({
    meta: [
      { title: "SERP preview · WebTools" },
      {
        name: "description",
        content:
          "Preview how a title and meta description look in Google search results, with length and pixel estimates.",
      },
    ],
  }),
  component: SerpPreviewPage,
});

function SerpPreviewPage() {
  return (
    <ToolShell>
      <SerpPreviewTool />
    </ToolShell>
  );
}
