import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DesktopShell } from "../features/shell/desktop-shell";
import { TaskViews } from "../features/views/task-views";
import { resetTaskDetailCache } from "../features/tasks/task-detail-cache";
import { resetDesktopApiMocks } from "../lib/api/desktop-api";
import { useShellStore } from "../lib/state/shell-store";
import type { TaskRecord } from "@zuam/shared";
import type { TaskViewQueryResult } from "../lib/api/desktop-api.types";

function renderShell() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <DesktopShell />
    </QueryClientProvider>
  );
}

function renderTaskViews(overrides: Partial<TaskViewQueryResult> & { error?: string } = {}) {
  const task = buildTask({
    id: "task-1",
    title: "Ship nudge engine v1",
    sectionId: "review",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q1_URGENT_IMPORTANT",
    priority: "high",
    energyLevel: "HIGH",
    tagSlugs: ["work"]
  });

  const query = buildTaskQuery({
    items: [task],
    groups: [
      { key: "review", label: "Review", items: [task] },
      {
        key: "launch",
        label: "Launch",
        items: [
          buildTask({
            id: "task-2",
            title: "Pull Q1 metrics data",
            sectionId: "launch",
            kanbanColumn: "IN_PROGRESS",
            matrixQuadrant: "Q2_IMPORTANT",
            priority: "medium",
            energyLevel: "MEDIUM"
          })
        ]
      }
    ],
    totalCount: 2,
    ...overrides
  });

  return render(
    <TaskViews
      activeView="today"
      activePresentation="kanban"
      selectedTaskId="task-1"
      taskQuery={query}
      focusRecommendation={{ task: null, rationale: "No active tasks are currently eligible for focus." }}
      calendarContext={undefined}
      calendarSuggestions={[]}
      onSelectTask={() => undefined}
      onMoveTask={() => undefined}
      onSetTaskStatus={() => undefined}
    />
  );
}

function buildTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: "task-base",
    userId: "user-1",
    listId: "platform",
    sectionId: "review",
    parentTaskId: null,
    title: "Ship nudge engine v1",
    notes: null,
    dueDate: "2026-04-07",
    completed: false,
    completedAt: null,
    sortOrder: 1,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "high",
    energyLevel: "HIGH",
    resistance: "MILD",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q1_URGENT_IMPORTANT",
    tagSlugs: ["work"],
    ...overrides
  };
}

function buildTaskQuery(overrides: Partial<TaskViewQueryResult> & { error?: string } = {}): TaskViewQueryResult & { error?: string } {
  return {
    items: [],
    explanation: "Matched 0 task(s)",
    predicate: {
      key: "today",
      label: "Today",
      description: "Today"
    },
    reasonsByTaskId: {},
    groupBy: "section",
    sortBy: "manual",
    groups: [],
    totalCount: 0,
    ...overrides
  };
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
    expect(screen.getByLabelText(/progression card/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /ship nudge engine v1 \(level 0-2\)/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /task detail/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zuamy/i })).toBeInTheDocument();
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
    const cardButton = await screen.findByRole("button", { name: /ship nudge engine v1/i });
    const card = cardButton.closest('[draggable="true"]');
    if (!card) {
      throw new Error("Kanban task card was not draggable");
    }
    const todoColumn = screen.getByRole("region", { name: /review/i });

    fireEvent.dragStart(card, {
      dataTransfer: {
        setData: () => undefined,
        getData: (key: string) => (key === "text/task-id" ? "task-1" : key === "text/task-title" ? "Ship nudge engine v1" : "")
      }
    });
    fireEvent.drop(todoColumn, {
      dataTransfer: {
        getData: (key: string) => (key === "text/task-id" ? "task-1" : key === "text/task-title" ? "Ship nudge engine v1" : "")
      }
    });

    expect(screen.getByText(/ship nudge engine v1 to review/i)).toBeInTheDocument();
  });

  it("FE-UNIT-FOCUS-001: focus timer lifecycle and break overlay stay attached to the selected task", async () => {
    renderShell();

    fireEvent.click(await screen.findByRole("button", { name: /start 25-min focus session/i }));
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

  it("FE-UNIT-TASK-VIEWS-003: loading, empty, and error states are explicit", () => {
    const { rerender } = render(
      <TaskViews
        activeView="today"
        activePresentation="list"
        selectedTaskId={null}
        taskQuery={undefined}
        focusRecommendation={undefined}
        calendarContext={undefined}
        calendarSuggestions={[]}
        onSelectTask={() => undefined}
        onMoveTask={() => undefined}
        onSetTaskStatus={() => undefined}
      />
    );

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByText(/loading the current task surface/i)).toBeInTheDocument();

    rerender(
      <TaskViews
        activeView="today"
        activePresentation="list"
        selectedTaskId={null}
        taskQuery={buildTaskQuery()}
        focusRecommendation={undefined}
        calendarContext={undefined}
        calendarSuggestions={[]}
        onSelectTask={() => undefined}
        onMoveTask={() => undefined}
        onSetTaskStatus={() => undefined}
      />
    );

    expect(screen.getByText(/no tasks are due today/i)).toBeInTheDocument();

    rerender(
      <TaskViews
        activeView="today"
        activePresentation="list"
        selectedTaskId={null}
        taskQuery={buildTaskQuery({ error: "Backend offline" })}
        focusRecommendation={undefined}
        calendarContext={undefined}
        calendarSuggestions={[]}
        onSelectTask={() => undefined}
        onMoveTask={() => undefined}
        onSetTaskStatus={() => undefined}
      />
    );

    expect(screen.getByText(/backend offline/i)).toBeInTheDocument();
    expect(screen.getByText(/refresh the shell or try again/i)).toBeInTheDocument();
  });

  it("FE-UNIT-TASK-VIEWS-004: kanban moves show saving feedback before the refetch lands", () => {
    renderTaskViews();

    const cardButton = screen.getByRole("button", { name: /ship nudge engine v1/i });
    const card = cardButton.closest('[draggable="true"]');
    if (!card) {
      throw new Error("Task card was not draggable");
    }
    const launchColumn = screen.getByRole("region", { name: /launch/i });

    fireEvent.dragStart(card, {
      dataTransfer: {
        setData: () => undefined,
        getData: (key: string) => (key === "text/task-id" ? "task-1" : key === "text/task-title" ? "Ship nudge engine v1" : "")
      }
    });
    fireEvent.drop(launchColumn, {
      dataTransfer: {
        getData: (key: string) => (key === "text/task-id" ? "task-1" : key === "text/task-title" ? "Ship nudge engine v1" : "")
      }
    });

    expect(screen.getByText(/ship nudge engine v1 to launch/i)).toBeInTheDocument();
  });
});
