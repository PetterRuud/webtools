import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { HttpStatusTool } from "#/components/tools/HttpStatusTool";

export const Route = createFileRoute("/tools/http-status")({
  head: () => ({
    meta: [
      { title: "HTTP status · WebTools" },
      { name: "description", content: "Searchable HTTP status code reference." },
    ],
  }),
  component: HttpStatusPage,
});

function HttpStatusPage() {
  return (
    <ToolShell>
      <HttpStatusTool />
    </ToolShell>
  );
}
