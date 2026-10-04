import { Link } from '@tanstack/react-router'
import { ModeToggle } from '#/components/mode-toggle'

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link
        to="/"
        className="font-heading text-lg tracking-tight text-ink no-underline transition-opacity hover:opacity-80"
      >
        WebTools
      </Link>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-5">
        <Link
          to="/tools/hex-rgba"
          className="no-underline transition-colors hover:text-foreground"
          activeProps={{ className: 'text-foreground no-underline' }}
        >
          CSS Color
        </Link>
        <Link
          to="/tools/image-compress"
          className="no-underline transition-colors hover:text-foreground"
          activeProps={{ className: 'text-foreground no-underline' }}
        >
          Compress
        </Link>
        <ModeToggle />
      </nav>
    </header>
  )
}
