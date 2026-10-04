import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { GitCommandsTool } from '#/components/tools/GitCommandsTool'

export const Route = createFileRoute('/tools/git-commands')({
  head: () => ({
    meta: [
      { title: 'Git commands · WebTools' },
      {
        name: 'description',
        content:
          'Searchable git forensics cheatsheet — churn, authors, bug clusters, velocity, firefighting. Copyable with since/head/grep builders.',
      },
    ],
  }),
  component: GitCommandsPage,
})

function GitCommandsPage() {
  return (
    <ToolShell title="Git commands">
      <GitCommandsTool />
    </ToolShell>
  )
}
