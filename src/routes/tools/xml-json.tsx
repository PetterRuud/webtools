import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { XmlJsonTool } from '#/components/tools/XmlJsonTool'

export const Route = createFileRoute('/tools/xml-json')({
  head: () => ({
    meta: [
      { title: 'XML ↔ JSON · WebTools' },
      {
        name: 'description',
        content: 'Convert XML to JSON or JSON to XML in the browser.',
      },
    ],
  }),
  component: XmlJsonPage,
})

function XmlJsonPage() {
  return (
    <ToolShell>
      <XmlJsonTool />
    </ToolShell>
  )
}
