import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { BrowserInfoTool } from '#/components/tools/BrowserInfoTool'

export const Route = createFileRoute('/tools/browser-info')({
  head: () => ({
    meta: [
      { title: 'Browser info · WebTools' },
      { name: 'description', content: 'Client browser and environment details.' },
    ],
  }),
  component: BrowserInfoPage,
})

function BrowserInfoPage() {
  return (
    <ToolShell>
      <BrowserInfoTool />
    </ToolShell>
  )
}
