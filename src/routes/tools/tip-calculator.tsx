import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { TipCalculatorTool } from '#/components/tools/TipCalculatorTool'

export const Route = createFileRoute('/tools/tip-calculator')({
  head: () => ({
    meta: [
      { title: 'Tip calculator · WebTools' },
      {
        name: 'description',
        content: 'Bill, tip percent, and split — tip and total per person.',
      },
    ],
  }),
  component: TipCalculatorPage,
})

function TipCalculatorPage() {
  return (
    <ToolShell title="Tip calculator">
      <TipCalculatorTool />
    </ToolShell>
  )
}
