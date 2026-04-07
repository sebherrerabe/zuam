import type { TaskDto } from "@zuam/shared";

export type TaskPriority = "none" | "low" | "medium" | "high";

export type TaskDetailSaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export type TaskDetailSubtask = {
  id: string;
  title: string;
  completed: boolean;
  estimate: string;
};

export type TaskDetailModel = TaskDto & {
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

export const taskDetailFixtures: Record<string, TaskDetailModel> = {
  "task-1": {
    id: "task-1",
    userId: "user-1",
    listId: "platform",
    sectionId: "launch",
    parentTaskId: null,
    title: "Ship nudge engine v1 (Level 0-2)",
    notes:
      "Cover ambient -> gentle -> firm escalation.\nKeep copy warm, never guilt-tripping.\n\nLevel 2 uses full-screen overlay. Copy bank: shared/nudge-texts/ -- 15+ variants per resistance tier.",
    dueDate: "2026-04-07",
    completed: false,
    completedAt: null,
    sortOrder: 0,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "high",
    subtasks: [
      { id: "sub-1", title: "Define escalation ladder 0-4", completed: true, estimate: "15m" },
      { id: "sub-2", title: "Copy bank schema + seed", completed: true, estimate: "30m" },
      { id: "sub-3", title: "Scheduler hook to task.dueDate", completed: true, estimate: "20m" },
      { id: "sub-4", title: "Electron overlay window (Level 2)", completed: false, estimate: "45m" },
      { id: "sub-5", title: "WebSocket push to desktop client", completed: false, estimate: "30m" },
      { id: "sub-6", title: "Snooze + reschedule actions", completed: false, estimate: "25m" },
      { id: "sub-7", title: "Unit tests for escalation state", completed: false, estimate: "40m" }
    ],
    tags: ["#deep-work", "#work"],
    energy: "HIGH",
    resistance: "HIGH",
    estimate: "2h 15m",
    urgency: "8 / 10",
    nudge: "FIRM | every 15 min",
    repeats: "Does not repeat",
    dueLabel: "Due Today, 6:00 PM"
  },
  "task-2": {
    id: "task-2",
    userId: "user-1",
    listId: "platform",
    sectionId: "review",
    parentTaskId: null,
    title: "Review onboarding invite copy",
    notes:
      "Keep the gate direct and non-punitive.\nLead with clarity, then offer the next action.\n\nCopy should feel calm even when it says no.",
    dueDate: "2026-04-09",
    completed: false,
    completedAt: null,
    sortOrder: 1,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "medium",
    subtasks: [
      { id: "sub-8", title: "Check hard-stop language", completed: false, estimate: "20m" },
      { id: "sub-9", title: "Review empty-state copy", completed: false, estimate: "25m" }
    ],
    tags: ["#copy", "#onboarding"],
    energy: "MEDIUM",
    resistance: "MILD",
    estimate: "45m",
    urgency: "5 / 10",
    nudge: "GENTLE | once a day",
    repeats: "Does not repeat",
    dueLabel: "Due Thu, 9:00 AM"
  }
};

export function cloneTaskDetailModel(task: TaskDetailModel): TaskDetailModel {
  return {
    ...task,
    subtasks: task.subtasks.map((subtask) => ({ ...subtask })),
    tags: [...task.tags]
  };
}

export function getTaskDetailModel(taskId: string): TaskDetailModel {
  const fallbackTask = taskDetailFixtures["task-1"]!;
  const task = taskDetailFixtures[taskId] ?? fallbackTask;
  return cloneTaskDetailModel(task);
}
