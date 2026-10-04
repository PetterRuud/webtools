import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { CsvJsonTool } from '#/components/tools/CsvJsonTool'

export const Route = createFileRoute('/tools/csv-json')({
  head: () => ({
    meta: [
      { title: 'CSV ↔ JSON · WebTools' },
      {
        name: 'description',
        content: 'Convert CSV to JSON and JSON to CSV in the browser.',
      },
    ],
  }),
  component: CsvJsonPage,
})

function CsvJsonPage() {
  return (
    <ToolShell>
      <CsvJsonTool />
    </ToolShell>
  )
}
