import { useEffect, useState, type ReactNode } from "react";

import type { TaskRecord } from "@zuam/shared";

import type {
  FocusQueueRecommendation,
  GoogleCalendarContextSnapshot,
  ScheduleSuggestion,
  TaskViewQueryResult
} from "../../lib/api/desktop-api.types";
import type { ShellPresentation, ShellView } from "../../lib/state/shell-store";

type TaskViewQuerySurfaceResult = TaskViewQueryResult & {
  error?: string;
};

type GoogleCalendarContextSurface = GoogleCalendarContextSnapshot & {
  error?: string;
};

type PendingMove = {
  taskId: string;
  taskTitle: string;
  destinationKey: string;
  destinationLabel: string;
  destinationKind: "kanban" | "matrix";
};

type TaskViewsProps = {
  activeView: ShellView;
  activePresentation: ShellPresentation;
  selectedTaskId: string | null;
  taskQuery: TaskViewQuerySurfaceResult | undefined;
  focusRecommendation: FocusQueueRecommendation | undefined;
  calendarContext: GoogleCalendarContextSurface | undefined;
  calendarSuggestions: ScheduleSuggestion[];
  onSelectTask: (taskId: string) => void;
  onMoveTask: (taskId: string, input: {
    sectionId?: string | null;
    kanbanColumn?: TaskRecord["kanbanColumn"];
    matrixQuadrant?: TaskRecord["matrixQuadrant"];
    sortOrder?: number;
  }) => void;
  onSetTaskStatus: (taskId: string, status: TaskRecord["status"]) => void;
};

export function TaskViews({
  activeView,
  activePresentation,
  selectedTaskId,
  taskQuery,
  focusRecommendation,
  calendarContext,
  calendarSuggestions,
  onSelectTask,
  onMoveTask,
  onSetTaskStatus
}: TaskViewsProps) {
  if (!taskQuery) {
    return (
      <section className="desktop-placeholder-panel desktop-surface-panel" aria-label="loading task view">
        <p className="desktop-surface-kicker">Loading</p>
        <h2>{resolveSurfaceHeading(activeView, activePresentation)}</h2>
        <p>{resolveLoadingCopy(activeView, activePresentation)}</p>
      </section>
    );
  }

  if (taskQuery.error) {
    return (
      <section className="desktop-placeholder-panel desktop-surface-panel is-error" aria-label="task surface error">
        <p className="desktop-surface-kicker">Unable to load</p>
        <h2>{resolveSurfaceHeading(activeView, activePresentation)}</h2>
        <p>{taskQuery.error}</p>
        <p>Refresh the shell or try again after the backend recovers.</p>
      </section>
    );
  }

  if (taskQuery.totalCount === 0) {
    return (
      <section className="desktop-placeholder-panel desktop-surface-panel" aria-label="empty task view">
        <p className="desktop-surface-kicker">Empty</p>
        <h2>{resolveSurfaceHeading(activeView, activePresentation)}</h2>
        <p>{resolveEmptyCopy(activeView)}</p>
      </section>
    );
  }

  if (activeView === "focusQueue") {
    return (
        <FocusQueueView
          recommendation={focusRecommendation}
          suggestions={calendarSuggestions}
          selectedTaskId={selectedTaskId}
          tasks={taskQuery.items}
          onSelectTask={onSelectTask}
        />
      );
  }

  switch (activePresentation) {
    case "kanban":
      return (
        <KanbanView
          groups={taskQuery.groups}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
          onMoveTask={onMoveTask}
        />
      );
    case "matrix":
      return (
        <MatrixView
          groups={taskQuery.groups}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
          onMoveTask={onMoveTask}
        />
      );
    case "calendar":
      return <CalendarView context={calendarContext} suggestions={calendarSuggestions} onSelectTask={onSelectTask} />;
    case "list":
    default:
      return <ListView groups={taskQuery.groups} selectedTaskId={selectedTaskId} onSelectTask={onSelectTask} onSetTaskStatus={onSetTaskStatus} />;
  }
}

function ListView({
  groups,
  selectedTaskId,
  onSelectTask,
  onSetTaskStatus
}: {
  groups: TaskViewQueryResult["groups"];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onSetTaskStatus: (taskId: string, status: TaskRecord["status"]) => void;
}) {
  return (
    <div className="task-section-stack">
      {groups.map((group) => (
        <section key={group.key} className="task-section">
          <header className="task-section-header">
            <span className="task-section-label">{group.label}</span>
            <span className="task-section-count">{group.items.length}</span>
          </header>
          <div className="task-list">
            {group.items.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                selected={selectedTaskId === task.id}
                onSelect={() => onSelectTask(task.id)}
                trailingActions={
                  <>
                    <button type="button" className="task-inline-action" onClick={() => onSetTaskStatus(task.id, "completed")}>
                      Done
                    </button>
                    <button type="button" className="task-inline-action is-muted" onClick={() => onSetTaskStatus(task.id, "wont_do")}>
                      Won&apos;t do
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function KanbanView({
  groups,
  selectedTaskId,
  onSelectTask,
  onMoveTask
}: {
  groups: TaskViewQueryResult["groups"];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onMoveTask: TaskViewsProps["onMoveTask"];
}) {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  useEffect(() => {
    if (!pendingMove) {
      return;
    }

    const movedTask = groups.flatMap((group) => group.items).find((task) => task.id === pendingMove.taskId);
    const landedInDestination = groups.some((group) => group.key === pendingMove.destinationKey && group.items.some((task) => task.id === pendingMove.taskId));
    const timer = window.setTimeout(() => setPendingMove(null), landedInDestination || !movedTask ? 900 : 2200);
    return () => window.clearTimeout(timer);
  }, [groups, pendingMove]);

  return (
    <div className="board-grid" role="region" aria-label="kanban view">
      {groups.map((group) => (
        <DropColumn
          key={group.key}
          title={group.label}
          tasks={group.items}
          destination="kanban"
          destinationId={group.key}
          isHovered={hoveredColumn === group.key}
          selectedTaskId={selectedTaskId}
          movingTaskId={pendingMove?.taskId ?? null}
          onSelectTask={onSelectTask}
          onHoverChange={setHoveredColumn}
          onMoveTask={onMoveTask}
          onMoveQueued={(move) => setPendingMove(move)}
        />
      ))}
      {pendingMove ? (
        <div className="desktop-view-banner" aria-live="polite">
          <strong>Saving move...</strong>
          <span>
            {pendingMove.taskTitle} to {pendingMove.destinationLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function MatrixView({
  groups,
  selectedTaskId,
  onSelectTask,
  onMoveTask
}: {
  groups: TaskViewQueryResult["groups"];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onMoveTask: TaskViewsProps["onMoveTask"];
}) {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  useEffect(() => {
    if (!pendingMove) {
      return;
    }

    const landedInDestination = groups.some((group) => group.key === pendingMove.destinationKey && group.items.some((task) => task.id === pendingMove.taskId));
    const timer = window.setTimeout(() => setPendingMove(null), landedInDestination ? 900 : 2200);
    return () => window.clearTimeout(timer);
  }, [groups, pendingMove]);

  return (
    <div className="matrix-grid" role="region" aria-label="matrix view">
      {groups.map((group) => (
        <DropColumn
          key={group.key}
          title={group.label}
          tasks={group.items}
          destination="matrix"
          destinationId={group.key}
          isHovered={hoveredColumn === group.key}
          selectedTaskId={selectedTaskId}
          movingTaskId={pendingMove?.taskId ?? null}
          onSelectTask={onSelectTask}
          onHoverChange={setHoveredColumn}
          onMoveTask={onMoveTask}
          onMoveQueued={(move) => setPendingMove(move)}
        />
      ))}
      {pendingMove ? (
        <div className="desktop-view-banner" aria-live="polite">
          <strong>Saving move...</strong>
          <span>
            {pendingMove.taskTitle} to {pendingMove.destinationLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function CalendarView({
  context,
  suggestions,
  onSelectTask
}: {
  context: GoogleCalendarContextSurface | undefined;
  suggestions: ScheduleSuggestion[];
  onSelectTask: (taskId: string) => void;
}) {
  if (context?.error) {
    return (
      <section className="desktop-placeholder-panel desktop-surface-panel is-error" role="region" aria-label="calendar task view">
        <p className="desktop-surface-kicker">Calendar unavailable</p>
        <h2>Calendar context</h2>
        <p>{context.error}</p>
      </section>
    );
  }

  return (
    <section className="desktop-placeholder-panel" role="region" aria-label="calendar task view">
      <h2>Calendar context</h2>
      <p>
        {context?.stale
          ? "Calendar context is stale. Refresh before committing a new focus block."
          : `Busy blocks: ${context?.busyBlocks.length ?? 0}. Free windows: ${context?.freeWindows.length ?? 0}.`}
      </p>
      <div className="calendar-window-stack">
        {(context?.busyBlocks ?? []).map((busy) => (
          <div key={busy.id} className="calendar-window-card is-busy">
            <strong>{busy.calendarSummary}</strong>
            <span>{formatTimeRange(busy.start, busy.end)}</span>
          </div>
        ))}
      </div>
      <div className="calendar-window-stack">
        {suggestions.map((suggestion) => (
          <button key={`${suggestion.taskId}:${suggestion.start}`} type="button" className="calendar-window-card is-suggestion" onClick={() => onSelectTask(suggestion.taskId)}>
            <strong>{suggestion.taskTitle}</strong>
            <span>{formatTimeRange(suggestion.start, suggestion.end)}</span>
            <span>{suggestion.rationale}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FocusQueueView({
  recommendation,
  suggestions,
  selectedTaskId,
  tasks,
  onSelectTask
}: {
  recommendation: FocusQueueRecommendation | undefined;
  suggestions: ScheduleSuggestion[];
  selectedTaskId: string | null;
  tasks: TaskRecord[];
  onSelectTask: (taskId: string) => void;
}) {
  return (
    <div className="focus-queue-stack">
      <section className="focus-recommendation-card" aria-label="focus queue recommendation">
        <p className="focus-recommendation-eyebrow">Focus Queue</p>
        <h2>{recommendation?.task?.title ?? "No recommendation"}</h2>
        <p>{recommendation?.rationale ?? "No active tasks qualify right now."}</p>
        {suggestions[0] ? <p className="focus-recommendation-slot">Best next slot: {formatTimeRange(suggestions[0].start, suggestions[0].end)}</p> : null}
      </section>
      <section className="task-section">
        <header className="task-section-header">
          <span className="task-section-label">Supporting tasks</span>
          <span className="task-section-count">{tasks.length}</span>
        </header>
        <div className="task-list">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} selected={selectedTaskId === task.id} onSelect={() => onSelectTask(task.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function DropColumn({
  title,
  tasks,
  destination,
  destinationId,
  isHovered,
  selectedTaskId,
  movingTaskId,
  onSelectTask,
  onHoverChange,
  onMoveTask,
  onMoveQueued
}: {
  title: string;
  tasks: TaskRecord[];
  destination: "kanban" | "matrix";
  destinationId: string;
  isHovered: boolean;
  selectedTaskId: string | null;
  movingTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onHoverChange: (columnKey: string | null) => void;
  onMoveTask: TaskViewsProps["onMoveTask"];
  onMoveQueued: (move: PendingMove) => void;
}) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragTaskTitle, setDragTaskTitle] = useState<string | null>(null);

  return (
    <section
      className={`board-column${isHovered || dragTaskId ? " is-drop-target" : ""}`}
      role="region"
      aria-label={title}
      onDragEnter={() => onHoverChange(destinationId)}
      onDragLeave={() => onHoverChange(null)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text/task-id") || dragTaskId;
        if (!taskId) {
          onHoverChange(null);
          return;
        }

        const task = tasks.find((item) => item.id === taskId);
        const taskTitle = dragTaskTitle || event.dataTransfer.getData("text/task-title") || task?.title || "Task";
        onMoveQueued({
          taskId,
          taskTitle,
          destinationKey: destinationId,
          destinationLabel: title,
          destinationKind: destination
        });
        if (destination === "kanban") {
          onMoveTask(taskId, {
            sectionId: destinationId === "unsectioned" ? null : destinationId,
            kanbanColumn: mapSectionToKanban(destinationId)
          });
        } else {
          onMoveTask(taskId, {
            matrixQuadrant: destinationId === "unassigned" ? null : (destinationId as TaskRecord["matrixQuadrant"])
          });
        }
        onHoverChange(null);
        setDragTaskId(null);
        setDragTaskTitle(null);
      }}
    >
      <header className="board-column-header">
        <span>{title}</span>
        <span>{tasks.length}</span>
      </header>
      <div className="board-column-body">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`board-task-card${selectedTaskId === task.id ? " is-selected" : ""}${movingTaskId === task.id ? " is-moving" : ""}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/task-id", task.id);
              event.dataTransfer.setData("text/task-title", task.title);
              setDragTaskId(task.id);
              setDragTaskTitle(task.title);
            }}
          >
            <button type="button" className="board-task-select" onClick={() => onSelectTask(task.id)}>
              <strong>{task.title}</strong>
              <span>{task.priority.toUpperCase()} - {task.energyLevel}</span>
              {movingTaskId === task.id ? <span className="board-task-status">Moving...</span> : null}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaskRow({
  task,
  selected,
  onSelect,
  trailingActions
}: {
  task: TaskRecord;
  selected: boolean;
  onSelect: () => void;
  trailingActions?: ReactNode;
}) {
  return (
    <div className={`task-list-row${selected ? " is-selected" : ""}`}>
      <button type="button" className="task-row-select" onClick={onSelect} aria-pressed={selected}>
        <span className={`task-list-check is-${task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : task.priority === "low" ? "blue" : "neutral"}`} aria-hidden="true" />
        <div className="task-list-copy">
          <div className="task-list-title-row">
            <p>{task.title}</p>
            {task.dueDate ? <span className="task-list-time">{formatTaskDate(task.title, task.dueDate)}</span> : null}
          </div>
          <div className="task-list-meta-row">
            <span>{formatListId(task.listId)}</span>
            {task.parentTaskId ? <span>{task.parentTaskId}</span> : null}
            <span>{formatEstimate(task)}</span>
            {task.priority !== "none" ? <span className={`task-list-priority is-${task.priority === "high" ? "high" : "medium"}`}>#{task.priority.toUpperCase()}</span> : null}
            {task.tagSlugs[0] ? <span className="task-list-tag is-teal">#{task.tagSlugs[0]}</span> : null}
          </div>
        </div>
      </button>
      {trailingActions ? <div className="task-row-actions">{trailingActions}</div> : null}
    </div>
  );
}

function mapSectionToKanban(sectionId: string): TaskRecord["kanbanColumn"] {
  if (sectionId === "launch") {
    return "IN_PROGRESS";
  }
  if (sectionId === "backlog") {
    return "BACKLOG";
  }
  if (sectionId === "done") {
    return "DONE";
  }
  return "TODO";
}

function resolveSurfaceHeading(activeView: ShellView, activePresentation: ShellPresentation) {
  if (activeView === "focusQueue") {
    return "Focus Queue";
  }

  if (activePresentation === "calendar") {
    return "Calendar context";
  }

  return activeView === "today"
    ? "Today"
    : activeView === "next7days"
      ? "Next 7 Days"
      : activeView === "inbox"
        ? "Inbox"
        : "Tasks";
}

function resolveLoadingCopy(activeView: ShellView, activePresentation: ShellPresentation) {
  if (activeView === "focusQueue") {
    return "Loading the recommendation-first queue and supporting tasks.";
  }

  if (activePresentation === "kanban") {
    return "Loading the board lanes and task cards.";
  }

  if (activePresentation === "matrix") {
    return "Loading the quadrant map and prioritization cues.";
  }

  if (activePresentation === "calendar") {
    return "Loading calendar context and the next scheduling windows.";
  }

  return "Loading the current task surface.";
}

function resolveEmptyCopy(activeView: ShellView) {
  switch (activeView) {
    case "today":
      return "No tasks are due today. Add one or switch to another list.";
    case "next7days":
      return "Nothing is scheduled for the next seven days.";
    case "inbox":
      return "Nothing is waiting in the inbox right now.";
    case "focusQueue":
      return "No active tasks are eligible for focus right now.";
    default:
      return "The current view is empty. Adjust the list, tag, or filter scope.";
  }
}

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}-${endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function formatTaskDate(taskTitle: string, dueDate: string) {
  const explicitTimes: Record<string, string> = {
    "Ship nudge engine v1 (Level 0-2)": "6:00 PM",
    "Review Jiholabo onboarding copy": "3:30 PM",
    "Rewrite scoring weights doc": "8:00 PM"
  };
  if (explicitTimes[taskTitle]) {
    return explicitTimes[taskTitle];
  }

  const date = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }

  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatListId(listId: string) {
  switch (listId) {
    case "jiholabo-v2":
      return "Jiholabo V2";
    case "project-zero":
      return "Project Zero";
    default:
      return listId.charAt(0).toUpperCase() + listId.slice(1);
  }
}

function formatEstimate(task: TaskRecord) {
  const estimatesByTitle: Record<string, string> = {
    "Ship nudge engine v1 (Level 0-2)": "2h 15m",
    "Pull Q1 metrics data": "40m",
    "Review Jiholabo onboarding copy": "25m",
    "Call mom back": "15m",
    "Water the plants": "5m"
  };

  return estimatesByTitle[task.title] ?? (task.energyLevel === "HIGH" ? "45m" : task.energyLevel === "MEDIUM" ? "25m" : "15m");
}
