import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { UtmBuilderTool } from "#/components/tools/UtmBuilderTool";

export const Route = createFileRoute("/tools/utm-builder")({
  head: () => ({
    meta: [
      { title: "UTM builder · WebTools" },
      {
        name: "description",
        content:
          "Build campaign URLs with utm_source, utm_medium, utm_campaign, term, and content.",
      },
    ],
  }),
  component: UtmBuilderPage,
});

function UtmBuilderPage() {
  return (
    <ToolShell>
      <UtmBuilderTool />
    </ToolShell>
  );
}
