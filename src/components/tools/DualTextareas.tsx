import type { ReactNode } from "react";
import { cn } from "cn";

type DualTextareasProps = {
  leftHeader: ReactNode;
  rightHeader: ReactNode;
  left: ReactNode;
  right: ReactNode;
  className?: string;
};

/**
 * Two text panes that stay on one row from md up.
 * Matched h-8 headers keep input/output textareas top-aligned
 * even when only one side has a Copy (or similar) action.
 */
export function DualTextareas({
  leftHeader,
  rightHeader,
  left,
  right,
  className,
}: DualTextareasProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch", className)}>
      <div className="flex h-full min-h-0 min-w-0 flex-col gap-1.5">
        <div className="flex h-8 shrink-0 items-center justify-between gap-2">{leftHeader}</div>
        {left}
      </div>
      <div className="flex h-full min-h-0 min-w-0 flex-col gap-1.5">
        <div className="flex h-8 shrink-0 items-center justify-between gap-2">{rightHeader}</div>
        {right}
      </div>
    </div>
  );
}
