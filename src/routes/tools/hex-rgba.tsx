import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { HexRgbaTool } from '#/components/tools/HexRgbaTool'

export const Route = createFileRoute('/tools/hex-rgba')({
  head: () => ({
    meta: [
      { title: 'CSS Color · WebTools' },
      {
        name: 'description',
        content:
          'Convert hex, rgba, hsl/hsla, hwb, and oklch colors live — copy any format.',
      },
    ],
  }),
  component: HexRgbaPage,
})

function HexRgbaPage() {
  return (
    <ToolShell
      title="CSS Color"
      description="Paste hex, rgba, hsl/hsla, hwb, or oklch. Every field stays in sync — copy the format you need."
    >
      <HexRgbaTool />
    </ToolShell>
  )
}
