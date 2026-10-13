import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { ImageFormatTool } from "#/components/tools/ImageFormatTool";

export const Route = createFileRoute("/tools/image-format")({
  head: () => ({
    meta: [
      { title: "Image format · WebTools" },
      {
        name: "description",
        content: "Convert HEIC to JPG, PNG, or WebP — plus PNG ↔ JPEG ↔ WebP — in the browser.",
      },
    ],
  }),
  component: ImageFormatPage,
});

function ImageFormatPage() {
  return (
    <ToolShell>
      <ImageFormatTool />
    </ToolShell>
  );
}
