import { Link } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "#/components/ui/item";
import { TOOL_ICONS } from "#/lib/tool-icons";
import {
  TOOL_CATEGORIES,
  TOOLS,
  filterTools,
  groupToolsByCategory,
  type ToolCategoryId,
  type ToolLink,
} from "#/lib/tools";

type CategoryFilter = ToolCategoryId | "all";

export function ToolsBrowse() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    }

    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ?? navigator.platform;
    if (/Mac|iPhone|iPad|iPod/i.test(platform)) {
      setShortcutLabel("⌘K");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visibleTools = useMemo(() => filterTools(TOOLS, { query, category }), [query, category]);
  const groups = useMemo(() => groupToolsByCategory(visibleTools), [visibleTools]);
  const hasResults = new Set(visibleTools.map((tool) => tool.to)).size > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Search tools</span>
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={searchRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search by name or job…"
            className="h-11 bg-card/70 pr-20 pl-10 text-sm shadow-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border/80 bg-muted/70 px-1.5 py-0.5 font-sans text-[0.7rem] text-muted-foreground sm:inline">
            {shortcutLabel}
          </kbd>
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              className="absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground sm:right-14"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tool categories">
          <CategoryChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All"
          />
          {TOOL_CATEGORIES.map((item) => (
            <CategoryChip
              key={item.id}
              active={category === item.id}
              onClick={() => setCategory(item.id)}
              label={item.label}
            />
          ))}
        </div>
      </div>

      {!hasResults ? (
        <div className="rounded-xl border border-dashed border-border/80 px-5 py-10 text-center">
          <p className="m-0 text-sm text-muted-foreground">No tools match “{query.trim()}”.</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              setQuery("");
              setCategory("all");
              searchRef.current?.focus();
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : category === "all" && !query.trim() ? (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <CategoryGroup
              key={group.category.id}
              label={group.category.label}
              tools={group.tools}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ToolGrid tools={visibleTools} />
        </div>
      )}
    </section>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition"
          : "inline-flex h-8 items-center rounded-lg border border-border/80 bg-card/50 px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      }
    >
      {label}
    </button>
  );
}

function CategoryGroup({ label, tools }: { label: string; tools: ToolLink[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading m-0 text-sm font-semibold tracking-wide text-foreground uppercase">
        {label}
      </h3>
      <ToolGrid tools={tools} />
    </div>
  );
}

function ToolGrid({ tools }: { tools: ToolLink[] }) {
  const uniqueTools = useMemo(() => {
    const seen = new Set<ToolLink["to"]>();
    return tools.filter((tool) => {
      if (seen.has(tool.to)) return false;
      seen.add(tool.to);
      return true;
    });
  }, [tools]);

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {uniqueTools.map((tool) => {
        const Icon = TOOL_ICONS[tool.to];
        return (
          <li key={tool.to} className="min-w-0">
            <Item
              variant="outline"
              size="xs"
              render={<Link to={tool.to} />}
              className="tool-row h-full flex-nowrap items-center border-border/70 bg-card/45 py-2 no-underline hover:border-primary/35 hover:bg-muted/55"
            >
              <ItemMedia
                variant="icon"
                className="size-7 translate-y-0 self-center rounded-md bg-muted text-primary"
              >
                <Icon aria-hidden />
              </ItemMedia>
              <ItemContent className="min-w-0 gap-0">
                <ItemTitle className="font-heading text-foreground">{tool.name}</ItemTitle>
                <ItemDescription className="line-clamp-1 text-xs leading-4">
                  {tool.blurb}
                </ItemDescription>
              </ItemContent>
            </Item>
          </li>
        );
      })}
    </ul>
  );
}
