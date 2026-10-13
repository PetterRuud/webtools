import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { ImageResizeTool } from "#/components/tools/ImageResizeTool";

export const Route = createFileRoute("/tools/image-resize")({
  head: () => ({
    meta: [
      { title: "Image resize · WebTools" },
      {
        name: "description",
        content:
          "Resize images by width and height in the browser. Lock aspect ratio, preview, download. Files never leave your device.",
      },
    ],
  }),
  component: ImageResizePage,
});

function ImageResizePage() {
  return (
    <ToolShell>
      <ImageResizeTool />
    </ToolShell>
  );
}
