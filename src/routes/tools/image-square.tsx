import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "#/components/ToolShell";
import { ImageSquareRoundTool } from "#/components/tools/ImageSquareRoundTool";

export const Route = createFileRoute("/tools/image-square")({
  head: () => ({
    meta: [
      { title: "Square & round · WebTools" },
      {
        name: "description",
        content:
          "Pad images to a square and round the corners in the browser. Download PNG. Files never leave your device.",
      },
    ],
  }),
  component: ImageSquarePage,
});

function ImageSquarePage() {
  return (
    <ToolShell>
      <ImageSquareRoundTool />
    </ToolShell>
  );
}
