import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: HubPage })

const readyTools = [
  {
    to: '/tools/hex-rgba' as const,
    name: 'CSS Color',
    blurb:
      'Hex, rgba, hsl/hsla, hwb, oklch — paste any one, copy the rest.',
  },
  {
    to: '/tools/image-compress' as const,
    name: 'Image compress',
    blurb: 'Shrink a photo in the browser. Nothing leaves this device.',
  },
]

function HubPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-16">
      <section className="relative flex min-h-[72vh] flex-col justify-center gap-6 py-10">
        <p className="animate-rise font-heading m-0 text-5xl tracking-tight text-ink sm:text-7xl">
          WebTools
        </p>
        <h1 className="animate-rise-delay-1 m-0 max-w-xl text-2xl font-medium leading-snug text-ink sm:text-3xl">
          Small tools you actually reach for.
        </h1>
        <p className="animate-rise-delay-2 m-0 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
          A personal hub on Cloudflare Workers. Open a converter, compress an
          image, get out — no accounts yet, Access later.
        </p>
        <div className="animate-rise-delay-2 flex flex-wrap gap-3 pt-2">
          <Link
            to="/tools/hex-rgba"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground no-underline transition hover:bg-primary/85"
          >
            Open CSS Color
          </Link>
          <Link
            to="/tools/image-compress"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-card/70 px-4 text-sm font-medium text-foreground no-underline transition hover:bg-muted"
          >
            Compress an image
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-6 border-t border-border/70 pt-10">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading m-0 text-2xl tracking-tight text-ink">
            Tools
          </h2>
          <p className="m-0 max-w-xl text-sm leading-6 text-muted-foreground">
            Ready in the browser today. Transparent stays local until Containers
            can host sharp.
          </p>
        </div>

        <ul className="m-0 flex list-none flex-col gap-0 p-0">
          {readyTools.map((tool) => (
            <li key={tool.to}>
              <Link
                to={tool.to}
                className="tool-row group flex flex-col gap-1 border-b border-border/60 py-5 no-underline transition-colors hover:bg-muted/45 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="font-heading relative text-lg text-ink">
                  {tool.name}
                  <span className="tool-mark absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-spark" />
                </span>
                <span className="max-w-md text-sm leading-6 text-muted-foreground">
                  {tool.blurb}
                </span>
              </Link>
            </li>
          ))}
          <li className="flex flex-col gap-1 border-b border-border/60 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <span className="font-heading text-lg text-ink">
              Transparent
            </span>
            <span className="max-w-md text-sm leading-6 text-muted-foreground">
              Source lives at{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.8rem]">
                tools/transparent/
              </code>{' '}
              (Express + sharp). Run it locally — not on Workers Isolates yet;
              edge needs Containers later.
            </span>
          </li>
        </ul>
      </section>
    </main>
  )
}
