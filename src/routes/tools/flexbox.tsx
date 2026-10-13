import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { FlexboxTool } from "#/components/tools/FlexboxTool";

export const Route = createFileRoute("/tools/flexbox")({
  head: () => ({
    meta: [
      { title: "Flexbox · WebTools" },
      {
        name: "description",
        content: "Generate CSS flexbox layouts — direction, wrap, justify, align, gap.",
      },
    ],
  }),
  component: FlexboxPage,
});

function FlexboxPage() {
  return (
    <ToolShell>
      <FlexboxTool />
    </ToolShell>
  );
}
