import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { RandomTool } from "#/components/tools/RandomTool";

export const Route = createFileRoute("/tools/random")({
  head: () => ({
    meta: [
      { title: "Random · WebTools" },
      {
        name: "description",
        content:
          "Generate random numbers, strings, UUIDs, passwords, coin flips, dice, D&D rolls, list picks, and roulette spins locally in your browser.",
      },
    ],
  }),
  component: RandomPage,
});

function RandomPage() {
  return (
    <ToolShell>
      <RandomTool />
    </ToolShell>
  );
}
