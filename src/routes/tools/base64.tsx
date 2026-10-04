import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { Base64Tool } from '#/components/tools/Base64Tool'

export const Route = createFileRoute('/tools/base64')({
  head: () => ({
    meta: [
      { title: 'Base64 · WebTools' },
      {
        name: 'description',
        content: 'Encode or decode UTF-8 text as Base64 in the browser.',
      },
    ],
  }),
  component: Base64Page,
})

function Base64Page() {
  return (
    <ToolShell title="Base64">
      <Base64Tool />
    </ToolShell>
  )
}
