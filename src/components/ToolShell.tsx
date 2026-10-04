import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { cn } from 'cn'

type ToolShellProps = {
  title: string
  description?: string
  children: ReactNode
  /** Wider content rail. Defaults to true for utility density. */
  wide?: boolean
}

export function ToolShell({
  title,
  description,
  children,
  wide = true,
}: ToolShellProps) {
  return (
    <main
      className={cn(
        'mx-auto flex w-full flex-col gap-3 px-4 pb-8 pt-1 sm:px-6 md:gap-4',
        wide ? 'max-w-6xl' : 'max-w-3xl',
      )}
    >
      <div className="animate-rise flex flex-col gap-1">
        <Link
          to="/"
          className="w-fit text-xs text-muted-foreground no-underline transition-colors hover:text-foreground"
        >
          ← WebTools
        </Link>
        <h1 className="font-heading m-0 text-xl tracking-tight text-ink sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="m-0 max-w-2xl text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="animate-rise-delay-1">{children}</div>
    </main>
  )
}
