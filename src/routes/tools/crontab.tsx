import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { CrontabTool } from '#/components/tools/CrontabTool'

export const Route = createFileRoute('/tools/crontab')({
  head: () => ({
    meta: [
      { title: 'Crontab builder · WebTools' },
      {
        name: 'description',
        content:
          'Build and decode cron expressions with a human-readable summary and next run times.',
      },
    ],
  }),
  component: CrontabPage,
})

function CrontabPage() {
  return (
    <ToolShell title="Crontab builder">
      <CrontabTool />
    </ToolShell>
  )
}
