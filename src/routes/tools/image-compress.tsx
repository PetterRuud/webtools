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
          'Compress images in the browser at original resolution, with optional scale and crop. Files never leave your device.',
      },
    ],
  }),
  component: ImageCompressPage,
})

function ImageCompressPage() {
  return (
    <ToolShell
      title="Image compress"
      description="Pick a file, optionally crop with drag handles, scale, set quality, then download. Defaults keep the full frame at original resolution. Purely client-side — no R2, no sharp on Isolates."
    >
      <ImageCompressTool />
    </ToolShell>
  )
}
