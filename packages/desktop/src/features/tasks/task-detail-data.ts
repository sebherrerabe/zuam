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
      "Cover ambient -> gentle -> firm escalation. Keep copy warm, never guilt-tripping.\n\nLevel 2 uses full-screen overlay. Copy bank: shared/nudge-texts/ -- 15+ variants per resistance tier.",
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
    nudge: "FIRM · every 15 min",
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
    nudge: "GENTLE · once a day",
    repeats: "Does not repeat",
    dueLabel: "Due Thu, 9:00 AM"
  },
  "task-3": {
    id: "task-3",
    userId: "user-1",
    listId: "platform",
    sectionId: "review",
    parentTaskId: null,
    title: "Pull Q1 metrics data",
    notes:
      "Collect the top revenue, retention, and activation numbers for the investor update.\n\nPull the final deltas before formatting slides.",
    dueDate: "2026-04-07",
    completed: false,
    completedAt: null,
    sortOrder: 2,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "high",
    subtasks: [
      { id: "sub-10", title: "Export retention graph", completed: true, estimate: "10m" },
      { id: "sub-11", title: "Check Q1 activation source", completed: false, estimate: "20m" }
    ],
    tags: ["#work"],
    energy: "HIGH",
    resistance: "MILD",
    estimate: "40 min",
    urgency: "7 / 10",
    nudge: "FIRM · every 30 min",
    repeats: "Does not repeat",
    dueLabel: "Due Today, 8:00 PM"
  },
  "task-4": {
    id: "task-4",
    userId: "user-1",
    listId: "family",
    sectionId: null,
    parentTaskId: null,
    title: "Call mom back",
    notes:
      "Return the call and confirm next weekend timing.\n\nKeep it short if energy is low.",
    dueDate: "2026-04-07",
    completed: false,
    completedAt: null,
    sortOrder: 3,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "low",
    subtasks: [],
    tags: [],
    energy: "LOW",
    resistance: "MILD",
    estimate: "15 min",
    urgency: "3 / 10",
    nudge: "GENTLE · once a day",
    repeats: "Does not repeat",
    dueLabel: "Due Today, 4:30 PM"
  },
  "task-5": {
    id: "task-5",
    userId: "user-1",
    listId: "platform",
    sectionId: "planning",
    parentTaskId: null,
    title: "Rewrite scoring weights doc",
    notes:
      "Refactor the urgency weighting explanation so implementation can follow it without product follow-up.\n\nCapture the rationale for each threshold.",
    dueDate: "2026-04-07",
    completed: false,
    completedAt: null,
    sortOrder: 4,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "medium",
    subtasks: [
      { id: "sub-12", title: "Audit current score bands", completed: false, estimate: "15m" }
    ],
    tags: ["#work"],
    energy: "MEDIUM",
    resistance: "MILD",
    estimate: "40 min",
    urgency: "5 / 10",
    nudge: "GENTLE · once a day",
    repeats: "Does not repeat",
    dueLabel: "Due Today, 8:00 PM"
  },
  "task-6": {
    id: "task-6",
    userId: "user-1",
    listId: "personal",
    sectionId: null,
    parentTaskId: null,
    title: "Water the plants",
    notes:
      "Hit the balcony plants first, then the desk plants.\n\nThe quick win matters more than doing it perfectly.",
    dueDate: "2026-04-07",
    completed: false,
    completedAt: null,
    sortOrder: 5,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "none",
    subtasks: [],
    tags: [],
    energy: "LOW",
    resistance: "NONE",
    estimate: "5 min",
    urgency: "2 / 10",
    nudge: "GENTLE · once a day",
    repeats: "Weekly",
    dueLabel: "Due Today"
  },
  "task-7": {
    id: "task-7",
    userId: "user-1",
    listId: "personal",
    sectionId: "backlog",
    parentTaskId: null,
    title: "File Q1 taxes",
    notes:
      "Collect invoices, reconcile expenses, and send the package before it slips another week.\n\nDo the paperwork before touching secondary admin.",
    dueDate: "2026-04-05",
    completed: false,
    completedAt: null,
    sortOrder: 6,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "high",
    subtasks: [
      { id: "sub-13", title: "Collect bank statements", completed: false, estimate: "15m" },
      { id: "sub-14", title: "Export expense sheet", completed: false, estimate: "30m" }
    ],
    tags: ["#urgent"],
    energy: "MEDIUM",
    resistance: "DREAD",
    estimate: "45 min",
    urgency: "9 / 10",
    nudge: "AGGRESSIVE · every 15 min",
    repeats: "Does not repeat",
    dueLabel: "Overdue by 2 days"
  },
  "task-8": {
    id: "task-8",
    userId: "user-1",
    listId: "glimpact",
    sectionId: "review",
    parentTaskId: null,
    title: "Send invoice to Glimpact",
    notes:
      "Send the final invoice and confirm the payment reference.\n\nKeep the email short and direct.",
    dueDate: "2026-04-06",
    completed: false,
    completedAt: null,
    sortOrder: 7,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    priority: "medium",
    subtasks: [
      { id: "sub-15", title: "Attach invoice PDF", completed: false, estimate: "5m" },
      { id: "sub-16", title: "Confirm payment reference", completed: false, estimate: "5m" }
    ],
    tags: [],
    energy: "LOW",
    resistance: "HIGH",
    estimate: "10 min",
    urgency: "8 / 10",
    nudge: "FIRM · every 30 min",
    repeats: "Does not repeat",
    dueLabel: "Overdue by 1 day"
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
