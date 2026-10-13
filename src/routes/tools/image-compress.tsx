import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { ImageCompressTool } from "#/components/tools/ImageCompressTool";

export const Route = createFileRoute("/tools/image-compress")({
  head: () => ({
    meta: [
      { title: "Image compress · WebTools" },
      {
        name: "description",
        content: "Scale and compress images in the browser. Files never leave your device.",
      },
    ],
  }),
  component: ImageCompressPage,
});

function ImageCompressPage() {
  return (
    <ToolShell>
      <ImageCompressTool />
    </ToolShell>
  );
}
