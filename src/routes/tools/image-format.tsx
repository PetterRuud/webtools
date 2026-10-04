import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { ImageFormatTool } from '#/components/tools/ImageFormatTool'

export const Route = createFileRoute('/tools/image-format')({
  head: () => ({
    meta: [
      { title: 'Image format · WebTools' },
      {
        name: 'description',
        content:
          'Convert images between PNG, JPEG, and WebP in the browser — pick a format, set quality if lossy, download.',
      },
    ],
  }),
  component: ImageFormatPage,
})

function ImageFormatPage() {
  return (
    <ToolShell
      title="Image format"
      description="Convert between PNG, JPEG, and WebP without leaving the browser. Same pixels, new container — use Image compress when you need crop, scale, or a smaller file."
    >
      <ImageFormatTool />
    </ToolShell>
  )
}
