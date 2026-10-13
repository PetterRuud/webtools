import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { CrawlerSimulatorTool } from "#/components/tools/CrawlerSimulatorTool";

export const Route = createFileRoute("/tools/crawler-simulator")({
  head: () => ({
    meta: [
      { title: "Crawler simulator · WebTools" },
      {
        name: "description",
        content:
          "See what a crawler gets from no-JS HTML vs JS-rendered content: title, meta, headings, OG, links.",
      },
    ],
  }),
  component: CrawlerSimulatorPage,
});

function CrawlerSimulatorPage() {
  return (
    <ToolShell>
      <CrawlerSimulatorTool />
    </ToolShell>
  );
}
