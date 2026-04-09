import { useEffect, useMemo, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaskRecord } from "@zuam/shared";

import {
  createSubtask,
  deleteTask,
  fetchTaskDetail,
  setSubtaskCompleted,
  updateTaskDetail
} from "../../lib/api/desktop-api";
import { useShellStore } from "../../lib/state/shell-store";
import {
  buildTaskDetailPatch,
  cloneTaskDetailModel,
  formatDueLabel,
  toTaskDetailModel,
  type TaskDetailModel,
  type TaskDetailSaveState,
  type TaskPriority
} from "./task-detail-data";
import {
  readTaskDetailDraft,
  readTaskDetailSaveState,
  writeTaskDetailDraft,
  writeTaskDetailSaveState
} from "./task-detail-cache";

type TaskDetailPanelProps = {
  taskId?: string | null;
  taskSummary?: TaskRecord | null;
  focusCallToAction?: {
    label: string;
    helper: string;
    onClick: () => void;
  };
  calendarHint?: {
    title: string;
    body: string;
  } | null;
};

const saveStateLabels: Record<TaskDetailSaveState, string> = {
  idle: "Idle",
  dirty: "Dirty",
  saving: "Saving",
  saved: "Saved",
  error: "Error"
};

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

export function TaskDetailPanel({ taskId, taskSummary, focusCallToAction, calendarHint }: TaskDetailPanelProps) {
  const selectedTaskId = useShellStore((state) => state.selectedTaskId);
  const resolvedTaskId = taskId ?? selectedTaskId;

  const taskQuery = useQuery({
    queryKey: ["task-detail", resolvedTaskId],
    queryFn: () => fetchTaskDetail(resolvedTaskId ?? ""),
    enabled: Boolean(resolvedTaskId),
    staleTime: Number.POSITIVE_INFINITY
  });

  if (!resolvedTaskId || !taskQuery.data) {
    return null;
  }

  return (
    <TaskDetailPanelContent
      key={resolvedTaskId}
      taskId={resolvedTaskId}
      initialTask={toTaskDetailModel(taskQuery.data, taskSummary)}
      taskSummary={taskSummary}
      focusCallToAction={focusCallToAction}
      calendarHint={calendarHint}
    />
  );
}

function TaskDetailPanelContent({
  taskId,
  initialTask,
  taskSummary,
  focusCallToAction,
  calendarHint
}: {
  taskId: string;
  initialTask: TaskDetailModel;
  taskSummary?: TaskRecord | null;
  focusCallToAction?: TaskDetailPanelProps["focusCallToAction"];
  calendarHint?: TaskDetailPanelProps["calendarHint"];
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<TaskDetailModel>(() => readTaskDetailDraft(taskId) ?? cloneTaskDetailModel(initialTask));
  const [saveState, setSaveState] = useState<TaskDetailSaveState>(() => readTaskDetailSaveState(taskId));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const autosaveTimerRef = useRef<number | null>(null);
  const committedTaskRef = useRef<TaskDetailModel>(cloneTaskDetailModel(initialTask));
  const pendingSubtaskCounterRef = useRef(0);

  useEffect(() => {
    return () => {
      const autosaveTimer = autosaveTimerRef.current;
      if (autosaveTimer) {
        window.clearTimeout(autosaveTimer);
      }
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: (nextDraft: TaskDetailModel) =>
      updateTaskDetail(taskId, buildTaskDetailPatch(nextDraft, committedTaskRef.current)),
    onSuccess: (response) => {
      const nextCommitted = toTaskDetailModel(response, taskSummary);
      commitDraft(nextCommitted, response);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["desktop-task-query"] }),
        queryClient.invalidateQueries({ queryKey: ["desktop-workspace-bootstrap"] }),
        queryClient.invalidateQueries({ queryKey: ["desktop-focus-queue"] }),
        queryClient.invalidateQueries({ queryKey: ["desktop-calendar-suggestions"] })
      ]);
      setTitleError(null);
      setSaveState("saved");
      writeTaskDetailSaveState(taskId, "saved");
    },
    onError: () => {
      revertDraft();
      setSaveState("error");
      writeTaskDetailSaveState(taskId, "error");
    }
  });

  const currentDraft = draft;
  const completedCount = useMemo(
    () => currentDraft.subtasks.filter((subtask) => subtask.completed).length,
    [currentDraft]
  );
  const totalCount = currentDraft.subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const noteSections = useMemo(() => {
    const sections = (currentDraft.notes ?? "")
      .split(/\n\s*\n/)
      .map((section) => section.trim())
      .filter(Boolean);

    return {
      summary: sections[0] ?? "Keep the next edit warm, clear, and concrete.",
      callout: sections[1] ?? "Plain text stays the safe sync fallback for this phase."
    };
  }, [currentDraft.notes]);
  const signalCards = [
    { id: "energy", label: "ENERGY", icon: "\u26A1", value: currentDraft.energy, tone: "energy" },
    { id: "resistance", label: "RESIST.", icon: "\u{1F630}", value: currentDraft.resistance, tone: "neutral" },
    { id: "nudge", label: "NUDGE", icon: "\u{1F514}", value: currentDraft.nudge.split("·")[0]?.trim() ?? currentDraft.nudge, tone: "nudge" },
    { id: "urgency", label: "URGENCY", icon: "\u{1F525}", value: currentDraft.urgency.replace(/\s+/g, ""), tone: "danger" }
  ] as const;

  function commitDraft(nextDraft: TaskDetailModel, queryValue?: unknown) {
    const cloned = cloneTaskDetailModel(nextDraft);
    committedTaskRef.current = cloned;
    setDraft(cloned);
    writeTaskDetailDraft(taskId, cloned);
    if (queryValue !== undefined) {
      queryClient.setQueryData(["task-detail", taskId], queryValue);
    } else {
      void queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    }
  }

  function revertDraft() {
    const fallback = cloneTaskDetailModel(committedTaskRef.current);
    setDraft(fallback);
    writeTaskDetailDraft(taskId, fallback);
  }

  function updateDraft(nextDraft: TaskDetailModel) {
    setDraft(nextDraft);
    writeTaskDetailDraft(taskId, nextDraft);
    setSaveState("dirty");
    writeTaskDetailSaveState(taskId, "dirty");

    const autosaveTimer = autosaveTimerRef.current;
    if (autosaveTimer) {
      window.clearTimeout(autosaveTimer);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      if (!nextDraft.title.trim()) {
        setTitleError("Title is required.");
        setSaveState("error");
        writeTaskDetailSaveState(taskId, "error");
        return;
      }

      const patch = buildTaskDetailPatch(nextDraft, committedTaskRef.current);
      if (Object.keys(patch).length === 0) {
        setSaveState("saved");
        writeTaskDetailSaveState(taskId, "saved");
        return;
      }

      setSaveState("saving");
      writeTaskDetailSaveState(taskId, "saving");
      saveMutation.mutate(nextDraft);
    }, 140);
  }

  async function handleSubtaskToggle(subtaskId: string) {
    const nextDraft = {
      ...currentDraft,
      subtasks: currentDraft.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      )
    };
    setDraft(nextDraft);
    writeTaskDetailDraft(taskId, nextDraft);
    setSaveState("saving");
    writeTaskDetailSaveState(taskId, "saving");

    try {
      const toggled = nextDraft.subtasks.find((subtask) => subtask.id === subtaskId);
      await setSubtaskCompleted(subtaskId, Boolean(toggled?.completed));
      committedTaskRef.current = cloneTaskDetailModel(nextDraft);
      setSaveState("saved");
      writeTaskDetailSaveState(taskId, "saved");
      void queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["desktop-task-query"] });
    } catch {
      revertDraft();
      setSaveState("error");
      writeTaskDetailSaveState(taskId, "error");
    }
  }

  async function handleSubtaskDelete(subtaskId: string) {
    const nextDraft = {
      ...currentDraft,
      subtasks: currentDraft.subtasks.filter((subtask) => subtask.id !== subtaskId)
    };
    setDraft(nextDraft);
    writeTaskDetailDraft(taskId, nextDraft);
    setSaveState("saving");
    writeTaskDetailSaveState(taskId, "saving");

    try {
      await deleteTask(subtaskId);
      committedTaskRef.current = cloneTaskDetailModel(nextDraft);
      setSaveState("saved");
      writeTaskDetailSaveState(taskId, "saved");
      void queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["desktop-task-query"] });
    } catch {
      revertDraft();
      setSaveState("error");
      writeTaskDetailSaveState(taskId, "error");
    }
  }

  async function handleSubtaskAdd() {
    const title = newSubtaskTitle.trim();
    if (!title) {
      return;
    }

    const nextDraft = {
      ...currentDraft,
      subtasks: [
        ...currentDraft.subtasks,
        {
          id: `pending-${pendingSubtaskCounterRef.current++}`,
          title,
          completed: false,
          estimate: "15m"
        }
      ]
    };
    setDraft(nextDraft);
    writeTaskDetailDraft(taskId, nextDraft);
    setComposerOpen(false);
    setNewSubtaskTitle("");
    setSaveState("saving");
    writeTaskDetailSaveState(taskId, "saving");

    try {
      await createSubtask({
        listId: currentDraft.listId,
        sectionId: currentDraft.sectionId,
        parentTaskId: taskId,
        title
      });
      committedTaskRef.current = cloneTaskDetailModel(nextDraft);
      setSaveState("saved");
      writeTaskDetailSaveState(taskId, "saved");
      void queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["desktop-task-query"] });
    } catch {
      revertDraft();
      setSaveState("error");
      writeTaskDetailSaveState(taskId, "error");
    }
  }

  return (
    <section className="task-detail-panel" aria-label="Task detail">
      <header className="task-detail-header">
        <div className="task-detail-meta">
          <p className="task-detail-due">{currentDraft.dueLabel}</p>
          <span className={`task-detail-save-state is-${saveState}`} role="status" aria-live="polite">
            {saveStateLabels[saveState]}
          </span>
        </div>
        <div className="task-detail-header-actions" aria-label="Task detail actions">
          <button type="button" className="icon-button" aria-label="Flag task">
            {"\u2691"}
          </button>
          <button type="button" className="icon-button" aria-label="More task actions">
            {"\u2022\u2022\u2022"}
          </button>
          <button type="button" className="icon-button" aria-label="Close task detail">
            {"\u00D7"}
          </button>
        </div>
      </header>

      <div className="task-detail-title-row">
        <div className={`priority-mark priority-${currentDraft.priority}`} aria-hidden="true" />
        <label className="task-detail-title-field">
          <span className="sr-only">Task title</span>
          <input
            aria-label="Task title"
            value={currentDraft.title}
            onChange={(event) => {
              updateDraft({ ...currentDraft, title: event.target.value });
              if (titleError) {
                setTitleError(null);
              }
            }}
          />
        </label>
      </div>

      <section className="task-detail-signals" aria-label="ADHD signals">
        {signalCards.map((card) => (
          <div key={card.id} className={`task-detail-signal-card is-${card.tone}`}>
            <div className="task-detail-signal-top">
              <span aria-hidden="true">{card.icon}</span>
              <span>{card.label}</span>
            </div>
            <strong>{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="task-detail-progress">
        <div className="task-detail-progress-header">
          <p>Subtasks</p>
          <p>{`${completedCount} / ${totalCount} · ${progressPercent}%`}</p>
        </div>
        <div className="task-detail-progress-track" aria-hidden="true">
          <div className="task-detail-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <section className="task-detail-body">
        <div className="task-detail-body-copy">
          <h2>Implementation plan</h2>
          <p>{noteSections.summary}</p>
        </div>

        <div className="task-detail-callout">
          <p aria-hidden="true">{"\u{1F4A1}"}</p>
          <p>{noteSections.callout}</p>
        </div>

        <label className="task-detail-notes-field">
          <span className="sr-only">Notes / body</span>
          <textarea
            aria-label="Notes"
            value={currentDraft.notes ?? ""}
            onChange={(event) => updateDraft({ ...currentDraft, notes: event.target.value })}
            rows={4}
          />
        </label>

        {titleError ? (
          <p className="task-detail-error" role="alert">
            {titleError}
          </p>
        ) : null}
      </section>

      <section className="task-detail-subtasks" aria-label="Subtasks">
        <div className="task-detail-section-header">
          <p>SUBTASKS</p>
          <button type="button" className="text-link" onClick={() => setComposerOpen((current) => !current)}>
            + Add
          </button>
        </div>

        <div className="task-detail-subtask-list">
          {currentDraft.subtasks.map((subtask) => (
            <div key={subtask.id} className="task-detail-subtask-row">
              <label className="task-detail-subtask-check">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => void handleSubtaskToggle(subtask.id)}
                />
                <span className={subtask.completed ? "is-complete" : undefined}>{subtask.title}</span>
              </label>
              <span className="task-detail-subtask-estimate">{subtask.estimate}</span>
              <button
                type="button"
                className="text-link danger"
                aria-label={`Delete ${subtask.title}`}
                onClick={() => void handleSubtaskDelete(subtask.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {composerOpen ? (
          <div className="task-detail-composer">
            <input
              aria-label="New subtask"
              placeholder="New subtask"
              value={newSubtaskTitle}
              onChange={(event) => setNewSubtaskTitle(event.target.value)}
            />
            <button type="button" className="primary-button" onClick={() => void handleSubtaskAdd()}>
              Add subtask
            </button>
          </div>
        ) : null}
      </section>

      <section className="task-detail-reward-panel" aria-label="task xp summary">
        <div className="task-detail-reward-chip">
          <strong>+35 XP</strong>
          <span>on completion</span>
        </div>
        <p>Why: overdue + high resistance + deep work</p>
      </section>

      {calendarHint ? (
        <section className="task-detail-calendar-hint" aria-label="calendar hints">
          <div className="task-detail-calendar-icon" aria-hidden="true">
            AI
          </div>
          <div>
            <strong>{calendarHint.title}</strong>
            <p>{calendarHint.body}</p>
          </div>
        </section>
      ) : null}

      <footer className="task-detail-footer">
        <button type="button" className="task-detail-cta" onClick={focusCallToAction?.onClick}>
          {focusCallToAction?.label ?? "Start 25-min Focus Session"}
        </button>
        <p className="task-detail-focus-helper">+60 XP + 1 focus shard on session completion</p>
      </footer>

      <section className="task-detail-edit-grid">
        <label>
          <span>List</span>
          <select
            aria-label="List"
            value={currentDraft.listId}
            onChange={(event) => updateDraft({ ...currentDraft, listId: event.target.value })}
          >
            <option value="platform">Platform</option>
            <option value="inbox">Inbox</option>
            <option value="today">Today</option>
            <option value="project-zero">Project Zero</option>
          </select>
        </label>
        <label>
          <span>Section</span>
          <select
            aria-label="Section"
            value={currentDraft.sectionId ?? ""}
            onChange={(event) => updateDraft({ ...currentDraft, sectionId: event.target.value || null })}
          >
            <option value="">Unsectioned</option>
            <option value="launch">Launch</option>
            <option value="review">Review</option>
            <option value="planning">Planning</option>
            <option value="backlog">Backlog</option>
          </select>
        </label>
        <label>
          <span>Due date</span>
          <input
            aria-label="Due date"
            type="date"
            value={currentDraft.dueDate ?? ""}
            onChange={(event) =>
              updateDraft({
                ...currentDraft,
                dueDate: event.target.value || null,
                dueLabel: formatDueLabel(event.target.value || null)
              })}
          />
        </label>
        <label>
          <span>Priority</span>
          <select
            aria-label="Priority"
            value={currentDraft.priority}
            onChange={(event) => updateDraft({ ...currentDraft, priority: event.target.value as TaskPriority })}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>
    </section>
  );
}
