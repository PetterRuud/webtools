import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { ImageCompressTool } from '#/components/tools/ImageCompressTool'

export const Route = createFileRoute('/tools/image-compress')({
  head: () => ({
    meta: [
      { title: 'Image compress · WebTools' },
      {
        name: 'description',
        content:
          'Compress images in the browser. Files never leave your device.',
      },
    ],
  }),
  component: ImageCompressPage,
})

function ImageCompressPage() {
  return (
    <ToolShell
      title="Image compress"
      description="Pick a file, set quality and max size, download the result. Purely client-side — no R2, no sharp on Isolates."
    >
      <ImageCompressTool />
    </ToolShell>
  )
}
