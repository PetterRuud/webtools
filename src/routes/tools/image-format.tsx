import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { ImageFormatTool } from '#/components/tools/ImageFormatTool'

export const Route = createFileRoute('/tools/image-format')({
  head: () => ({
    meta: [
      { title: 'Image format · WebTools' },
      {
        name: 'description',
        content: 'Convert images between PNG, JPEG, and WebP in the browser.',
      },
    ],
  }),
  component: ImageFormatPage,
})

function ImageFormatPage() {
  return (
    <ToolShell title="Image format">
      <ImageFormatTool />
    </ToolShell>
  )
}
