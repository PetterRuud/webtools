import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { MimeLookupTool } from '#/components/tools/MimeLookupTool'

export const Route = createFileRoute('/tools/mime')({
  head: () => ({
    meta: [
      { title: 'MIME types · WebTools' },
      {
        name: 'description',
        content: 'Search file extensions and MIME types.',
      },
    ],
  }),
  component: MimePage,
})

function MimePage() {
  return (
    <ToolShell>
      <MimeLookupTool />
    </ToolShell>
  )
}
