import type { ReactNode } from "react";
import { cn } from "cn";

type ToolShellProps = {
  children: ReactNode;
  /** Wider content rail. Defaults to true for utility density. */
  wide?: boolean;
};

export function ToolShell({ children, wide = true }: ToolShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col gap-3 px-4 pb-8 pt-1 sm:px-6 md:gap-4",
        wide ? "max-w-6xl" : "max-w-3xl",
      )}
    >
      <div className="animate-rise">{children}</div>
    </main>
  );
}
