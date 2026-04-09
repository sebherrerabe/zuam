import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import { DesktopShell } from "../src/features/shell/desktop-shell";
import { queryClient } from "../src/lib/query-client";
import { useShellStore } from "../src/lib/state/shell-store";
import "../src/styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Visual harness root element is missing");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HarnessBootstrap />
    </QueryClientProvider>
  </StrictMode>
);

function HarnessBootstrap() {
  useEffect(() => {
    useShellStore.setState({
      activeView: "today",
      activeListId: null,
      activeTagSlug: null,
      activeSavedFilterId: null,
      activePresentation: "list",
      groupBy: "section",
      sortBy: "manual",
      selectedTaskId: "task-1"
    });
  }, []);

  return <DesktopShell />;
}
