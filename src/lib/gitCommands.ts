export type GitCategoryId =
  | "forensics"
  | "undo"
  | "history"
  | "stash"
  | "bisect"
  | "worktree"
  | "rewrite"
  | "inspect";

export type GitParamId = "since" | "head" | "bugGrep" | "fireGrep";

export type GitCommandId =
  | "churn"
  | "authors"
  | "bugs"
  | "velocity"
  | "firefighting"
  | "soft-undo"
  | "unstage-all"
  | "restore-file"
  | "reflog"
  | "reflog-recover"
  | "dangling"
  | "pickaxe"
  | "pickaxe-regex"
  | "follow-file"
  | "who-deleted"
  | "blame-range"
  | "stash-wip"
  | "stash-patch"
  | "stash-show"
  | "stash-branch"
  | "bisect-start"
  | "bisect-run"
  | "bisect-reset"
  | "worktree-add"
  | "worktree-list"
  | "worktree-remove"
  | "amend-no-edit"
  | "fixup"
  | "autosquash"
  | "rebase-n"
  | "force-lease"
  | "rebase-onto"
  | "cherry-pick-n"
  | "revert-merge"
  | "log-graph"
  | "diff-upstream"
  | "show-files"
  | "what-changed"
  | "copy-file-from";

export type GitCommand = {
  id: GitCommandId;
  title: string;
  blurb: string;
  category: GitCategoryId;
  /** Params this command uses when building the copyable string. */
  params: GitParamId[];
  keywords: string[];
  /** Static command when no builder is needed. */
  command?: string;
};

export type GitCommandParams = {
  since: string;
  head: number;
  bugGrep: string;
  fireGrep: string;
};

export type GitCategory = {
  id: GitCategoryId | "all";
  label: string;
};

export const GIT_CATEGORIES: GitCategory[] = [
  { id: "all", label: "All" },
  { id: "forensics", label: "Forensics" },
  { id: "undo", label: "Undo" },
  { id: "history", label: "History" },
  { id: "stash", label: "Stash" },
  { id: "bisect", label: "Bisect" },
  { id: "worktree", label: "Worktree" },
  { id: "rewrite", label: "Rewrite" },
  { id: "inspect", label: "Inspect" },
];

export const GIT_CATEGORY_STYLES: Record<
  GitCategoryId,
  { chip: string; chipActive: string; heading: string; rail: string }
> = {
  forensics: {
    chip: "border-emerald-500/35 text-emerald-800 hover:bg-emerald-500/10 dark:border-emerald-400/40 dark:text-emerald-200 dark:hover:bg-emerald-400/15",
    chipActive:
      "border-emerald-500/50 bg-emerald-500/18 text-emerald-950 dark:border-emerald-300/50 dark:bg-emerald-400/25 dark:text-emerald-50",
    heading: "text-emerald-800 dark:text-emerald-200",
    rail: "border-l-emerald-500/55 dark:border-l-emerald-400/50",
  },
  undo: {
    chip: "border-rose-500/35 text-rose-800 hover:bg-rose-500/10 dark:border-rose-400/40 dark:text-rose-200 dark:hover:bg-rose-400/15",
    chipActive:
      "border-rose-500/50 bg-rose-500/18 text-rose-950 dark:border-rose-300/50 dark:bg-rose-400/25 dark:text-rose-50",
    heading: "text-rose-800 dark:text-rose-200",
    rail: "border-l-rose-500/55 dark:border-l-rose-400/50",
  },
  history: {
    chip: "border-sky-500/35 text-sky-800 hover:bg-sky-500/10 dark:border-sky-400/40 dark:text-sky-200 dark:hover:bg-sky-400/15",
    chipActive:
      "border-sky-500/50 bg-sky-500/18 text-sky-950 dark:border-sky-300/50 dark:bg-sky-400/25 dark:text-sky-50",
    heading: "text-sky-800 dark:text-sky-200",
    rail: "border-l-sky-500/55 dark:border-l-sky-400/50",
  },
  stash: {
    chip: "border-amber-500/35 text-amber-800 hover:bg-amber-500/10 dark:border-amber-400/40 dark:text-amber-200 dark:hover:bg-amber-400/15",
    chipActive:
      "border-amber-500/50 bg-amber-500/18 text-amber-950 dark:border-amber-300/50 dark:bg-amber-400/25 dark:text-amber-50",
    heading: "text-amber-800 dark:text-amber-200",
    rail: "border-l-amber-500/55 dark:border-l-amber-400/50",
  },
  bisect: {
    chip: "border-violet-500/35 text-violet-800 hover:bg-violet-500/10 dark:border-violet-400/40 dark:text-violet-200 dark:hover:bg-violet-400/15",
    chipActive:
      "border-violet-500/50 bg-violet-500/18 text-violet-950 dark:border-violet-300/50 dark:bg-violet-400/25 dark:text-violet-50",
    heading: "text-violet-800 dark:text-violet-200",
    rail: "border-l-violet-500/55 dark:border-l-violet-400/50",
  },
  worktree: {
    chip: "border-teal-500/35 text-teal-800 hover:bg-teal-500/10 dark:border-teal-400/40 dark:text-teal-200 dark:hover:bg-teal-400/15",
    chipActive:
      "border-teal-500/50 bg-teal-500/18 text-teal-950 dark:border-teal-300/50 dark:bg-teal-400/25 dark:text-teal-50",
    heading: "text-teal-800 dark:text-teal-200",
    rail: "border-l-teal-500/55 dark:border-l-teal-400/50",
  },
  rewrite: {
    chip: "border-orange-500/35 text-orange-800 hover:bg-orange-500/10 dark:border-orange-400/40 dark:text-orange-200 dark:hover:bg-orange-400/15",
    chipActive:
      "border-orange-500/50 bg-orange-500/18 text-orange-950 dark:border-orange-300/50 dark:bg-orange-400/25 dark:text-orange-50",
    heading: "text-orange-800 dark:text-orange-200",
    rail: "border-l-orange-500/55 dark:border-l-orange-400/50",
  },
  inspect: {
    chip: "border-slate-500/35 text-slate-700 hover:bg-slate-500/10 dark:border-slate-400/40 dark:text-slate-200 dark:hover:bg-slate-400/15",
    chipActive:
      "border-slate-500/50 bg-slate-500/18 text-slate-950 dark:border-slate-300/50 dark:bg-slate-400/25 dark:text-slate-50",
    heading: "text-slate-700 dark:text-slate-200",
    rail: "border-l-slate-500/55 dark:border-l-slate-400/50",
  },
};

export const SINCE_PRESETS = [
  { id: "90.days", label: "90 days", value: "90 days ago" },
  { id: "6.months", label: "6 months", value: "6 months ago" },
  { id: "1.year", label: "1 year", value: "1 year ago" },
  { id: "2.years", label: "2 years", value: "2 years ago" },
] as const;

export const HEAD_PRESETS = [10, 20, 50] as const;

export const DEFAULT_GIT_PARAMS: GitCommandParams = {
  since: "1 year ago",
  head: 20,
  bugGrep: "fix|bug|broken",
  fireGrep: "revert|hotfix|emergency|rollback",
};

export const GIT_COMMANDS: GitCommand[] = [
  // Forensics (gist originals)
  {
    id: "churn",
    title: "What changes the most",
    blurb: "Files touched most often in the window.",
    category: "forensics",
    params: ["since", "head"],
    keywords: ["churn", "files", "hotspot", "name-only", "uniq", "log", "since", "head"],
  },
  {
    id: "authors",
    title: "Who built this",
    blurb: "Commit counts per author (no merges).",
    category: "forensics",
    params: [],
    keywords: ["authors", "contributors", "shortlog", "who", "team", "commits"],
  },
  {
    id: "bugs",
    title: "Where do bugs cluster",
    blurb: "Files named in fix/bug/broken commit messages.",
    category: "forensics",
    params: ["bugGrep", "head"],
    keywords: ["bugs", "fix", "broken", "grep", "cluster", "hotspot", "name-only"],
  },
  {
    id: "velocity",
    title: "Accelerating or dying",
    blurb: "Commit volume by year-month.",
    category: "forensics",
    params: [],
    keywords: ["velocity", "activity", "accelerating", "dying", "monthly", "trend", "date"],
  },
  {
    id: "firefighting",
    title: "How often firefighting",
    blurb: "Reverts, hotfixes, emergencies, rollbacks.",
    category: "forensics",
    params: ["since", "fireGrep"],
    keywords: ["firefighting", "revert", "hotfix", "emergency", "rollback", "incident", "grep"],
  },

  // Undo & recover
  {
    id: "soft-undo",
    title: "Undo last commit, keep changes",
    blurb: "Soft reset — commit gone, work stays staged.",
    category: "undo",
    params: [],
    command: "git reset --soft HEAD~1",
    keywords: ["undo", "reset", "soft", "uncommit", "mistake"],
  },
  {
    id: "unstage-all",
    title: "Unstage everything",
    blurb: "Clear the index; leave the working tree alone.",
    category: "undo",
    params: [],
    command: "git restore --staged .",
    keywords: ["unstage", "restore", "index", "staged", "reset"],
  },
  {
    id: "restore-file",
    title: "Discard file changes",
    blurb: "Reset one path back to HEAD.",
    category: "undo",
    params: [],
    command: "git restore -- path/to/file",
    keywords: ["discard", "restore", "checkout", "revert", "file"],
  },
  {
    id: "reflog",
    title: "Time machine",
    blurb: "Every HEAD move — commits you thought were gone.",
    category: "undo",
    params: [],
    command: "git reflog --date=relative",
    keywords: ["reflog", "recover", "history", "HEAD", "lost"],
  },
  {
    id: "reflog-recover",
    title: "Recover from reflog",
    blurb: "Point branch at a prior HEAD (destructive).",
    category: "undo",
    params: [],
    command: "git reset --hard HEAD@{1}",
    keywords: ["reflog", "recover", "reset", "hard", "undo"],
  },
  {
    id: "dangling",
    title: "Hunt dangling commits",
    blurb: "Orphans after reset/rebase — before GC eats them.",
    category: "undo",
    params: [],
    command: "git fsck --lost-found | grep commit",
    keywords: ["dangling", "fsck", "lost", "orphan", "recover"],
  },

  // History search
  {
    id: "pickaxe",
    title: "When did this string arrive",
    blurb: "Pickaxe: commits that added or removed a string.",
    category: "history",
    params: [],
    command: "git log -S'symbol' --oneline",
    keywords: ["pickaxe", "search", "-S", "symbol", "introduced", "blame"],
  },
  {
    id: "pickaxe-regex",
    title: "Regex across diffs",
    blurb: "Like -S but match a pattern in the patch.",
    category: "history",
    params: [],
    command: "git log -G'regex' --oneline",
    keywords: ["pickaxe", "regex", "-G", "search", "diff"],
  },
  {
    id: "follow-file",
    title: "Follow a file through renames",
    blurb: "Full story of one path across moves.",
    category: "history",
    params: [],
    command: "git log --follow --oneline -- path/to/file",
    keywords: ["follow", "rename", "move", "history", "file"],
  },
  {
    id: "who-deleted",
    title: "Who deleted this",
    blurb: "Deletion commits with summary paths.",
    category: "history",
    params: [],
    command: "git log --diff-filter=D --summary",
    keywords: ["delete", "deleted", "removed", "diff-filter", "who"],
  },
  {
    id: "blame-range",
    title: "Blame a line range",
    blurb: "Who last touched lines 12–40.",
    category: "history",
    params: [],
    command: "git blame -L 12,40 -- path/to/file",
    keywords: ["blame", "annotate", "lines", "range", "who"],
  },
  {
    id: "copy-file-from",
    title: "Grab a file from another commit",
    blurb: "Restore one path without checking out the rest.",
    category: "history",
    params: [],
    command: "git checkout <sha> -- path/to/file",
    keywords: ["checkout", "restore", "file", "from", "commit", "copy"],
  },

  // Stash
  {
    id: "stash-wip",
    title: "Stash including untracked",
    blurb: "WIP with new files — not just tracked edits.",
    category: "stash",
    params: [],
    command: 'git stash push -u -m "wip"',
    keywords: ["stash", "untracked", "wip", "save", "-u"],
  },
  {
    id: "stash-patch",
    title: "Stash interactively",
    blurb: "Hunk-pick what to shelve.",
    category: "stash",
    params: [],
    command: "git stash push -p",
    keywords: ["stash", "patch", "interactive", "hunk", "-p"],
  },
  {
    id: "stash-show",
    title: "Inspect a stash as a patch",
    blurb: "See what stash@{0} actually holds.",
    category: "stash",
    params: [],
    command: "git stash show -p stash@{0}",
    keywords: ["stash", "show", "patch", "diff", "inspect"],
  },
  {
    id: "stash-branch",
    title: "Stash → branch",
    blurb: "Turn a stash into a branch and drop it.",
    category: "stash",
    params: [],
    command: "git stash branch recover stash@{0}",
    keywords: ["stash", "branch", "recover", "salvage"],
  },

  // Bisect
  {
    id: "bisect-start",
    title: "Start a bisect",
    blurb: "Mark bad HEAD, then a known-good tag/commit.",
    category: "bisect",
    params: [],
    command: "git bisect start && git bisect bad && git bisect good <good-sha>",
    keywords: ["bisect", "bug", "regression", "binary", "search"],
  },
  {
    id: "bisect-run",
    title: "Automate bisect",
    blurb: "Script exits 0=good, 1–127=bad (not 125=skip).",
    category: "bisect",
    params: [],
    command: "git bisect run npm test",
    keywords: ["bisect", "run", "automate", "test", "script"],
  },
  {
    id: "bisect-reset",
    title: "Exit bisect",
    blurb: "Back to the branch you started on.",
    category: "bisect",
    params: [],
    command: "git bisect reset",
    keywords: ["bisect", "reset", "done", "exit"],
  },

  // Worktree
  {
    id: "worktree-add",
    title: "Parallel checkout",
    blurb: "Second directory, new branch off main.",
    category: "worktree",
    params: [],
    command: "git worktree add ../hotfix -b hotfix main",
    keywords: ["worktree", "parallel", "branch", "add", "checkout"],
  },
  {
    id: "worktree-list",
    title: "List worktrees",
    blurb: "Where every linked checkout lives.",
    category: "worktree",
    params: [],
    command: "git worktree list",
    keywords: ["worktree", "list", "paths"],
  },
  {
    id: "worktree-remove",
    title: "Remove a worktree",
    blurb: "Detach and delete the extra checkout dir.",
    category: "worktree",
    params: [],
    command: "git worktree remove ../hotfix",
    keywords: ["worktree", "remove", "delete", "cleanup"],
  },

  // Rewrite & fixup
  {
    id: "amend-no-edit",
    title: "Amend without retyping",
    blurb: "Fold staged changes into HEAD, same message.",
    category: "rewrite",
    params: [],
    command: "git commit --amend --no-edit",
    keywords: ["amend", "fixup", "oops", "message"],
  },
  {
    id: "fixup",
    title: "Mark a fixup commit",
    blurb: "Later autosquash folds this into <sha>.",
    category: "rewrite",
    params: [],
    command: "git commit --fixup=<sha>",
    keywords: ["fixup", "squash", "rebase", "tidy"],
  },
  {
    id: "autosquash",
    title: "Autosquash rebase",
    blurb: "Apply fixup!/squash! commits onto main.",
    category: "rewrite",
    params: [],
    command: "git rebase -i --autosquash main",
    keywords: ["autosquash", "fixup", "rebase", "interactive"],
  },
  {
    id: "rebase-n",
    title: "Rebase last N commits",
    blurb: "Interactive rewrite of the tip.",
    category: "rewrite",
    params: ["head"],
    keywords: ["rebase", "interactive", "squash", "edit", "head"],
  },
  {
    id: "force-lease",
    title: "Safer force push",
    blurb: "Refuse if remote moved since you fetched.",
    category: "rewrite",
    params: [],
    command: "git push --force-with-lease",
    keywords: ["force", "push", "lease", "rewrite", "safe"],
  },
  {
    id: "rebase-onto",
    title: "Rebase onto (transplant)",
    blurb: "Move commits after oldbase onto main.",
    category: "rewrite",
    params: [],
    command: "git rebase --onto main <oldbase> <feature>",
    keywords: ["rebase", "onto", "transplant", "cut", "stack"],
  },
  {
    id: "cherry-pick-n",
    title: "Cherry-pick without committing",
    blurb: "Apply the diff; stage and commit yourself.",
    category: "rewrite",
    params: [],
    command: "git cherry-pick -n <sha>",
    keywords: ["cherry-pick", "no-commit", "-n", "apply"],
  },
  {
    id: "revert-merge",
    title: "Revert a merge commit",
    blurb: "-m 1 keeps the first parent (usually main).",
    category: "rewrite",
    params: [],
    command: "git revert -m 1 <merge-sha>",
    keywords: ["revert", "merge", "undo", "parent"],
  },

  // Inspect
  {
    id: "log-graph",
    title: "Pretty branch graph",
    blurb: "One-line topology across all refs.",
    category: "inspect",
    params: [],
    command: "git log --graph --oneline --decorate --all",
    keywords: ["graph", "log", "decorate", "branches", "topology"],
  },
  {
    id: "diff-upstream",
    title: "Diff vs upstream",
    blurb: "What you have that @{upstream} does not.",
    category: "inspect",
    params: [],
    command: "git diff @{upstream}",
    keywords: ["diff", "upstream", "tracking", "remote", "ahead"],
  },
  {
    id: "show-files",
    title: "Files in a commit",
    blurb: "Paths touched by HEAD (swap SHA as needed).",
    category: "inspect",
    params: [],
    command: "git show --name-only --pretty=format: HEAD",
    keywords: ["show", "files", "name-only", "commit", "paths"],
  },
  {
    id: "what-changed",
    title: "What landed since",
    blurb: "Oneline log for the since window.",
    category: "inspect",
    params: ["since"],
    keywords: ["log", "since", "recent", "changed", "oneline"],
  },
];

function shellQuote(value: string): string {
  // Always quote when shell metacharacters (esp. |) are present.
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function buildGitCommand(
  id: GitCommandId,
  params: GitCommandParams = DEFAULT_GIT_PARAMS,
): string {
  const entry = GIT_COMMANDS.find((command) => command.id === id);
  if (entry?.command) return entry.command;

  const since = params.since.trim() || DEFAULT_GIT_PARAMS.since;
  const head =
    Number.isFinite(params.head) && params.head > 0
      ? Math.floor(params.head)
      : DEFAULT_GIT_PARAMS.head;
  const bugGrep = params.bugGrep.trim() || DEFAULT_GIT_PARAMS.bugGrep;
  const fireGrep = params.fireGrep.trim() || DEFAULT_GIT_PARAMS.fireGrep;

  switch (id) {
    case "churn":
      return `git log --format=format: --name-only --since=${shellQuote(since)} | sort | uniq -c | sort -nr | head -${head}`;
    case "authors":
      return "git shortlog -sn --no-merges";
    case "bugs":
      return `git log -i -E --grep=${shellQuote(bugGrep)} --name-only --format='' | sort | uniq -c | sort -nr | head -${head}`;
    case "velocity":
      return "git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c";
    case "firefighting":
      return `git log --oneline --since=${shellQuote(since)} | grep -iE ${shellQuote(fireGrep)}`;
    case "rebase-n":
      return `git rebase -i HEAD~${head}`;
    case "what-changed":
      return `git log --oneline --since=${shellQuote(since)}`;
    default:
      return entry?.command ?? "";
  }
}

export type CategoryFilter = GitCategoryId | "all";

export function filterGitCommands(
  commands: GitCommand[],
  query: string,
  category: CategoryFilter = "all",
): GitCommand[] {
  const byCategory =
    category === "all" ? commands : commands.filter((command) => command.category === category);

  const normalized = query.trim().toLowerCase();
  if (!normalized) return byCategory;

  const tokens = normalized.split(/\s+/);
  return byCategory.filter((command) => {
    const haystack = [
      command.title,
      command.blurb,
      command.id,
      command.category,
      buildGitCommand(command.id),
      ...command.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

export function groupCommandsByCategory(commands: GitCommand[]): Array<{
  category: GitCategory;
  commands: GitCommand[];
}> {
  const order = GIT_CATEGORIES.filter((item) => item.id !== "all");
  return order
    .map((category) => ({
      category,
      commands: commands.filter((command) => command.category === category.id),
    }))
    .filter((group) => group.commands.length > 0);
}
