import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DesktopShell } from "../features/shell/desktop-shell";
import { resetTaskDetailCache } from "../features/tasks/task-detail-cache";
import { resetDesktopApiMocks } from "../lib/api/desktop-api";
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
    resetDesktopApiMocks();
    useShellStore.setState({
      activeView: "today",
      activeListId: null,
      activeTagSlug: null,
      activeSavedFilterId: null,
      activePresentation: "list",
      groupBy: "section",
      sortBy: "manual",
      selectedTaskId: "task-1",
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      quickCaptureOpen: false
    });
  });

  it("FE-UNIT-DSK-001: renders the canonical three-panel shell instead of the planning workspace", async () => {
    renderShell();

    expect(screen.getByRole("navigation", { name: /smart lists/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /ship nudge engine v1 \(level 0-2\)/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /task detail/i })).toBeInTheDocument();
    expect(screen.queryByText(/planning workspace/i)).not.toBeInTheDocument();
  });

  it("FE-UNIT-DSK-002: top-level list switching preserves the shell chrome", async () => {
    renderShell();

    fireEvent.click(await screen.findByRole("button", { name: /^Platform$/ }));

    expect(screen.getByRole("heading", { level: 1, name: "Platform" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /pull q1 metrics data/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  it("FE-UNIT-DSK-003: selecting alternate presentation tabs preserves the shell layout", async () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));

    expect(screen.getByRole("button", { name: "Calendar" })).toHaveClass("is-active");
    expect(await screen.findByRole("region", { name: /calendar task view/i })).toBeInTheDocument();
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

  it("FE-UNIT-TASK-VIEWS-001: kanban and matrix views preserve task selection while switching surfaces", async () => {
    renderShell();

    const selectedTask = await screen.findByRole("button", { name: /ship nudge engine v1 \(level 0-2\)/i });
    fireEvent.click(selectedTask);
    fireEvent.click(screen.getByRole("button", { name: "Kanban" }));
    expect(await screen.findByRole("region", { name: /kanban view/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Matrix" }));
    expect(await screen.findByRole("region", { name: /matrix view/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/ship nudge engine v1 \(level 0-2\)/i)).toBeInTheDocument();
  });

  it("FE-UNIT-TASK-VIEWS-002: moving a task across kanban columns updates the visible board state", async () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: "Kanban" }));
    const card = await screen.findByRole("button", { name: /ship nudge engine v1 \(level 0-2\)high - high/i });
    const todoColumn = screen.getByRole("region", { name: /review/i });

    fireEvent.dragStart(card, {
      dataTransfer: {
        setData: () => undefined,
        getData: () => "task-1"
      }
    });
    fireEvent.drop(todoColumn, {
      dataTransfer: {
        getData: () => "task-1"
      }
    });

    await waitFor(() => {
      expect(screen.getByRole("region", { name: /review/i })).toHaveTextContent(/ship nudge engine v1/i);
    });
  });

  it("FE-UNIT-FOCUS-001: focus timer lifecycle and break overlay stay attached to the selected task", async () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: /start 25-min focus session/i }));
    expect(await screen.findByRole("complementary", { name: /focus session/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /break/i }));
    expect(await screen.findByRole("dialog", { name: /break in progress/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resume focus/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /break in progress/i })).not.toBeInTheDocument();
    });
  });

  it("FE-UNIT-GCAL-001: task detail shows calendar-aware scheduling guidance", async () => {
    renderShell();

    await screen.findByRole("button", { name: /ship nudge engine v1 \(level 0-2\)/i });
    expect(await screen.findByText(/best next slot/i)).toBeInTheDocument();
  });
});
