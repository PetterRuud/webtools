import { createFileRoute } from "@tanstack/react-router";
import { ToolsBrowse } from "#/components/ToolsBrowse";

export const Route = createFileRoute("/")({ component: HubPage });

function HubPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-4 pb-12 pt-4 sm:px-6 sm:pt-5">
      <ToolsBrowse />
    </main>
  );
}
