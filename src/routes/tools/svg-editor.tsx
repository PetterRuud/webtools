import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { SvgEditorTool } from '#/components/tools/SvgEditorTool'

export const Route = createFileRoute('/tools/svg-editor')({
  head: () => ({
    meta: [
      { title: 'SVG editor · WebTools' },
      {
        name: 'description',
        content:
          'Paste and edit SVG with live preview, minify, PNG export, and React component output.',
      },
    ],
  }),
  component: SvgEditorPage,
})

function SvgEditorPage() {
  return (
    <ToolShell>
      <SvgEditorTool />
    </ToolShell>
  )
}
