import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { SpaVsBotTool } from '#/components/tools/SpaVsBotTool'

export const Route = createFileRoute('/tools/spa-vs-bot')({
  head: () => ({
    meta: [
      { title: 'SPA vs bot · WebTools' },
      {
        name: 'description',
        content:
          'Compare no-JS raw HTML (bot/crawler view) with JS-rendered page content.',
      },
    ],
  }),
  component: SpaVsBotPage,
})

function SpaVsBotPage() {
  return (
    <ToolShell>
      <SpaVsBotTool />
    </ToolShell>
  )
}
