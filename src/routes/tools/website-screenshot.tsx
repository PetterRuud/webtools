import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { WebsiteScreenshotTool } from '#/components/tools/WebsiteScreenshotTool'

export const Route = createFileRoute('/tools/website-screenshot')({
  head: () => ({
    meta: [
      { title: 'Website screenshot · WebTools' },
      {
        name: 'description',
        content:
          'Capture a PNG screenshot of any URL. Viewport presets, full page, preview and download.',
      },
    ],
  }),
  component: WebsiteScreenshotPage,
})

function WebsiteScreenshotPage() {
  return (
    <ToolShell title="Website screenshot">
      <WebsiteScreenshotTool />
    </ToolShell>
  )
}
