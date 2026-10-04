import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { FakeDataTool } from '#/components/tools/FakeDataTool'

export const Route = createFileRoute('/tools/fake-data')({
  head: () => ({
    meta: [
      { title: 'Fake data · WebTools' },
      {
        name: 'description',
        content:
          'Generate synthetic names, emails, phones, addresses, and JSON/CSV/SQL/XML rows locally in your browser.',
      },
    ],
  }),
  component: FakeDataPage,
})

function FakeDataPage() {
  return (
    <ToolShell
      title="Fake data"
      description="Schema → synthetic rows. JSON, CSV, SQL, XML — local."
    >
      <FakeDataTool />
    </ToolShell>
  )
}
