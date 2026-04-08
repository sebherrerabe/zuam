import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { resetTaskDetailCache } from "./task-detail-cache";
import { TaskDetailPanel } from "./task-detail-panel";
import { useShellStore } from "../../lib/state/shell-store";

function renderPanel(taskId = "task-1") {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <TaskDetailPanel taskId={taskId} />
    </QueryClientProvider>
  );
}

describe("task detail basic editor", () => {
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

  it("FE-UNIT-TDE-001: opens a task with title, metadata, and body fields populated", () => {
    renderPanel();

    expect(screen.getByDisplayValue("Ship nudge engine v1 (Level 0-2)")).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toHaveValue("Ship nudge engine v1 (Level 0-2)");
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toContain(
      "Cover ambient -> gentle -> firm escalation."
    );
    expect(screen.getByLabelText(/due date/i)).toHaveValue("2026-04-07");
    expect(screen.getByLabelText(/priority/i)).toHaveDisplayValue("High");
    expect(screen.getByRole("status")).toHaveTextContent("Idle");
    expect(useShellStore.getState().selectedTaskId).toBe("task-1");
  });

  it("FE-UNIT-TDE-002: typing into notes transitions through dirty and saving states and clears dirty on success", async () => {
    renderPanel();

    const notesField = screen.getByLabelText(/notes/i);
    fireEvent.change(notesField, {
      target: { value: "Cover ambient -> gentle -> firm escalation.\nKeep copy warm.\n\nUpdated copy." }
    });

    expect(screen.getByRole("status")).toHaveTextContent("Dirty");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Saving");
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Saved");
    });

    expect(screen.getByLabelText(/notes/i)).toHaveValue(
      "Cover ambient -> gentle -> firm escalation.\nKeep copy warm.\n\nUpdated copy."
    );
  });

  it("FE-UNIT-TDE-003: subtask interactions stay scoped to the selected task and update progress", () => {
    const { rerender } = renderPanel("task-1");

    expect(screen.getByText("3 / 7 · 43%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^\+ add$/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /new subtask/i }), {
      target: { value: "Wire keyboard shortcut state" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add subtask/i }));

    expect(screen.getByText("Wire keyboard shortcut state")).toBeInTheDocument();
    expect(screen.getByText("3 / 8 · 38%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /electron overlay window \(level 2\)/i }));
    expect(screen.getByText("4 / 8 · 50%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete wire keyboard shortcut state/i }));
    expect(screen.queryByText("Wire keyboard shortcut state")).not.toBeInTheDocument();
    expect(screen.getByText("4 / 7 · 57%")).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <TaskDetailPanel taskId="task-2" />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/task title/i)).toHaveValue("Review onboarding invite copy");
    expect(screen.getByText("0 / 2 · 0%")).toBeInTheDocument();
    expect(screen.queryByText("Electron overlay window (Level 2)")).not.toBeInTheDocument();
  });
});
