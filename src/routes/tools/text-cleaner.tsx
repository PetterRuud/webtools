import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { TextCleanerTool } from '#/components/tools/TextCleanerTool'

export const Route = createFileRoute('/tools/text-cleaner')({
  head: () => ({
    meta: [
      { title: 'Text cleaner · WebTools' },
      {
        name: 'description',
        content:
          'Trim, collapse spaces, drop empty lines, strip HTML, and normalize quotes locally.',
      },
    ],
  }),
  component: TextCleanerPage,
})

function TextCleanerPage() {
  return (
    <ToolShell title="Text cleaner">
      <TextCleanerTool />
    </ToolShell>
  )
}
