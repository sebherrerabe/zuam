import type { TaskRecord } from "@zuam/shared";

import type { TaskDetailResponse } from "../../lib/api/desktop-api.types";

export type TaskPriority = "none" | "low" | "medium" | "high";

export type TaskDetailSaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export type TaskDetailSubtask = {
  id: string;
  title: string;
  completed: boolean;
  estimate: string;
};

export type TaskDetailModel = {
  id: string;
  userId: string;
  listId: string;
  sectionId: string | null;
  parentTaskId: string | null;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  priority: TaskPriority;
  subtasks: TaskDetailSubtask[];
  tags: string[];
  energy: "LOW" | "MEDIUM" | "HIGH";
  resistance: "NONE" | "MILD" | "HIGH" | "DREAD";
  estimate: string;
  urgency: string;
  nudge: string;
  repeats: string;
  dueLabel: string;
};

const taskPresentationById: Record<
  string,
  Pick<TaskDetailModel, "estimate" | "urgency" | "nudge" | "repeats" | "energy" | "resistance">
> = {
  "task-1": { estimate: "2h 15m", urgency: "8 / 10", nudge: "FIRM · every 15 min", repeats: "Does not repeat", energy: "HIGH", resistance: "HIGH" },
  "task-2": { estimate: "45m", urgency: "5 / 10", nudge: "GENTLE · once a day", repeats: "Does not repeat", energy: "MEDIUM", resistance: "MILD" },
  "task-3": { estimate: "40 min", urgency: "7 / 10", nudge: "FIRM · every 30 min", repeats: "Does not repeat", energy: "HIGH", resistance: "MILD" },
  "task-4": { estimate: "15 min", urgency: "3 / 10", nudge: "GENTLE · once a day", repeats: "Does not repeat", energy: "LOW", resistance: "MILD" },
  "task-5": { estimate: "40 min", urgency: "5 / 10", nudge: "GENTLE · once a day", repeats: "Does not repeat", energy: "MEDIUM", resistance: "MILD" },
  "task-6": { estimate: "5 min", urgency: "2 / 10", nudge: "GENTLE · once a day", repeats: "Weekly", energy: "LOW", resistance: "NONE" },
  "task-7": { estimate: "45 min", urgency: "9 / 10", nudge: "AGGRESSIVE · every 15 min", repeats: "Does not repeat", energy: "MEDIUM", resistance: "DREAD" },
  "task-8": { estimate: "10 min", urgency: "8 / 10", nudge: "FIRM · every 30 min", repeats: "Does not repeat", energy: "LOW", resistance: "HIGH" }
};

const subtaskEstimatesByTitle: Record<string, string> = {
  "Define escalation ladder 0-4": "15m",
  "Copy bank schema + seed": "30m",
  "Scheduler hook to task.dueDate": "20m",
  "Electron overlay window (Level 2)": "45m",
  "WebSocket push to desktop client": "30m",
  "Snooze + reschedule actions": "25m",
  "Unit tests for escalation state": "40m",
  "Check hard-stop language": "20m",
  "Review empty-state copy": "25m",
  "Export retention graph": "10m",
  "Check Q1 activation source": "20m",
  "Audit current score bands": "15m",
  "Collect bank statements": "15m",
  "Export expense sheet": "30m",
  "Attach invoice PDF": "5m",
  "Confirm payment reference": "5m"
};

export function toTaskDetailModel(detail: TaskDetailResponse, taskSummary?: TaskRecord | null): TaskDetailModel {
  const presentation = taskPresentationById[detail.id] ?? {
    estimate: "25m",
    urgency: "5 / 10",
    nudge: "GENTLE · once a day",
    repeats: "Does not repeat",
    energy: taskSummary?.energyLevel ?? "MEDIUM",
    resistance: taskSummary?.resistance ?? "MILD"
  };

  return {
    ...detail,
    dueDate: normalizeDateField(detail.dueDate),
    subtasks: detail.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      estimate: subtaskEstimatesByTitle[subtask.title] ?? "15m"
    })),
    tags: (taskSummary?.tagSlugs ?? []).map((tag) => `#${tag}`),
    energy: taskSummary?.energyLevel ?? presentation.energy,
    resistance: taskSummary?.resistance ?? presentation.resistance,
    estimate: presentation.estimate,
    urgency: presentation.urgency,
    nudge: presentation.nudge,
    repeats: presentation.repeats,
    dueLabel: formatDueLabel(detail.dueDate)
  };
}

export function cloneTaskDetailModel(task: TaskDetailModel): TaskDetailModel {
  return {
    ...task,
    subtasks: task.subtasks.map((subtask) => ({ ...subtask })),
    tags: [...task.tags]
  };
}

export function buildTaskDetailPatch(
  nextDraft: TaskDetailModel,
  previousDraft: TaskDetailModel
): {
  title?: string;
  notes?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  listId?: string;
  sectionId?: string | null;
} {
  const patch: {
    title?: string;
    notes?: string | null;
    dueDate?: string | null;
    priority?: TaskPriority;
    listId?: string;
    sectionId?: string | null;
  } = {};

  if (nextDraft.title !== previousDraft.title) {
    patch.title = nextDraft.title;
  }
  if (nextDraft.notes !== previousDraft.notes) {
    patch.notes = nextDraft.notes;
  }
  if (nextDraft.dueDate !== previousDraft.dueDate) {
    patch.dueDate = toIsoDateTime(nextDraft.dueDate);
  }
  if (nextDraft.priority !== previousDraft.priority) {
    patch.priority = nextDraft.priority;
  }
  if (nextDraft.listId !== previousDraft.listId) {
    patch.listId = nextDraft.listId;
  }
  if (nextDraft.sectionId !== previousDraft.sectionId) {
    patch.sectionId = nextDraft.sectionId;
  }

  return patch;
}

export function toIsoDateTime(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  return `${dateValue}T12:00:00.000Z`;
}

function normalizeDateField(dateValue: string | null) {
  return dateValue ? dateValue.slice(0, 10) : null;
}

export function formatDueLabel(dateValue: string | null) {
  if (!dateValue) {
    return "No due date";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return `Due ${date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}`;
}
