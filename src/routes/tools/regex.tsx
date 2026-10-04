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
          'Test regular expressions with common presets, token breakdown, live match highlights, and group details — all in your browser.',
      },
    ],
  }),
  component: RegexPage,
})

function RegexPage() {
  return (
    <ToolShell
      title="Regex editor"
      description="Start from a common pattern, read the token breakdown, and inspect matches with highlights and capture groups."
      wide
    >
      <RegexEditorTool />
    </ToolShell>
  )
}
