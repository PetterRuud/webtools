import { Link, createFileRoute } from '@tanstack/react-router'
import { ToolsBrowse } from '#/components/ToolsBrowse'

export const Route = createFileRoute('/')({ component: HubPage })

function HubPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-4 pb-12 sm:px-6">
      <section className="relative flex flex-col justify-center gap-3 py-6 sm:py-8">
        <p className="animate-rise font-heading m-0 text-4xl tracking-tight text-ink sm:text-5xl">
          WebTools
        </p>
        <h1 className="animate-rise-delay-1 m-0 max-w-xl text-lg font-medium leading-snug text-muted-foreground sm:text-xl">
          Small tools you actually reach for.
        </h1>
        <div className="animate-rise-delay-2 flex flex-wrap gap-2 pt-1">
          <a
            href="#tools"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground no-underline transition hover:bg-primary/85"
          >
            Browse tools
          </a>
          <Link
            to="/tools/json-formatter"
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card/70 px-3.5 text-sm font-medium text-foreground no-underline transition hover:bg-muted"
          >
            JSON formatter
          </Link>
        </div>
      </section>

      <ToolsBrowse />
    </main>
  )
}
