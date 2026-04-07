import { createRouter } from "@tanstack/react-router";

import { Route as IndexRoute } from "./routes/index";
import { Route as RootRoute } from "./routes/__root";

const routeTree = RootRoute.addChildren([IndexRoute]);

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
