import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { cn } from 'cn'

type ToolShellProps = {
  title: string
  description: string
  children: ReactNode
  wide?: boolean
}

export function ToolShell({
  title,
  description,
  children,
  wide = false,
}: ToolShellProps) {
  return (
    <main
      className={cn(
        'mx-auto flex w-full flex-col gap-8 px-6 pb-16 pt-2',
        wide ? 'max-w-5xl' : 'max-w-3xl',
      )}
    >
      <div className="animate-rise flex flex-col gap-3">
        <Link
          to="/"
          className="w-fit text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
        >
          ← WebTools
        </Link>
        <h1 className="font-heading m-0 text-4xl tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="m-0 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="animate-rise-delay-1">{children}</div>
    </main>
  )
}
