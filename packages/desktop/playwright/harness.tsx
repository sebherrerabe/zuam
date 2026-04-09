import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { VisualHarness } from "./phase3-harness";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Visual harness root element is missing");
}

const searchParams = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
const requestedView = searchParams.get("view");

createRoot(rootElement).render(
  <StrictMode>
    <VisualHarness view={requestedView} />
  </StrictMode>
);
