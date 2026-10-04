import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { TextDiffTool } from '#/components/tools/TextDiffTool'

export const Route = createFileRoute('/tools/text-diff')({
  head: () => ({
    meta: [
      { title: 'Text diff · WebTools' },
      {
        name: 'description',
        content:
          'Compare two texts side by side or in a unified view — additions and removals highlighted.',
      },
    ],
  }),
  component: TextDiffPage,
})

function TextDiffPage() {
  return (
    <ToolShell
      wide
      title="Text diff"
      description="Paste original and changed text. See additions and removals in a split or unified view."
    >
      <TextDiffTool />
    </ToolShell>
  )
}
