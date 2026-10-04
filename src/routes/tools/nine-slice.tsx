import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { NineSliceTool } from '#/components/tools/NineSliceTool'

export const Route = createFileRoute('/tools/nine-slice')({
  head: () => ({
    meta: [
      { title: '9-slicer · WebTools' },
      {
        name: 'description',
        content:
          'Set 9-slice guides, preview stretch/tile, and export border-image CSS or sliced PNGs. Files stay in your browser.',
      },
    ],
  }),
  component: NineSlicePage,
})

function NineSlicePage() {
  return (
    <ToolShell>
      <NineSliceTool />
    </ToolShell>
  )
}
