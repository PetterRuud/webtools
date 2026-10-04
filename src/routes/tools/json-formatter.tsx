import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { JsonFormatterTool } from '#/components/tools/JsonFormatterTool'

export const Route = createFileRoute('/tools/json-formatter')({
  head: () => ({
    meta: [
      { title: 'JSON formatter · WebTools' },
      {
        name: 'description',
        content: 'Pretty-print, minify, and validate JSON in the browser.',
      },
    ],
  }),
  component: JsonFormatterPage,
})

function JsonFormatterPage() {
  return (
    <ToolShell>
      <JsonFormatterTool />
    </ToolShell>
  )
}
