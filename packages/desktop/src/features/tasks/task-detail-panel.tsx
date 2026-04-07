import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useShellStore } from "../../lib/state/shell-store";
import {
  commitTaskDetailDraft,
  readTaskDetail,
  readTaskDetailDraft,
  readTaskDetailSaveState,
  writeTaskDetailDraft,
  writeTaskDetailSaveState
} from "./task-detail-cache";
import type { TaskDetailModel, TaskDetailSaveState, TaskPriority } from "./task-detail-data";

type TaskDetailPanelProps = {
  taskId?: string | null;
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

let nextSubtaskId = 10_000;

function createSubtaskId() {
  nextSubtaskId += 1;
  return `sub-${nextSubtaskId}`;
}

export function TaskDetailPanel({ taskId }: TaskDetailPanelProps) {
  const selectedTaskId = useShellStore((state) => state.selectedTaskId);
  const resolvedTaskId = taskId ?? selectedTaskId;
  const activeTaskId = resolvedTaskId ?? "task-1";

  const taskQuery = useQuery({
    queryKey: ["task-detail", activeTaskId],
    queryFn: async () => {
      if (!resolvedTaskId) {
        return null;
      }

      return readTaskDetail(resolvedTaskId);
    },
    initialData: readTaskDetail(activeTaskId),
    enabled: Boolean(resolvedTaskId),
    staleTime: Number.POSITIVE_INFINITY
  });

  if (!resolvedTaskId || !taskQuery.data) {
    return null;
  }

  return <TaskDetailPanelContent key={resolvedTaskId} taskId={resolvedTaskId} initialTask={taskQuery.data} />;
}

function TaskDetailPanelContent({
  taskId,
  initialTask
}: {
  taskId: string;
  initialTask: TaskDetailModel;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<TaskDetailModel>(() => readTaskDetailDraft(taskId));
  const [saveState, setSaveState] = useState<TaskDetailSaveState>(() => readTaskDetailSaveState(taskId));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const autosaveTimerRef = useRef<number | null>(null);
  const commitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }

      if (commitTimerRef.current) {
        window.clearTimeout(commitTimerRef.current);
      }
    };
  }, []);

  const completedCount = useMemo(() => draft?.subtasks.filter((subtask) => subtask.completed).length ?? 0, [draft]);
  const totalCount = draft?.subtasks.length ?? 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentDraft = draft ?? initialTask;

  function updateDraft(nextDraft: TaskDetailModel) {
    setDraft(nextDraft);
    writeTaskDetailDraft(taskId, nextDraft);
    setSaveState("dirty");
    writeTaskDetailSaveState(taskId, "dirty");

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    if (commitTimerRef.current) {
      window.clearTimeout(commitTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      setSaveState("saving");
      writeTaskDetailSaveState(taskId, "saving");

      commitTimerRef.current = window.setTimeout(() => {
        if (!nextDraft.title.trim()) {
          setTitleError("Title is required.");
          setSaveState("error");
          writeTaskDetailSaveState(taskId, "error");
          return;
        }

        const committed = commitTaskDetailDraft(taskId, nextDraft);
        queryClient.setQueryData(["task-detail", taskId], committed);
        setTitleError(null);
        setSaveState("saved");
        writeTaskDetailSaveState(taskId, "saved");
      }, 120);
    }, 140);
  }

  function updateField<K extends keyof TaskDetailModel>(field: K, value: TaskDetailModel[K]) {
    updateDraft({
      ...currentDraft,
      [field]: value
    });
  }

  function handleSubtaskToggle(subtaskId: string) {
    updateDraft({
      ...currentDraft,
      subtasks: currentDraft.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      )
    });
  }

  function handleSubtaskDelete(subtaskId: string) {
    updateDraft({
      ...currentDraft,
      subtasks: currentDraft.subtasks.filter((subtask) => subtask.id !== subtaskId)
    });
  }

  function handleSubtaskAdd() {
    const nextTitle = newSubtaskTitle.trim();
    if (!nextTitle) {
      return;
    }

    updateDraft({
      ...currentDraft,
      subtasks: [
        ...currentDraft.subtasks,
        {
          id: createSubtaskId(),
          title: nextTitle,
          completed: false,
          estimate: "15m"
        }
      ]
    });
    setNewSubtaskTitle("");
    setComposerOpen(false);
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
            Flag
          </button>
          <button type="button" className="icon-button" aria-label="More task actions">
            More
          </button>
          <button type="button" className="icon-button" aria-label="Close task detail">
            Close
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
              updateField("title", event.target.value);
              if (titleError) {
                setTitleError(null);
              }
            }}
          />
        </label>
      </div>

      <section className="task-detail-progress">
        <div className="task-detail-progress-header">
          <p>Subtasks progress</p>
          <p>{`${completedCount} / ${totalCount} | ${progressPercent}%`}</p>
        </div>
        <div className="task-detail-progress-track" aria-hidden="true">
          <div className="task-detail-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <section className="task-detail-body">
        <div className="task-detail-body-copy">
          <h2>Implementation plan</h2>
          <p>Cover ambient -&gt; gentle -&gt; firm escalation. Keep copy warm, never guilt-tripping.</p>
        </div>

        <label className="task-detail-notes-field">
          <span>Notes / body</span>
          <textarea
            aria-label="Notes"
            value={currentDraft.notes ?? ""}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={7}
          />
        </label>

        {titleError ? (
          <p className="task-detail-error" role="alert">
            {titleError}
          </p>
        ) : null}

        <div className="task-detail-callout">
          <p aria-hidden="true">Tip</p>
          <p>Plain text only. Line breaks are preserved, and the Google sync fallback stays lossless at this stage.</p>
        </div>
      </section>

      <section className="task-detail-subtasks" aria-label="Subtasks">
        <div className="task-detail-section-header">
          <p>Subtasks</p>
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
                  onChange={() => handleSubtaskToggle(subtask.id)}
                />
                <span className={subtask.completed ? "is-complete" : undefined}>{subtask.title}</span>
              </label>
              <span className="task-detail-subtask-estimate">{subtask.estimate}</span>
              <button
                type="button"
                className="text-link danger"
                aria-label={`Delete ${subtask.title}`}
                onClick={() => handleSubtaskDelete(subtask.id)}
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
            <button type="button" className="primary-button" onClick={handleSubtaskAdd}>
              Add subtask
            </button>
          </div>
        ) : null}
      </section>

      <section className="task-detail-details">
        <div className="task-detail-details-head">
          <p>Details</p>
        </div>
        <div className="task-detail-details-grid">
          <label>
            <span>List</span>
            <select aria-label="List" value={currentDraft.listId} onChange={(event) => updateField("listId", event.target.value)}>
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
              onChange={(event) => updateField("sectionId", event.target.value)}
            >
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
              onChange={(event) => updateField("dueDate", event.target.value)}
            />
          </label>
          <label>
            <span>Priority</span>
            <select
              aria-label="Priority"
              value={currentDraft.priority}
              onChange={(event) => updateField("priority", event.target.value as TaskPriority)}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="task-detail-list-grid">
          <DetailRow label="Tags" value={currentDraft.tags.join("  ")} />
          <DetailRow label="Energy" value={currentDraft.energy} accent="warning" />
          <DetailRow label="Resistance" value={currentDraft.resistance} accent="warning" />
          <DetailRow label="Estimate" value={currentDraft.estimate} />
          <DetailRow label="Urgency" value={currentDraft.urgency} accent="danger" />
          <DetailRow label="Nudge" value={currentDraft.nudge} />
          <DetailRow label="Repeats" value={currentDraft.repeats} muted />
        </div>
      </section>

      <footer className="task-detail-footer">
        <button type="button" className="task-detail-cta" disabled>
          Start 25-min Focus Session
        </button>
      </footer>
    </section>
  );
}

function DetailRow({
  label,
  value,
  accent,
  muted
}: {
  label: string;
  value: string;
  accent?: "warning" | "danger";
  muted?: boolean;
}) {
  return (
    <div className="task-detail-row">
      <span className="task-detail-row-label">{label}</span>
      <span className={`task-detail-row-value${accent ? ` is-${accent}` : ""}${muted ? " is-muted" : ""}`}>{value}</span>
    </div>
  );
}
