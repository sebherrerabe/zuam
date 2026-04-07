import { createRoute, createFileRoute } from "@tanstack/react-router";

import { loadDesktopEnv } from "../config/env";
import { useShellStore } from "../lib/state/shell-store";
import { shellTheme } from "../lib/theme";
import { Route as RootRoute } from "./__root";

export const Route = createRoute("/")({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomeRoute
});

function HomeRoute() {
  const activeView = useShellStore((state) => state.activeView);
  const env = loadDesktopEnv(import.meta.env as Record<string, string | undefined>);

  return (
    <main className="shell">
      <aside className="panel panel-sidebar">
        <p className="eyebrow">Sidebar</p>
        <h1>Zuam</h1>
        <p>Current view: {activeView}</p>
      </aside>
      <section className="panel panel-main">
        <p className="eyebrow">Main</p>
        <h2>Desktop shell scaffold</h2>
        <p>API base URL: {env.VITE_API_BASE_URL}</p>
      </section>
      <aside className="panel panel-detail">
        <p className="eyebrow">Detail</p>
        <p>Accent token: {shellTheme.accent}</p>
        <p>Typography: {shellTheme.bodyFont}</p>
      </aside>
    </main>
  );
}
