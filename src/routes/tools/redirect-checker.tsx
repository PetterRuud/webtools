import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { RedirectCheckerTool } from "#/components/tools/RedirectCheckerTool";

export const Route = createFileRoute("/tools/redirect-checker")({
  head: () => ({
    meta: [
      { title: "Redirect checker · WebTools" },
      {
        name: "description",
        content:
          "Follow HTTP redirect hops and see status codes, timing, and the final destination.",
      },
    ],
  }),
  component: RedirectCheckerPage,
});

function RedirectCheckerPage() {
  return (
    <ToolShell>
      <RedirectCheckerTool />
    </ToolShell>
  );
}
