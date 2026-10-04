import { Link, createFileRoute } from '@tanstack/react-router'
import { ToolsBrowse } from '#/components/ToolsBrowse'

export const Route = createFileRoute('/')({ component: HubPage })

function HubPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-16">
      <section className="relative flex min-h-[58vh] flex-col justify-center gap-6 py-10">
        <p className="animate-rise font-heading m-0 text-5xl tracking-tight text-ink sm:text-7xl">
          WebTools
        </p>
        <h1 className="animate-rise-delay-1 m-0 max-w-xl text-2xl font-medium leading-snug text-ink sm:text-3xl">
          Small tools you actually reach for.
        </h1>
        <p className="animate-rise-delay-2 m-0 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
          A personal hub on Cloudflare Workers. Format JSON, test a regex,
          compress an image — get out. No accounts yet; Access later.
        </p>
        <div className="animate-rise-delay-2 flex flex-wrap gap-3 pt-2">
          <a
            href="#tools"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground no-underline transition hover:bg-primary/85"
          >
            Browse tools
          </a>
          <Link
            to="/tools/json-formatter"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-card/70 px-4 text-sm font-medium text-foreground no-underline transition hover:bg-muted"
          >
            Open JSON formatter
          </Link>
        </div>
      </section>

      <ToolsBrowse />
    </main>
  )
}
