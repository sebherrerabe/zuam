import { createFileRoute } from "@tanstack/react-router";

import { DesktopShell } from "../features/shell/desktop-shell";

export const Route = createFileRoute("/")({
  component: DesktopShell
});
