import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { JwtTool } from '#/components/tools/JwtTool'

export const Route = createFileRoute('/tools/jwt')({
  head: () => ({
    meta: [
      { title: 'JWT · WebTools' },
      {
        name: 'description',
        content: 'Decode and encode JWTs in the browser. Secrets stay local.',
      },
    ],
  }),
  component: JwtPage,
})

function JwtPage() {
  return (
    <ToolShell>
      <JwtTool />
    </ToolShell>
  )
}
