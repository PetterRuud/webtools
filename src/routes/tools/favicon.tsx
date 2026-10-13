import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy slug → App icon & manifest */
export const Route = createFileRoute("/tools/favicon")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/app-icon" });
  },
});
