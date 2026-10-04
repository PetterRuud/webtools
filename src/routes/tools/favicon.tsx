import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { FaviconGeneratorTool } from '#/components/tools/FaviconGeneratorTool'

export const Route = createFileRoute('/tools/favicon')({
  head: () => ({
    meta: [
      { title: 'Favicon generator · WebTools' },
      {
        name: 'description',
        content:
          'Generate favicon PNG and ICO packs from an image in your browser.',
      },
    ],
  }),
  component: FaviconPage,
})

function FaviconPage() {
  return (
    <ToolShell title="Favicon generator">
      <FaviconGeneratorTool />
    </ToolShell>
  )
}
