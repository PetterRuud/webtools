import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { JsonFormatterTool } from '#/components/tools/JsonFormatterTool'

export const Route = createFileRoute('/tools/json-formatter')({
  head: () => ({
    meta: [
      { title: 'JSON formatter · WebTools' },
      {
        name: 'description',
        content:
          'Pretty-print, minify, and validate JSON in the browser — then copy the result.',
      },
    ],
  }),
  component: JsonFormatterPage,
})

function JsonFormatterPage() {
  return (
    <ToolShell
      wide
      title="JSON formatter"
      description="Pretty-print, minify, or validate JSON. Indent stays under your control; nothing leaves this device."
    >
      <JsonFormatterTool />
    </ToolShell>
  )
}
