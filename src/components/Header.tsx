import { Link } from '@tanstack/react-router'
import { ChevronDownIcon } from 'lucide-react'
import { ModeToggle } from '#/components/mode-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { TOOL_ICONS } from '#/lib/tool-icons'
import { groupToolsByCategory, TOOLS } from '#/lib/tools'

const toolGroups = groupToolsByCategory(TOOLS)

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <Link
        to="/"
        className="font-heading text-lg tracking-tight text-ink no-underline transition-opacity hover:opacity-80"
      >
        WebTools
      </Link>
      <nav className="flex items-center gap-3 text-sm text-muted-foreground sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 no-underline transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            Tools
            <ChevronDownIcon className="size-3.5 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            {toolGroups.map((group) => (
              <DropdownMenuGroup key={group.category.id}>
                <DropdownMenuLabel>{group.category.label}</DropdownMenuLabel>
                {group.tools.map((tool) => {
                  const Icon = TOOL_ICONS[tool.to]
                  return (
                    <DropdownMenuItem
                      key={tool.to}
                      render={<Link to={tool.to} />}
                      className="cursor-pointer gap-2"
                    >
                      <Icon
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      {tool.name}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
      </nav>
    </header>
  )
}
