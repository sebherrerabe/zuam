import { useState, type ReactNode } from "react";

import type { TaskRecord } from "@zuam/shared";

import type {
  FocusQueueRecommendation,
  GoogleCalendarContextSnapshot,
  ScheduleSuggestion,
  TaskViewQueryResult
} from "../../lib/api/desktop-api.types";
import type { ShellPresentation, ShellView } from "../../lib/state/shell-store";

type TaskViewsProps = {
  activeView: ShellView;
  activePresentation: ShellPresentation;
  selectedTaskId: string | null;
  taskQuery: TaskViewQueryResult | undefined;
  focusRecommendation: FocusQueueRecommendation | undefined;
  calendarContext: GoogleCalendarContextSnapshot | undefined;
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
      <section className="desktop-placeholder-panel" aria-label="loading task view">
        <h2>Loading</h2>
        <p>Loading the current task surface.</p>
      </section>
    );
  }

  if (taskQuery.totalCount === 0) {
    return (
      <section className="desktop-placeholder-panel" aria-label="empty task view">
        <h2>No matching tasks</h2>
        <p>The current view is empty. Adjust the list, tag, or filter scope.</p>
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
      return <KanbanView groups={taskQuery.groups} selectedTaskId={selectedTaskId} onSelectTask={onSelectTask} onMoveTask={onMoveTask} />;
    case "matrix":
      return <MatrixView groups={taskQuery.groups} selectedTaskId={selectedTaskId} onSelectTask={onSelectTask} onMoveTask={onMoveTask} />;
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
  return (
    <div className="board-grid" role="region" aria-label="kanban view">
      {groups.map((group) => (
        <DropColumn
          key={group.key}
          title={group.label}
          tasks={group.items}
          destination="kanban"
          destinationId={group.key}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
          onMoveTask={onMoveTask}
        />
      ))}
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
  return (
    <div className="matrix-grid" role="region" aria-label="matrix view">
      {groups.map((group) => (
        <DropColumn
          key={group.key}
          title={group.label}
          tasks={group.items}
          destination="matrix"
          destinationId={group.key}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
          onMoveTask={onMoveTask}
        />
      ))}
    </div>
  );
}

function CalendarView({
  context,
  suggestions,
  onSelectTask
}: {
  context: GoogleCalendarContextSnapshot | undefined;
  suggestions: ScheduleSuggestion[];
  onSelectTask: (taskId: string) => void;
}) {
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
  selectedTaskId,
  onSelectTask,
  onMoveTask
}: {
  title: string;
  tasks: TaskRecord[];
  destination: "kanban" | "matrix";
  destinationId: string;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onMoveTask: TaskViewsProps["onMoveTask"];
}) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  return (
    <section
      className="board-column"
      role="region"
      aria-label={title}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text/task-id") || dragTaskId;
        if (!taskId) {
          return;
        }

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
        setDragTaskId(null);
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
            className={`board-task-card${selectedTaskId === task.id ? " is-selected" : ""}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/task-id", task.id);
              setDragTaskId(task.id);
            }}
          >
            <button type="button" className="board-task-select" onClick={() => onSelectTask(task.id)}>
              <strong>{task.title}</strong>
              <span>{task.priority.toUpperCase()} - {task.energyLevel}</span>
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
            {task.dueDate ? <span className="task-list-time">{task.dueDate}</span> : null}
          </div>
          <div className="task-list-meta-row">
            <span>{task.listId}</span>
            <span>{task.priority.toUpperCase()}</span>
            <span>{task.energyLevel}</span>
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

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}-${endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}
