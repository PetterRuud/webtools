import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { RobotsTxtTool } from "#/components/tools/RobotsTxtTool";

export const Route = createFileRoute("/tools/robots-txt")({
  head: () => ({
    meta: [
      { title: "robots.txt tester · WebTools" },
      {
        name: "description",
        content: "Fetch or paste robots.txt and test whether paths are allowed for a user-agent.",
      },
    ],
  }),
  component: RobotsTxtPage,
});

function RobotsTxtPage() {
  return (
    <ToolShell>
      <RobotsTxtTool />
    </ToolShell>
  );
}
