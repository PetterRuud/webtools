import { createFileRoute } from '@tanstack/react-router'
import { ToolShell } from '#/components/ToolShell'
import { ImageCropTool } from '#/components/tools/ImageCropTool'

export const Route = createFileRoute('/tools/image-crop')({
  head: () => ({
    meta: [
      { title: 'Image crop · WebTools' },
      {
        name: 'description',
        content:
          'Visually crop images with aspect presets and download the result. Files never leave your device.',
      },
    ],
  }),
  component: ImageCropPage,
})

function ImageCropPage() {
  return (
    <ToolShell title="Image crop">
      <ImageCropTool />
    </ToolShell>
  )
}
