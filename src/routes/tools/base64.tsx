import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { Base64Tool } from '#/components/tools/Base64Tool'

export const Route = createFileRoute('/tools/base64')({
  head: () => ({
    meta: [
      { title: 'Base64 · WebTools' },
      {
        name: 'description',
        content:
          'Encode or decode UTF-8 text as Base64 entirely in your browser.',
      },
    ],
  }),
  component: Base64Page,
})

function Base64Page() {
  return (
    <ToolShell
      wide
      title="Base64"
      description="Encode text to Base64 or decode it back — UTF-8 safe for accents and emoji."
    >
      <Base64Tool />
    </ToolShell>
  )
}
