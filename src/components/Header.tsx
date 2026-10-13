import { Link, useRouterState } from '@tanstack/react-router'
import { CodeIcon, MenuIcon } from 'lucide-react'
import { useState } from 'react'
import { ModeToggle } from '#/components/mode-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Button } from '#/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { TOOL_ICONS } from '#/lib/tool-icons'
import {
  groupToolsByCategory,
  TOOLS,
  type ToolLink,
} from '#/lib/tools'

const toolGroups = groupToolsByCategory(TOOLS)

const TOOL_BY_PATH = new Map(TOOLS.map((tool) => [tool.to, tool]))

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const currentTool = TOOL_BY_PATH.get(pathname as ToolLink['to'])

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      {currentTool ? (
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="gap-1 text-sm sm:gap-1.5">
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbLink
                render={<Link to="/" />}
                className="font-heading inline-flex items-center gap-1.5 text-lg tracking-tight text-foreground no-underline transition-opacity hover:opacity-80 hover:text-foreground"
              >
                <CodeIcon className="size-5 shrink-0" aria-hidden />
                WebTools
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground [&>svg]:size-3.5" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate font-heading text-sm tracking-tight text-muted-foreground sm:text-base">
                {currentTool.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <Link
          to="/"
          className="font-heading inline-flex items-center gap-1.5 text-lg tracking-tight text-foreground no-underline transition-opacity hover:opacity-80"
        >
          <CodeIcon className="size-5 shrink-0" aria-hidden />
          WebTools
        </Link>
      )}

      <nav className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground sm:gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="default" className="gap-1.5" />
            }
          >
            <MenuIcon className="size-4 opacity-80" aria-hidden />
            Tools
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[min(22rem,100vw)] gap-0 p-0 sm:max-w-sm"
          >
            <SheetHeader className="border-b border-border/70 px-4 py-3">
              <SheetTitle className="text-sm">Tools</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 overflow-y-auto px-3 py-3">
              {toolGroups.map((group) => (
                <section
                  key={group.category.id}
                  className="min-w-0"
                  aria-labelledby={`sheet-cat-${group.category.id}`}
                >
                  <h3
                    id={`sheet-cat-${group.category.id}`}
                    className="font-heading mb-1.5 px-1 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {group.category.label}
                  </h3>
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {uniqueTools(group.tools).map((tool) => (
                      <li key={`${group.category.id}-${tool.to}`}>
                        <ToolSheetLink
                          tool={tool}
                          onNavigate={() => setOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <ModeToggle />
      </nav>
    </header>
  )
}

function uniqueTools(tools: ToolLink[]) {
  const seen = new Set<ToolLink['to']>()
  return tools.filter((tool) => {
    if (seen.has(tool.to)) return false
    seen.add(tool.to)
    return true
  })
}

function ToolSheetLink({
  tool,
  onNavigate,
}: {
  tool: ToolLink
  onNavigate: () => void
}) {
  const Icon = TOOL_ICONS[tool.to]

  return (
    <Item
      variant="outline"
      size="xs"
      render={<Link to={tool.to} onClick={onNavigate} />}
      className="tool-row h-full flex-nowrap items-center border-border/70 bg-card/45 py-2 no-underline hover:border-primary/35 hover:bg-muted/55"
    >
      <ItemMedia
        variant="icon"
        className="size-7 translate-y-0 self-center rounded-md bg-muted text-primary"
      >
        <Icon aria-hidden />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0">
        <ItemTitle className="font-heading text-foreground">{tool.name}</ItemTitle>
        <ItemDescription className="line-clamp-1 text-xs leading-4">
          {tool.blurb}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
