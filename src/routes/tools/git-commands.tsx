import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { GitCommandsTool } from "#/components/tools/GitCommandsTool";

export const Route = createFileRoute("/tools/git-commands")({
  head: () => ({
    meta: [
      { title: "Git commands · WebTools" },
      {
        name: "description",
        content:
          "Searchable git cheatsheet — forensics, undo, reflog, stash, bisect, worktree, fixups, history search. Copyable with since/head/grep builders.",
      },
    ],
  }),
  component: GitCommandsPage,
});

function GitCommandsPage() {
  return (
    <ToolShell>
      <GitCommandsTool />
    </ToolShell>
  );
}
