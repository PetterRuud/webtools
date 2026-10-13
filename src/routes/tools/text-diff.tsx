import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { TextDiffTool } from "#/components/tools/TextDiffTool";

export const Route = createFileRoute("/tools/text-diff")({
  head: () => ({
    meta: [
      { title: "Text diff · WebTools" },
      {
        name: "description",
        content: "Compare two texts side by side or in a unified view.",
      },
    ],
  }),
  component: TextDiffPage,
});

function TextDiffPage() {
  return (
    <ToolShell>
      <TextDiffTool />
    </ToolShell>
  );
}
