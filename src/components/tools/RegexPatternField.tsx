import { useRef, type InputHTMLAttributes, type ReactNode, type UIEvent } from "react";
import { Input } from "#/components/ui/input";
import { breakdownRegex, tokenKindInlineStyle, type RegexToken } from "#/lib/regexBreakdown";
import { cn } from "#/lib/utils";

const FIELD_TYPE = "font-mono text-[0.92rem] whitespace-pre";

type RegexPatternFieldProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "children" | "dangerouslySetInnerHTML" | "type"
>;

function renderTokenSpans(tokens: RegexToken[]): ReactNode {
  if (tokens.length === 0) return null;
  return tokens.map((token, index) => (
    <span
      key={`${index}-${token.kind}-${token.text}`}
      className={cn("rounded-sm", tokenKindInlineStyle(token.kind))}
    >
      {token.text}
    </span>
  ));
}

/** Transparent input over breakdown-colored spans — typing stays normal. */
export function RegexPatternField({
  id,
  value,
  onValueChange,
  placeholder,
  className,
  disabled,
  "aria-invalid": ariaInvalid,
  onScroll,
  ...rest
}: RegexPatternFieldProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const tokens = breakdownRegex(value);

  function syncScroll(event: UIEvent<HTMLInputElement>) {
    const el = backdropRef.current;
    if (el) {
      el.scrollLeft = event.currentTarget.scrollLeft;
    }
    onScroll?.(event);
  }

  return (
    <div
      className={cn(
        // Match shadcn Input chrome — inner Input is transparent for the token overlay.
        "relative h-8 overflow-hidden rounded-lg border border-border bg-input shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        ariaInvalid &&
          "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
        className,
      )}
    >
      <div
        ref={backdropRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 flex items-center overflow-x-auto overflow-y-hidden rounded-[inherit] px-2.5 text-foreground",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          FIELD_TYPE,
        )}
      >
        {renderTokenSpans(tokens)}
      </div>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        placeholder={placeholder}
        spellCheck={false}
        onScroll={syncScroll}
        onValueChange={onValueChange}
        className={cn(
          "relative z-10 h-full border-0 bg-transparent shadow-none",
          "text-transparent caret-foreground",
          "placeholder:text-muted-foreground placeholder:[-webkit-text-fill-color:var(--muted-foreground)]",
          "focus-visible:border-transparent focus-visible:ring-0",
          "dark:bg-transparent dark:disabled:bg-transparent",
          "[-webkit-text-fill-color:transparent]",
          FIELD_TYPE,
        )}
        {...rest}
      />
    </div>
  );
}
