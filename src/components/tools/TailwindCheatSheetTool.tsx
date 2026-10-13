import { useMemo, useState } from "react";
import { Input } from "#/components/ui/input";
import { copyText } from "#/lib/clipboard";
import {
  TAILWIND_CATEGORIES,
  TAILWIND_CATEGORY_STYLES,
  TAILWIND_UTILITIES,
  filterTailwindUtilities,
  groupUtilitiesByCategory,
  type CategoryFilter,
  type TailwindCategoryId,
} from "#/lib/tailwindCheatSheet";
import { cn } from "#/lib/utils";

export function TailwindCheatSheetTool() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const visible = useMemo(
    () => filterTailwindUtilities(TAILWIND_UTILITIES, { query, category }),
    [query, category],
  );

  const groups = useMemo(() => groupUtilitiesByCategory(visible), [visible]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search class, CSS, keyword…"
          spellCheck={false}
          autoComplete="off"
          aria-label="Search Tailwind utilities"
        />
        <p className="m-0 text-right text-xs text-muted-foreground tabular-nums md:min-w-24">
          {visible.length}/{TAILWIND_UTILITIES.length}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Utility category">
        {TAILWIND_CATEGORIES.map((item) => {
          const selected = category === item.id;
          const tones =
            item.id === "all" ? null : TAILWIND_CATEGORY_STYLES[item.id as TailwindCategoryId];

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setCategory(item.id)}
              className={cn(
                "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors",
                item.id === "all"
                  ? selected
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  : selected
                    ? tones!.chipActive
                    : cn("bg-card/40", tones!.chip),
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-sm text-muted-foreground">
          No matches.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const tones = TAILWIND_CATEGORY_STYLES[group.category.id as TailwindCategoryId];
            return (
              <section key={group.category.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    className={cn(
                      "font-heading m-0 text-[0.8rem] font-semibold tracking-wide uppercase",
                      tones.heading,
                    )}
                  >
                    {group.category.label}
                  </h2>
                  <span className="text-[0.65rem] tabular-nums text-muted-foreground">
                    {group.utilities.length}
                  </span>
                </div>
                <ul className="m-0 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {group.utilities.map((item) => (
                    <li key={`${item.category}-${item.className}`}>
                      <button
                        type="button"
                        onClick={() => copyText(item.className, item.className)}
                        className={cn(
                          "group flex w-full items-baseline gap-2 rounded-md border border-border/70 border-l-[3px] bg-card/30 px-2.5 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                          tones.rail,
                        )}
                        title="Copy class"
                      >
                        <code
                          className={cn(
                            "font-mono text-[0.84rem] leading-5 font-semibold break-all",
                            tones.className,
                          )}
                        >
                          {item.className}
                        </code>
                        <span className="min-w-0 flex-1 text-right font-mono text-[0.68rem] leading-4 font-normal tracking-tight text-muted-foreground">
                          {item.css}
                          {item.note ? (
                            <span className="mt-0.5 block font-sans text-[0.62rem] leading-tight text-muted-foreground/75">
                              {item.note}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
