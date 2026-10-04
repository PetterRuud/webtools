import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { TransparentTool } from '#/components/tools/TransparentTool'

export const Route = createFileRoute('/tools/transparent')({
  head: () => ({
    meta: [
      { title: 'Transparent · WebTools' },
      {
        name: 'description',
        content:
          'Recover PNG alpha from the same subject on white and black backgrounds. Uses Node + sharp locally.',
      },
    ],
  }),
  component: TransparentPage,
})

function TransparentPage() {
  return (
    <ToolShell>
      <TransparentTool />
    </ToolShell>
  )
}
