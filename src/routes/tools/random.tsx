import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { RandomTool } from '#/components/tools/RandomTool'

export const Route = createFileRoute('/tools/random')({
  head: () => ({
    meta: [
      { title: 'Random · WebTools' },
      {
        name: 'description',
        content:
          'Generate random numbers, strings, UUIDs, passwords, coin flips, dice rolls, and list picks locally in your browser.',
      },
    ],
  }),
  component: RandomPage,
})

function RandomPage() {
  return (
    <ToolShell
      title="Random"
      description="Numbers, strings, UUIDs, passwords, coin, dice, and list pick/shuffle — all local."
    >
      <RandomTool />
    </ToolShell>
  )
}
