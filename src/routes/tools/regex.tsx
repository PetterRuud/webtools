import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { RegexEditorTool } from '#/components/tools/RegexEditorTool'

export const Route = createFileRoute('/tools/regex')({
  head: () => ({
    meta: [
      { title: 'Regex editor · WebTools' },
      {
        name: 'description',
        content:
          'Test regular expressions with presets, token breakdown, and live match highlights.',
      },
    ],
  }),
  component: RegexPage,
})

function RegexPage() {
  return (
    <ToolShell title="Regex editor">
      <RegexEditorTool />
    </ToolShell>
  )
}
