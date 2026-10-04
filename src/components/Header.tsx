import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link
        to="/"
        className="font-heading text-lg tracking-tight text-[var(--ink)] no-underline transition-opacity hover:opacity-80"
      >
        WebTools
      </Link>
      <nav className="flex items-center gap-5 text-sm text-muted-foreground">
        <Link
          to="/tools/hex-rgba"
          className="no-underline transition-colors hover:text-foreground"
          activeProps={{ className: 'text-foreground no-underline' }}
        >
          Hex ↔ RGBA
        </Link>
        <Link
          to="/tools/image-compress"
          className="no-underline transition-colors hover:text-foreground"
          activeProps={{ className: 'text-foreground no-underline' }}
        >
          Compress
        </Link>
      </nav>
    </header>
  )
}
