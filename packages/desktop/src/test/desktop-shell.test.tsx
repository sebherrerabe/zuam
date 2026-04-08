import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DesktopShell } from "../features/shell/desktop-shell";
import { resetTaskDetailCache } from "../features/tasks/task-detail-cache";
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
    resetTaskDetailCache();
    useShellStore.setState({
      activeView: "today",
      activeListId: null,
      selectedTaskId: "task-1",
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      quickCaptureOpen: false
    });
  });

  it("FE-UNIT-DSK-001: renders the canonical three-panel shell instead of the planning workspace", () => {
    renderShell();

    expect(screen.getByRole("navigation", { name: /smart lists/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ship nudge engine v1 \(level 0-2\)/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /task detail/i })).toBeInTheDocument();
    expect(screen.queryByText(/planning workspace/i)).not.toBeInTheDocument();
  });

  it("FE-UNIT-DSK-002: top-level list switching preserves the shell chrome", () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: /^Platform/ }));

    expect(screen.getByRole("heading", { level: 1, name: "Platform" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pull q1 metrics data/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-003: selecting alternate presentation tabs preserves the shell layout", () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));

    expect(screen.getByRole("button", { name: "Calendar" })).toHaveClass("is-active");
    expect(screen.getByRole("region", { name: /calendar view placeholder/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-004: quick-capture trigger and shortcut both open the same capture surface", () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: /quick capture/i }));
    expect(screen.getByRole("dialog", { name: /quick capture/i })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: /task text/i }), {
      target: { value: "Plan release ~project-zero !high tomorrow" }
    });

    expect(screen.getByText("~project-zero")).toBeInTheDocument();
    expect(screen.getByText("!high")).toBeInTheDocument();
    expect(screen.getByText("tomorrow")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByText(/use explicit tokens only/i)).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-005: mounts the sync and nudge surfaces inside the shell language", () => {
    renderShell();

    expect(screen.getByText(/google tasks connected/i)).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /notification permission required/i })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /ship nudge engine v1/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /acknowledge/i }));

    expect(screen.queryByRole("dialog", { name: /ship nudge engine v1/i })).not.toBeInTheDocument();
  });
});
