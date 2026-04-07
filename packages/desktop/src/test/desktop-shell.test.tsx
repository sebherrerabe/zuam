import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DesktopShell } from "../features/shell/desktop-shell";
import { useShellStore } from "../lib/state/shell-store";

function renderShell() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <DesktopShell />
    </QueryClientProvider>
  );
}

describe("desktop shell layout", () => {
  beforeEach(() => {
    useShellStore.setState({
      activeView: "today",
      activeListId: null,
      selectedTaskId: "task-1",
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      quickCaptureOpen: false
    });
  });

  it("FE-UNIT-DSK-001: renders the persistent chat workspace and review panel regions", () => {
    renderShell();

    expect(screen.getByRole("region", { name: /zuamy chat/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /plan review/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Zuamy" })).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-002: review tabs expose the layered review surfaces with Summary active by default", () => {
    renderShell();

    expect(screen.getByRole("button", { name: "Summary" })).toHaveClass("is-active");
    expect(screen.getByText("Proposed Plan")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));

    expect(screen.getByRole("button", { name: "Calendar" })).toHaveClass("is-active");
    expect(
      screen.getByText(
        "This panel is reserved for the layered review surface documented in the planning architecture."
      )
    ).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-003: the summary tab preserves the understanding card and proposed plan content without layout shift", () => {
    renderShell();

    expect(screen.getByRole("heading", { name: "Understanding" })).toBeInTheDocument();
    expect(
      screen.getByText(/you have 3 priorities this week: investor update \(due thu\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Today (Sun)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve Plan" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /google tasks sync/i })).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-004: input-bar trigger and shortcut both open the same quick-capture surface", () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: /ask zuamy/i }));
    expect(screen.getByRole("dialog", { name: /quick capture/i })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: /task text/i }), {
      target: { value: "Plan release ~project-zero !high tomorrow" }
    });

    expect(screen.getByText("~project-zero")).toBeInTheDocument();
    expect(screen.getByText("!high")).toBeInTheDocument();
    expect(screen.getByText("tomorrow")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByRole("dialog", { name: /quick capture/i })).toBeInTheDocument();
    expect(screen.getByText(/use explicit tokens only/i)).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-005: mounts the sync status card and nudge surfaces inside the shell", () => {
    renderShell();

    expect(screen.getByRole("region", { name: /google tasks sync/i })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /notification permission required/i })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /ship nudge engine v1/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /acknowledge/i }));

    expect(screen.queryByRole("dialog", { name: /ship nudge engine v1/i })).not.toBeInTheDocument();
  });
});
