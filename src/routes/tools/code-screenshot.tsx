import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { CodeScreenshotTool } from "#/components/tools/CodeScreenshotTool";

export const Route = createFileRoute("/tools/code-screenshot")({
  head: () => ({
    meta: [
      { title: "Code screenshot · WebTools" },
      {
        name: "description",
        content: "Paste code, pick a theme and window chrome, export a PNG screenshot.",
      },
    ],
  }),
  component: CodeScreenshotPage,
});

function CodeScreenshotPage() {
  return (
    <ToolShell>
      <CodeScreenshotTool />
    </ToolShell>
  );
}
