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
          'Test a regular expression with flags and live match highlights in your browser.',
      },
    ],
  }),
  component: RegexPage,
})

function RegexPage() {
  return (
    <ToolShell
      title="Regex editor"
      description="Tune a pattern and flags against a test string. Matches highlight as you type — groups listed below."
    >
      <RegexEditorTool />
    </ToolShell>
  )
}
