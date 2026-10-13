import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { AppIconGeneratorTool } from '#/components/tools/AppIconGeneratorTool'

export const Route = createFileRoute('/tools/app-icon')({
  head: () => ({
    meta: [
      { title: 'App icon & manifest · WebTools' },
      {
        name: 'description',
        content:
          'Generate favicon, PWA icons, and site.webmanifest from an image, SVG, or Lucide icon.',
      },
    ],
  }),
  component: AppIconPage,
})

function AppIconPage() {
  return (
    <ToolShell>
      <AppIconGeneratorTool />
    </ToolShell>
  )
}
