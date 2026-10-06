import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { BrokenLinkCheckerTool } from '#/components/tools/BrokenLinkCheckerTool'

export const Route = createFileRoute('/tools/broken-link-checker')({
  head: () => ({
    meta: [
      { title: 'Broken link checker · WebTools' },
      {
        name: 'description',
        content:
          'Fetch a page, extract links, and check status codes for internal and external URLs.',
      },
    ],
  }),
  component: BrokenLinkCheckerPage,
})

function BrokenLinkCheckerPage() {
  return (
    <ToolShell>
      <BrokenLinkCheckerTool />
    </ToolShell>
  )
}
