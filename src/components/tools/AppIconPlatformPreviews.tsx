import { cn } from "cn";

type AppIconPlatformPreviewsProps = {
  iconUrl: string | null;
  appName: string;
  shortName: string;
};

const FILLER = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-lime-500",
] as const;

function SlotIcon({
  src,
  className,
  placeholderClassName,
}: {
  src: string | null;
  className?: string;
  placeholderClassName?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("block size-full object-contain", className)}
        draggable={false}
      />
    );
  }
  return (
    <div className={cn("size-full bg-muted-foreground/25", placeholderClassName, className)} />
  );
}

function HomeGrid({
  wallpaper,
  iconUrl,
  label,
  radiusClass,
  labelClass,
  fillerTone,
}: {
  wallpaper: string;
  iconUrl: string | null;
  label: string;
  radiusClass: string;
  labelClass: string;
  fillerTone: "dark" | "light";
}) {
  return (
    <div className={cn("rounded-xl px-3 py-4", wallpaper)}>
      <div className="mx-auto grid max-w-[13rem] grid-cols-4 gap-x-2.5 gap-y-3">
        {Array.from({ length: 8 }, (_, slot) => {
          const isApp = slot === 0;
          return (
            <div key={slot} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "size-10 overflow-hidden shadow-sm",
                  radiusClass,
                  !isApp &&
                    (fillerTone === "dark"
                      ? FILLER[slot % FILLER.length]
                      : FILLER[slot % FILLER.length]),
                )}
              >
                {isApp ? <SlotIcon src={iconUrl} className={radiusClass} /> : null}
              </div>
              <span
                className={cn("max-w-10 truncate text-center text-[9px] leading-none", labelClass)}
              >
                {isApp ? label : "App"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShapeCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-2 py-3">
      <div className="flex size-20 items-center justify-center overflow-hidden bg-white dark:bg-zinc-950">
        {children}
      </div>
      <div className="text-center">
        <p className="m-0 text-xs font-medium text-foreground">{title}</p>
        <p className="m-0 text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/** Always-on platform mocks — iOS + Android homes, plus shape samples. */
export function AppIconPlatformPreviews({
  iconUrl,
  appName,
  shortName,
}: AppIconPlatformPreviewsProps) {
  const label = shortName.trim() || appName.trim() || "Your App";

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Preview
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-xs text-muted-foreground">iOS</p>
          <HomeGrid
            wallpaper="bg-zinc-900"
            iconUrl={iconUrl}
            label={label}
            radiusClass="rounded-[22%]"
            labelClass="text-zinc-200"
            fillerTone="dark"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-xs text-muted-foreground">Android</p>
          <HomeGrid
            wallpaper="bg-zinc-100 dark:bg-zinc-800"
            iconUrl={iconUrl}
            label={label}
            radiusClass="rounded-2xl"
            labelClass="text-zinc-700 dark:text-zinc-200"
            fillerTone="light"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ShapeCard title="App Store" subtitle="1024 · rounded">
          <div className="size-16 overflow-hidden rounded-[22%]">
            <SlotIcon src={iconUrl} />
          </div>
        </ShapeCard>
        <ShapeCard title="Round" subtitle="Android">
          <div className="size-16 overflow-hidden rounded-full">
            <SlotIcon src={iconUrl} />
          </div>
        </ShapeCard>
        <ShapeCard title="Square" subtitle="Legacy / web">
          <div className="size-16 overflow-hidden rounded-none">
            <SlotIcon src={iconUrl} />
          </div>
        </ShapeCard>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5">
        <p className="m-0 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Web
        </p>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
          <div className="size-3.5 overflow-hidden rounded-sm">
            <SlotIcon src={iconUrl} />
          </div>
          <span className="max-w-28 truncate text-[11px] text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 overflow-hidden rounded-lg">
            <SlotIcon src={iconUrl} />
          </div>
          <div className="size-5 overflow-hidden rounded-md">
            <SlotIcon src={iconUrl} />
          </div>
          <div className="size-3.5 overflow-hidden rounded-sm">
            <SlotIcon src={iconUrl} />
          </div>
          <span className="text-[10px] text-muted-foreground">180 · 32 · 16</span>
        </div>
      </div>
    </div>
  );
}
