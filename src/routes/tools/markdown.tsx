import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { MarkdownTool } from '#/components/tools/MarkdownTool'

export const Route = createFileRoute('/tools/markdown')({
  head: () => ({
    meta: [
      { title: 'Markdown · WebTools' },
      {
        name: 'description',
        content: 'Edit Markdown with a live preview. Copy or download HTML locally.',
      },
    ],
  }),
  component: MarkdownPage,
})

function MarkdownPage() {
  return (
    <ToolShell title="Markdown">
      <MarkdownTool />
    </ToolShell>
  )
}
