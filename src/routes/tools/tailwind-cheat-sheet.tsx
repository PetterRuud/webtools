import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { TailwindCheatSheetTool } from '#/components/tools/TailwindCheatSheetTool'

export const Route = createFileRoute('/tools/tailwind-cheat-sheet')({
  head: () => ({
    meta: [
      { title: 'Tailwind cheat sheet · WebTools' },
      {
        name: 'description',
        content:
          'Searchable Tailwind CSS utility reference — spacing, flex, grid, type, colors, and more.',
      },
    ],
  }),
  component: TailwindCheatSheetPage,
})

function TailwindCheatSheetPage() {
  return (
    <ToolShell title="Tailwind cheat sheet">
      <TailwindCheatSheetTool />
    </ToolShell>
  )
}
