import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { CssGridTool } from "#/components/tools/CssGridTool";

export const Route = createFileRoute("/tools/css-grid")({
  head: () => ({
    meta: [
      { title: "CSS Grid · WebTools" },
      {
        name: "description",
        content:
          "Build CSS Grid layouts with columns, rows, gaps, and template areas — copy the CSS.",
      },
    ],
  }),
  component: CssGridPage,
});

function CssGridPage() {
  return (
    <ToolShell>
      <CssGridTool />
    </ToolShell>
  );
}
