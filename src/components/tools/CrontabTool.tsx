import { CopyIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { copyText } from "#/lib/clipboard";
import {
  CRON_PRESETS,
  buildExpression,
  createDefaultCronState,
  describeExpression,
  fieldSpec,
  formatRun,
  nextRuns,
  parseExpression,
  serializeField,
  setFieldMode,
  toggleListValue,
  type CronFieldName,
  type CronState,
  type FieldMode,
  type FieldState,
} from "#/lib/crontab";
import { cn } from "#/lib/utils";

const FIELD_ORDER: CronFieldName[] = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];

const MODES: { id: FieldMode; label: string }[] = [
  { id: "every", label: "Every" },
  { id: "step", label: "Step" },
  { id: "specific", label: "At" },
  { id: "range", label: "Range" },
  { id: "list", label: "List" },
];

const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function CrontabTool() {
  const [state, setState] = useState<CronState>(() => createDefaultCronState(false));
  const [draft, setDraft] = useState(() => buildExpression(createDefaultCronState(false)));
  const [parseError, setParseError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const expression = useMemo(() => buildExpression(state), [state]);
  const summary = useMemo(() => describeExpression(expression), [expression]);
  const runs = useMemo(() => (mounted ? nextRuns(expression, 5) : null), [expression, mounted]);
  const timeZone = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "local";

  function applyState(next: CronState) {
    setState(next);
    setDraft(buildExpression(next));
    setParseError(null);
  }

  function updateField(name: CronFieldName, patch: Partial<FieldState> | FieldState) {
    setState((prev) => {
      const field = { ...prev.fields[name], ...patch };
      field.raw = serializeField(field, fieldSpec(name));
      const next = {
        ...prev,
        fields: { ...prev.fields, [name]: field },
      };
      setDraft(buildExpression(next));
      setParseError(null);
      return next;
    });
  }

  function applyPreset(presetExpression: string) {
    if (state.withSeconds && presetExpression.split(" ").length === 5) {
      const withSec = parseExpression(`0 ${presetExpression}`);
      if (withSec.ok) {
        applyState({ ...withSec.state, withSeconds: true });
        return;
      }
    }
    const parsed = parseExpression(presetExpression);
    if (!parsed.ok) {
      setParseError(parsed.error);
      return;
    }
    applyState(parsed.state);
  }

  function toggleSeconds(enabled: boolean) {
    setState((prev) => {
      const next: CronState = {
        ...prev,
        withSeconds: enabled,
        fields: {
          ...prev.fields,
          second:
            enabled && prev.fields.second.mode === "every" && prev.fields.second.raw === "*"
              ? {
                  mode: "specific",
                  step: 1,
                  values: [0],
                  from: 0,
                  to: 59,
                  raw: "0",
                }
              : prev.fields.second,
        },
      };
      setDraft(buildExpression(next));
      setParseError(null);
      return next;
    });
  }

  const editorFields: CronFieldName[] = state.withSeconds
    ? ["second", ...FIELD_ORDER]
    : FIELD_ORDER;

  return (
    <div className="grid gap-3 md:grid-cols-2 md:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="cron-expression" className="text-xs text-muted-foreground">
              Expression
            </Label>
            <Label className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
              <Checkbox
                checked={state.withSeconds}
                onCheckedChange={(checked) => toggleSeconds(checked === true)}
              />
              Seconds
            </Label>
          </div>
          <div className="bg-muted/50 flex gap-1.5 rounded-lg border border-border/80 p-1.5">
            <Input
              id="cron-expression"
              value={draft}
              onValueChange={(value) => {
                setDraft(value);
                const parsed = parseExpression(value);
                if (parsed.ok) {
                  setState(parsed.state);
                  setParseError(null);
                } else {
                  setParseError(parsed.error);
                }
              }}
              spellCheck={false}
              autoComplete="off"
              className="font-mono text-sm"
              aria-invalid={parseError ? true : undefined}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Copy expression"
              onClick={() => void copyText(expression, "cron expression")}
            >
              <CopyIcon />
            </Button>
          </div>
          {parseError ? (
            <p className="m-0 text-xs text-destructive">{parseError}</p>
          ) : (
            <p className="m-0 font-mono text-[0.7rem] tracking-wide text-muted-foreground">
              {state.withSeconds ? "sec min hour dom month dow" : "min hour dom month dow"}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-xs text-muted-foreground">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {CRON_PRESETS.map((preset) => {
              const active =
                !parseError &&
                (expression === preset.expression || expression === `0 ${preset.expression}`);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.expression)}
                  className={cn(
                    "inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium transition-colors",
                    active
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border/80 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {editorFields.map((name) => (
            <FieldEditor
              key={name}
              name={name}
              state={state.fields[name]}
              onChange={(patch) => updateField(name, patch)}
              onMode={(mode) =>
                updateField(name, setFieldMode(state.fields[name], mode, fieldSpec(name)))
              }
              onToggle={(value) =>
                updateField(name, toggleListValue(state.fields[name], value, fieldSpec(name)))
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:sticky md:top-3">
        <div className="bg-muted/30 rounded-lg border border-border/80 px-3 py-2.5">
          <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
            Summary
          </p>
          <p className="mt-1 mb-0 text-sm leading-5 text-foreground">{summary}</p>
          <p className="mt-2 mb-0 font-mono text-xs text-muted-foreground">{expression}</p>
        </div>

        <div className="bg-muted/30 rounded-lg border border-border/80 px-3 py-2.5">
          <p className="m-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
            Next runs
          </p>
          <p className="mt-0.5 mb-2 text-[0.7rem] text-muted-foreground">
            Local timezone ({timeZone})
          </p>
          {!mounted || !runs ? (
            <p className="m-0 text-sm text-muted-foreground">Computing…</p>
          ) : !runs.ok ? (
            <p className="m-0 text-sm text-destructive">{runs.error}</p>
          ) : (
            <ol className="m-0 list-none space-y-1 p-0">
              {runs.dates.map((date) => (
                <li
                  key={date.toISOString()}
                  className="font-mono text-xs tabular-nums text-foreground"
                >
                  {formatRun(date, state.withSeconds)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldEditor({
  name,
  state,
  onChange,
  onMode,
  onToggle,
}: {
  name: CronFieldName;
  state: FieldState;
  onChange: (patch: Partial<FieldState>) => void;
  onMode: (mode: FieldMode) => void;
  onToggle: (value: number) => void;
}) {
  const spec = fieldSpec(name);

  return (
    <div className="rounded-lg border border-border/70 bg-card/30 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{spec.label}</span>
        <span className="font-mono text-[0.65rem] text-muted-foreground">{state.raw}</span>
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onMode(mode.id)}
            className={cn(
              "inline-flex h-6 items-center rounded px-1.5 text-[0.7rem] font-medium transition-colors",
              state.mode === mode.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {state.mode === "every" ? (
        <p className="m-0 text-xs text-muted-foreground">
          Any value ({spec.min}–{spec.max})
        </p>
      ) : null}

      {state.mode === "step" ? (
        <Label className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
          Every
          <Input
            type="number"
            min={1}
            max={spec.max}
            value={String(state.step)}
            onValueChange={(v) => {
              const step = Math.max(1, Number(v) || 1);
              onChange({ step, raw: `*/${step}` });
            }}
            className="h-7 w-16 font-mono text-xs"
          />
          units
        </Label>
      ) : null}

      {state.mode === "specific" ? (
        <SpecificControl name={name} value={state.values[0] ?? spec.min} onChange={onChange} />
      ) : null}

      {state.mode === "range" ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Input
            type="number"
            min={spec.min}
            max={spec.max}
            value={String(state.from)}
            onValueChange={(v) => onChange({ from: Number(v) || spec.min })}
            className="h-7 w-16 font-mono text-xs"
          />
          <span>to</span>
          <Input
            type="number"
            min={spec.min}
            max={spec.max}
            value={String(state.to)}
            onValueChange={(v) => onChange({ to: Number(v) || spec.max })}
            className="h-7 w-16 font-mono text-xs"
          />
        </div>
      ) : null}

      {state.mode === "list" ? (
        <ListPicker name={name} values={state.values} onToggle={onToggle} />
      ) : null}
    </div>
  );
}

function SpecificControl({
  name,
  value,
  onChange,
}: {
  name: CronFieldName;
  value: number;
  onChange: (patch: Partial<FieldState>) => void;
}) {
  const spec = fieldSpec(name);

  if (name === "dayOfWeek") {
    return (
      <div className="flex flex-wrap gap-1">
        {DOW_SHORT.map((label, i) => (
          <Chip
            key={label}
            active={value === i || (value === 7 && i === 0)}
            label={label}
            onClick={() => onChange({ values: [i], raw: String(i) })}
          />
        ))}
      </div>
    );
  }

  if (name === "month") {
    return (
      <div className="flex flex-wrap gap-1">
        {MONTH_SHORT.map((label, i) => (
          <Chip
            key={label}
            active={value === i + 1}
            label={label}
            onClick={() => onChange({ values: [i + 1], raw: String(i + 1) })}
          />
        ))}
      </div>
    );
  }

  return (
    <Input
      type="number"
      min={spec.min}
      max={spec.max}
      value={String(value)}
      onValueChange={(v) => {
        const n = Math.min(spec.max, Math.max(spec.min, Number(v) || spec.min));
        onChange({ values: [n], raw: String(n) });
      }}
      className="h-7 w-20 font-mono text-xs"
    />
  );
}

function ListPicker({
  name,
  values,
  onToggle,
}: {
  name: CronFieldName;
  values: number[];
  onToggle: (value: number) => void;
}) {
  if (name === "dayOfWeek") {
    return (
      <div className="flex flex-wrap gap-1">
        {DOW_SHORT.map((label, i) => (
          <Chip
            key={label}
            active={values.includes(i) || (i === 0 && values.includes(7))}
            label={label}
            onClick={() => onToggle(i)}
          />
        ))}
      </div>
    );
  }

  if (name === "month") {
    return (
      <div className="flex flex-wrap gap-1">
        {MONTH_SHORT.map((label, i) => (
          <Chip
            key={label}
            active={values.includes(i + 1)}
            label={label}
            onClick={() => onToggle(i + 1)}
          />
        ))}
      </div>
    );
  }

  const spec = fieldSpec(name);
  const items =
    name === "dayOfMonth"
      ? Array.from({ length: 31 }, (_, i) => i + 1)
      : name === "hour"
        ? Array.from({ length: 24 }, (_, i) => i)
        : Array.from({ length: spec.max - spec.min + 1 }, (_, i) => spec.min + i);

  return (
    <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto">
      {items.map((n) => (
        <Chip key={n} active={values.includes(n)} label={String(n)} onClick={() => onToggle(n)} />
      ))}
    </div>
  );
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-6 min-w-7 items-center justify-center rounded px-1.5 font-mono text-[0.7rem] tabular-nums transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
