import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { BoxShadowTool } from '#/components/tools/BoxShadowTool'

export const Route = createFileRoute('/tools/box-shadow')({
  head: () => ({
    meta: [
      { title: 'Box shadow · WebTools' },
      {
        name: 'description',
        content:
          'Generate CSS box-shadow with offset, blur, spread, color, and inset.',
      },
    ],
  }),
  component: BoxShadowPage,
})

function BoxShadowPage() {
  return (
    <ToolShell title="Box shadow">
      <BoxShadowTool />
    </ToolShell>
  )
}
