import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { HexRgbaTool } from '#/components/tools/HexRgbaTool'

export const Route = createFileRoute('/tools/hex-rgba')({
  head: () => ({
    meta: [
      { title: 'Hex ↔ RGBA · WebTools' },
      {
        name: 'description',
        content: 'Convert hex colors to CSS rgba and back, with copy buttons.',
      },
    ],
  }),
  component: HexRgbaPage,
})

function HexRgbaPage() {
  return (
    <ToolShell
      title="Hex ↔ RGBA"
      description="Client-side color conversion. Paste either form, nudge the channels, copy what you need."
    >
      <HexRgbaTool />
    </ToolShell>
  )
}
