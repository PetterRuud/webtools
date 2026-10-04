import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { TsInterfaceTool } from '#/components/tools/TsInterfaceTool'

export const Route = createFileRoute('/tools/ts-interface')({
  head: () => ({
    meta: [
      { title: 'TS interface · WebTools' },
      {
        name: 'description',
        content:
          'Paste JSON and generate TypeScript interfaces or type aliases in the browser.',
      },
    ],
  }),
  component: TsInterfacePage,
})

function TsInterfacePage() {
  return (
    <ToolShell title="TS interface">
      <TsInterfaceTool />
    </ToolShell>
  )
}
