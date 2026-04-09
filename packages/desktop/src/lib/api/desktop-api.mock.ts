import type { ListDto, SmartListId, TaskGroupBy, TaskRecord, TaskSortBy } from "@zuam/shared";

import type {
  CalendarSuggestionsResponse,
  CreateSubtaskInput,
  DesktopWorkspaceBootstrap,
  FocusQueueRecommendation,
  FocusSession,
  FocusSessionSnapshot,
  GoogleCalendarContextSnapshot,
  SavedFilterRecord,
  ScheduleSuggestion,
  SidebarCountRow,
  StartFocusSessionInput,
  TagRecord,
  TaskDetailResponse,
  TaskDetailSubtaskResponse,
  TaskMoveInput,
  TaskStatusInput,
  TaskTaxonomyQueryInput,
  TaskViewGroup,
  TaskViewQueryResult,
  TransitionFocusSessionInput,
  UpdateTaskDetailInput
} from "./desktop-api.types";

const FALLBACK_USER_ID = "user-1";
const FALLBACK_NOW = "2026-04-07T14:00:00.000Z";

type FallbackStore = {
  lists: ListDto[];
  tasks: TaskRecord[];
  tags: TagRecord[];
  savedFilters: SavedFilterRecord[];
  focusSessions: FocusSession[];
  taskRollups: FocusSessionSnapshot["taskRollups"];
  calendarContext: GoogleCalendarContextSnapshot;
};

const seedTasks: Array<
  TaskRecord & {
    dueLabel?: string;
    subtasks?: Array<{ id: string; title: string; completed: boolean; estimate: string }>;
  }
> = [
  {
    id: "task-1",
    userId: FALLBACK_USER_ID,
    listId: "platform",
    sectionId: "launch",
    parentTaskId: null,
    title: "Ship nudge engine v1 (Level 0-2)",
    notes: "Cover ambient -> gentle -> firm escalation. Keep copy warm, never guilt-tripping.\n\nLevel 2 uses full-screen overlay. Copy bank: shared/nudge-texts/ -- 15+ variants per resistance tier.",
    dueDate: "2026-04-07T18:00:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 0,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "high",
    energyLevel: "HIGH",
    resistance: "HIGH",
    kanbanColumn: "IN_PROGRESS",
    matrixQuadrant: "Q1_URGENT_IMPORTANT",
    tagSlugs: ["deep-work", "work"],
    subtasks: [
      { id: "sub-1", title: "Define escalation ladder 0-4", completed: true, estimate: "15m" },
      { id: "sub-2", title: "Copy bank schema + seed", completed: true, estimate: "30m" },
      { id: "sub-3", title: "Scheduler hook to task.dueDate", completed: true, estimate: "20m" },
      { id: "sub-4", title: "Electron overlay window (Level 2)", completed: false, estimate: "45m" },
      { id: "sub-5", title: "WebSocket push to desktop client", completed: false, estimate: "30m" },
      { id: "sub-6", title: "Snooze + reschedule actions", completed: false, estimate: "25m" },
      { id: "sub-7", title: "Unit tests for escalation state", completed: false, estimate: "40m" }
    ]
  },
  {
    id: "task-2",
    userId: FALLBACK_USER_ID,
    listId: "platform",
    sectionId: "review",
    parentTaskId: null,
    title: "Review onboarding invite copy",
    notes: "Keep the gate direct and non-punitive.\nLead with clarity, then offer the next action.\n\nCopy should feel calm even when it says no.",
    dueDate: "2026-04-09T15:30:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 1,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "medium",
    energyLevel: "MEDIUM",
    resistance: "MILD",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q3_URGENT",
    tagSlugs: ["copy", "onboarding"],
    subtasks: [
      { id: "sub-8", title: "Check hard-stop language", completed: false, estimate: "20m" },
      { id: "sub-9", title: "Review empty-state copy", completed: false, estimate: "25m" }
    ]
  },
  {
    id: "task-3",
    userId: FALLBACK_USER_ID,
    listId: "platform",
    sectionId: "review",
    parentTaskId: null,
    title: "Pull Q1 metrics data",
    notes: "Collect the top revenue, retention, and activation numbers for the investor update.\n\nPull the final deltas before formatting slides.",
    dueDate: "2026-04-07T20:00:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 2,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "high",
    energyLevel: "HIGH",
    resistance: "MILD",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q2_IMPORTANT",
    tagSlugs: ["work"],
    subtasks: [
      { id: "sub-10", title: "Export retention graph", completed: true, estimate: "10m" },
      { id: "sub-11", title: "Check Q1 activation source", completed: false, estimate: "20m" }
    ]
  },
  {
    id: "task-4",
    userId: FALLBACK_USER_ID,
    listId: "family",
    sectionId: null,
    parentTaskId: null,
    title: "Call mom back",
    notes: "Return the call and confirm next weekend timing.\n\nKeep it short if energy is low.",
    dueDate: "2026-04-07T16:30:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 3,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "low",
    energyLevel: "LOW",
    resistance: "MILD",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q4_NEITHER",
    tagSlugs: []
  },
  {
    id: "task-5",
    userId: FALLBACK_USER_ID,
    listId: "platform",
    sectionId: "planning",
    parentTaskId: null,
    title: "Rewrite scoring weights doc",
    notes: "Refactor the urgency weighting explanation so implementation can follow it without product follow-up.\n\nCapture the rationale for each threshold.",
    dueDate: "2026-04-07T20:00:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 4,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "medium",
    energyLevel: "MEDIUM",
    resistance: "MILD",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q3_URGENT",
    tagSlugs: ["work"],
    subtasks: [{ id: "sub-12", title: "Audit current score bands", completed: false, estimate: "15m" }]
  },
  {
    id: "task-6",
    userId: FALLBACK_USER_ID,
    listId: "personal",
    sectionId: null,
    parentTaskId: null,
    title: "Water the plants",
    notes: "Hit the balcony plants first, then the desk plants.\n\nThe quick win matters more than doing it perfectly.",
    dueDate: "2026-04-07T12:00:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 5,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "none",
    energyLevel: "LOW",
    resistance: "NONE",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q4_NEITHER",
    tagSlugs: []
  },
  {
    id: "task-7",
    userId: FALLBACK_USER_ID,
    listId: "personal",
    sectionId: "backlog",
    parentTaskId: null,
    title: "File Q1 taxes",
    notes: "Collect invoices, reconcile expenses, and send the package before it slips another week.\n\nDo the paperwork before touching secondary admin.",
    dueDate: "2026-04-05T12:00:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 6,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "high",
    energyLevel: "MEDIUM",
    resistance: "DREAD",
    kanbanColumn: "BACKLOG",
    matrixQuadrant: "Q1_URGENT_IMPORTANT",
    tagSlugs: ["urgent"],
    subtasks: [
      { id: "sub-13", title: "Collect bank statements", completed: false, estimate: "15m" },
      { id: "sub-14", title: "Export expense sheet", completed: false, estimate: "30m" }
    ]
  },
  {
    id: "task-8",
    userId: FALLBACK_USER_ID,
    listId: "glimpact",
    sectionId: "review",
    parentTaskId: null,
    title: "Send invoice to Glimpact",
    notes: "Send the final invoice and confirm the payment reference.\n\nKeep the email short and direct.",
    dueDate: "2026-04-06T12:00:00.000Z",
    completed: false,
    completedAt: null,
    sortOrder: 7,
    isDeleted: false,
    createdAt: "2026-04-07T12:00:00.000Z",
    updatedAt: "2026-04-07T12:00:00.000Z",
    status: "active",
    priority: "medium",
    energyLevel: "LOW",
    resistance: "HIGH",
    kanbanColumn: "TODO",
    matrixQuadrant: "Q1_URGENT_IMPORTANT",
    tagSlugs: [],
    subtasks: [
      { id: "sub-15", title: "Attach invoice PDF", completed: false, estimate: "5m" },
      { id: "sub-16", title: "Confirm payment reference", completed: false, estimate: "5m" }
    ]
  }
];

function toTaskRecord(input: (typeof seedTasks)[number]): TaskRecord {
  const urgency = Number.parseInt(
    input.id === "task-7" ? "9" : input.id === "task-8" ? "8" : input.id === "task-1" ? "8" : input.id === "task-3" ? "7" : "4",
    10
  );

  return {
    id: input.id,
    userId: input.userId,
    listId: input.listId,
    sectionId: input.sectionId,
    parentTaskId: input.parentTaskId,
    title: input.title,
    notes: input.notes,
    dueDate: input.dueDate,
    completed: input.completed,
    completedAt: input.completedAt,
    sortOrder: input.sortOrder,
    isDeleted: false,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    status: input.completed ? "completed" : "active",
    priority: input.priority,
    energyLevel: input.energyLevel,
    resistance: input.resistance,
    kanbanColumn:
      input.sectionId === "backlog"
        ? "BACKLOG"
        : input.sectionId === "launch"
          ? "IN_PROGRESS"
          : input.sectionId === "review"
            ? "TODO"
            : "DONE",
    matrixQuadrant:
      urgency >= 8
        ? "Q1_URGENT_IMPORTANT"
        : urgency >= 6
          ? "Q2_IMPORTANT"
          : urgency >= 4
            ? "Q3_URGENT"
            : "Q4_NEITHER",
    tagSlugs: input.tagSlugs
  };
}

function createList(id: string, name: string, color: string, sortOrder: number): ListDto {
  return {
    id,
    userId: FALLBACK_USER_ID,
    name,
    color,
    icon: null,
    sortOrder,
    isDeleted: false,
    createdAt: FALLBACK_NOW,
    updatedAt: FALLBACK_NOW
  };
}

function createTag(id: string, slug: string, name: string, sortOrder: number): TagRecord {
  return {
    id,
    userId: FALLBACK_USER_ID,
    slug,
    name,
    sortOrder,
    isDeleted: false,
    createdAt: FALLBACK_NOW,
    updatedAt: FALLBACK_NOW
  };
}

function buildInitialStore(): FallbackStore {
  return {
    lists: [
      createList("jiholabo-v2", "Jiholabo V2", "#7177ff", 0),
      createList("personal", "Personal", "#36c76a", 1),
      createList("family", "Family", "#ffb01f", 2),
      createList("glimpact", "Glimpact", "#5a90ff", 3),
      createList("platform", "Platform", "#ff5f57", 4)
    ],
    tasks: seedTasks.flatMap((task) => {
      const parent = toTaskRecord(task);
      const subtasks = (task.subtasks ?? []).map((subtask, index) => ({
        ...parent,
        id: subtask.id,
        parentTaskId: parent.id,
        title: subtask.title,
        completed: subtask.completed,
        completedAt: subtask.completed ? parent.updatedAt : null,
        dueDate: null,
        sortOrder: index + 100,
        priority: "none" as const,
        energyLevel: "MEDIUM" as const,
        resistance: "NONE" as const,
        tagSlugs: []
      }));

      return [parent, ...subtasks];
    }),
    tags: [
      createTag("tag-work", "work", "work", 0),
      createTag("tag-urgent", "urgent", "urgent", 1),
      createTag("tag-deep-work", "deep-work", "deep work", 2)
    ],
    savedFilters: [
      {
        id: "assigned",
        userId: FALLBACK_USER_ID,
        name: "Assigned to Me",
        query: { kind: "list", listId: "platform" },
        sortOrder: 0,
        isDeleted: false,
        createdAt: FALLBACK_NOW,
        updatedAt: FALLBACK_NOW
      },
      {
        id: "deep-work",
        userId: FALLBACK_USER_ID,
        name: "Deep Work",
        query: { kind: "tag", tagSlug: "deep-work" },
        sortOrder: 1,
        isDeleted: false,
        createdAt: FALLBACK_NOW,
        updatedAt: FALLBACK_NOW
      }
    ],
    focusSessions: [],
    taskRollups: [],
    calendarContext: {
      userId: FALLBACK_USER_ID,
      availabilityState: "fresh",
      lastRefreshedAt: "2026-04-07T13:50:00.000Z",
      expiresAt: "2026-04-07T14:05:00.000Z",
      stale: false,
      calendars: [
        { id: "primary", summary: "Primary", accessRole: "owner", primary: true },
        { id: "work", summary: "Work", accessRole: "reader" }
      ],
      busyBlocks: [
        {
          id: "busy-1",
          calendarId: "primary",
          calendarSummary: "Primary",
          start: "2026-04-07T15:00:00.000Z",
          end: "2026-04-07T15:30:00.000Z",
          confidence: "high"
        },
        {
          id: "busy-2",
          calendarId: "work",
          calendarSummary: "Work",
          start: "2026-04-07T16:00:00.000Z",
          end: "2026-04-07T17:00:00.000Z",
          confidence: "medium"
        }
      ],
      freeWindows: [
        {
          start: "2026-04-07T14:00:00.000Z",
          end: "2026-04-07T15:00:00.000Z",
          durationMinutes: 60
        },
        {
          start: "2026-04-07T15:30:00.000Z",
          end: "2026-04-07T16:00:00.000Z",
          durationMinutes: 30
        },
        {
          start: "2026-04-07T17:00:00.000Z",
          end: "2026-04-07T18:30:00.000Z",
          durationMinutes: 90
        }
      ],
      partialErrors: [],
      planningWindowStart: "2026-04-07T14:00:00.000Z",
      planningWindowEnd: "2026-04-07T20:00:00.000Z",
      nextSyncToken: "calendar-token-1"
    }
  };
}

let store = buildInitialStore();

export function resetDesktopApiMocks() {
  store = buildInitialStore();
}

function nowIso() {
  return new Date().toISOString();
}

function dateKey(value: string | null) {
  return value ? value.slice(0, 10) : null;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function activeTasks() {
  return store.tasks.filter((task) => task.status === "active" && !task.isDeleted && task.parentTaskId === null);
}

function applySmartList(task: TaskRecord, smartList: SmartListId, today = FALLBACK_NOW.slice(0, 10)) {
  const taskDate = dateKey(task.dueDate);
  switch (smartList) {
    case "today":
      return task.status === "active" && taskDate !== null && taskDate <= today;
    case "next7days":
      return task.status === "active" && taskDate !== null && taskDate >= today && taskDate <= addDays(today, 7);
    case "inbox":
      return task.status === "active" && task.sectionId === null;
    case "completed":
      return task.status === "completed";
    case "wontdo":
      return task.status === "wont_do";
    case "trash":
    default:
      return task.status === "trash" || task.isDeleted;
  }
}

function applySavedFilter(task: TaskRecord, filterId: string) {
  switch (filterId) {
    case "assigned":
      return task.listId === "platform" && task.status === "active";
    case "deep-work":
      return task.tagSlugs.includes("deep-work") && task.status === "active";
    default:
      return true;
  }
}

function applyCustomFilter(task: TaskRecord, filter: TaskTaxonomyQueryInput["filter"]) {
  if (!filter) {
    return true;
  }

  switch (filter.kind) {
    case "tag":
      return filter.tagSlugs.some((tag) => task.tagSlugs.includes(tag));
    case "status":
      return filter.statuses.includes(task.status);
    case "keyword":
      return `${task.title} ${task.notes ?? ""}`.toLowerCase().includes(filter.value.trim().toLowerCase());
    default:
      return true;
  }
}

function compareTaskDates(left: TaskRecord, right: TaskRecord) {
  const leftDate = dateKey(left.dueDate);
  const rightDate = dateKey(right.dueDate);
  if (leftDate === rightDate) {
    return left.sortOrder - right.sortOrder;
  }
  if (leftDate === null) {
    return 1;
  }
  if (rightDate === null) {
    return -1;
  }
  return leftDate.localeCompare(rightDate);
}

function sortTasks(tasks: TaskRecord[], sortBy: TaskSortBy) {
  return [...tasks].sort((left, right) => {
    switch (sortBy) {
      case "priority": {
        const rank = { high: 0, medium: 1, low: 2, none: 3 } as const;
        const delta = rank[left.priority] - rank[right.priority];
        return delta !== 0 ? delta : left.sortOrder - right.sortOrder;
      }
      case "title":
        return left.title.localeCompare(right.title);
      case "date":
      case "dueDate":
        return compareTaskDates(left, right);
      case "manual":
      default:
        return left.sortOrder - right.sortOrder;
    }
  });
}

function groupLabel(groupBy: TaskGroupBy, task: TaskRecord) {
  switch (groupBy) {
    case "section":
      return {
        key: task.sectionId ?? "unsectioned",
        label: task.sectionId
          ? task.sectionId.charAt(0).toUpperCase() + task.sectionId.slice(1)
          : "Unsectioned"
      };
    case "priority":
      return { key: task.priority, label: task.priority.toUpperCase() };
    case "tag":
      return task.tagSlugs.length > 0
        ? { key: task.tagSlugs[0]!, label: `#${task.tagSlugs[0]!}` }
        : { key: "untagged", label: "Untagged" };
    case "date":
      return { key: dateKey(task.dueDate) ?? "undated", label: dateKey(task.dueDate) ?? "Undated" };
    case "status":
      return { key: task.status, label: task.status.replace("_", " ") };
    case "quadrant":
      return {
        key: task.matrixQuadrant ?? "unassigned",
        label: task.matrixQuadrant?.replaceAll("_", " ") ?? "Unassigned"
      };
    case "none":
    default:
      return { key: "all", label: "All tasks" };
  }
}

function groupTasks(tasks: TaskRecord[], groupBy: TaskGroupBy): TaskViewGroup[] {
  const groups = new Map<string, TaskViewGroup>();
  for (const task of tasks) {
    const label = groupLabel(groupBy, task);
    const existing = groups.get(label.key);
    if (existing) {
      existing.items.push(task);
      continue;
    }
    groups.set(label.key, { key: label.key, label: label.label, items: [task] });
  }
  return [...groups.values()];
}

function reasonsForTask(task: TaskRecord, input: TaskTaxonomyQueryInput) {
  const reasons: string[] = [];
  if (input.smartList) {
    reasons.push(`matched ${input.smartList}`);
  }
  if (input.listId) {
    reasons.push(`list ${task.listId}`);
  }
  if (input.savedFilterId) {
    reasons.push(`saved filter ${input.savedFilterId}`);
  }
  if (input.filter?.kind === "tag") {
    reasons.push(`tags ${task.tagSlugs.join(", ")}`);
  }
  if (reasons.length === 0) {
    reasons.push("matched active task query");
  }
  return reasons;
}

export async function fetchMockWorkspaceBootstrap(): Promise<DesktopWorkspaceBootstrap> {
  return {
    lists: [...store.lists].sort((left, right) => left.sortOrder - right.sortOrder),
    sidebarCounts: buildSidebarCounts(),
    tags: [...store.tags].sort((left, right) => left.sortOrder - right.sortOrder),
    savedFilters: [...store.savedFilters].sort((left, right) => left.sortOrder - right.sortOrder)
  };
}

function getTaskRecord(taskId: string) {
  const task = store.tasks.find((item) => item.id === taskId && !item.isDeleted);
  if (!task) {
    throw new Error(`Task ${taskId} was not found`);
  }

  return task;
}

function toTaskDetailSubtask(task: TaskRecord): TaskDetailSubtaskResponse {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    completedAt: task.completedAt,
    dueDate: task.dueDate,
    sortOrder: task.sortOrder
  };
}

function toTaskDetailResponse(taskId: string): TaskDetailResponse {
  const task = getTaskRecord(taskId);
  return {
    id: task.id,
    userId: task.userId,
    listId: task.listId,
    sectionId: task.sectionId,
    parentTaskId: task.parentTaskId,
    title: task.title,
    notes: task.notes,
    dueDate: task.dueDate,
    completed: task.completed,
    completedAt: task.completedAt,
    sortOrder: task.sortOrder,
    isDeleted: task.isDeleted,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    priority: task.priority,
    subtasks: store.tasks
      .filter((item) => item.parentTaskId === taskId && !item.isDeleted)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(toTaskDetailSubtask)
  };
}

export async function fetchMockTaskDetail(taskId: string): Promise<TaskDetailResponse> {
  return toTaskDetailResponse(taskId);
}

export async function updateMockTaskDetail(taskId: string, input: UpdateTaskDetailInput): Promise<TaskDetailResponse> {
  store.tasks = store.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          title: input.title ?? task.title,
          notes: input.notes === undefined ? task.notes : input.notes,
          dueDate: input.dueDate === undefined ? task.dueDate : input.dueDate,
          priority: input.priority ?? task.priority,
          listId: input.listId ?? task.listId,
          sectionId: input.sectionId === undefined ? task.sectionId : input.sectionId,
          updatedAt: nowIso()
        }
      : task
  );

  return toTaskDetailResponse(taskId);
}

export async function createMockSubtask(input: CreateSubtaskInput): Promise<TaskDetailSubtaskResponse> {
  const parent = getTaskRecord(input.parentTaskId);
  const createdAt = nowIso();
  const task: TaskRecord = {
    id: `task-${store.tasks.length + 1}`,
    userId: FALLBACK_USER_ID,
    listId: input.listId,
    sectionId: input.sectionId ?? null,
    parentTaskId: input.parentTaskId,
    title: input.title,
    notes: null,
    dueDate: null,
    completed: false,
    completedAt: null,
    sortOrder: Math.max(0, ...store.tasks.filter((item) => item.parentTaskId === input.parentTaskId).map((item) => item.sortOrder)) + 1,
    isDeleted: false,
    createdAt,
    updatedAt: createdAt,
    status: "active",
    priority: "none",
    energyLevel: parent.energyLevel,
    resistance: "NONE",
    kanbanColumn: parent.kanbanColumn,
    matrixQuadrant: parent.matrixQuadrant,
    tagSlugs: []
  };

  store.tasks = [...store.tasks, task];
  return toTaskDetailSubtask(task);
}

export async function setMockSubtaskCompleted(taskId: string, completed: boolean): Promise<TaskDetailSubtaskResponse> {
  store.tasks = store.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          completed,
          completedAt: completed ? nowIso() : null,
          status: completed ? "completed" : "active",
          updatedAt: nowIso()
        }
      : task
  );

  return toTaskDetailSubtask(getTaskRecord(taskId));
}

export async function deleteMockTask(taskId: string) {
  store.tasks = store.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status: "trash",
          isDeleted: true,
          updatedAt: nowIso()
        }
      : task
  );

  return null;
}

export async function fetchMockTaskQuery(input: TaskTaxonomyQueryInput): Promise<TaskViewQueryResult> {
  const sortBy = input.sortBy ?? (input.view === "matrix" ? "priority" : "manual");
  const groupBy =
    input.groupBy ?? (input.view === "kanban" ? "section" : input.view === "matrix" ? "quadrant" : "section");

  const filtered = store.tasks.filter((task) => {
    if (task.parentTaskId) {
      return false;
    }
    if (input.listId && task.listId !== input.listId) {
      return false;
    }
    if (input.smartList && !applySmartList(task, input.smartList)) {
      return false;
    }
    if (input.savedFilterId && !applySavedFilter(task, input.savedFilterId)) {
      return false;
    }
    if (input.filter && !applyCustomFilter(task, input.filter)) {
      return false;
    }
    if (!input.smartList && !input.listId && !input.savedFilterId && !input.filter) {
      return task.status === "active";
    }
    return true;
  });

  const items = sortTasks(filtered, sortBy);
  return {
    items,
    explanation: `Matched ${items.length} task(s)`,
    predicate: {
      key: input.smartList ?? input.savedFilterId ?? input.listId ?? "active",
      label: input.smartList ?? input.savedFilterId ?? input.listId ?? "Active tasks",
      description: input.smartList ?? input.savedFilterId ?? input.listId ?? "Active tasks"
    },
    reasonsByTaskId: Object.fromEntries(items.map((task) => [task.id, reasonsForTask(task, input)])),
    groupBy,
    sortBy,
    groups: groupBy === "none" ? [{ key: "all", label: "All tasks", items }] : groupTasks(items, groupBy),
    totalCount: items.length
  };
}

export async function fetchMockFocusQueueRecommendation(
  input: TaskTaxonomyQueryInput = {}
): Promise<FocusQueueRecommendation> {
  const tasks = (await fetchMockTaskQuery({ ...input, view: "focusQueue", groupBy: "none", sortBy: "priority" })).items;
  const [task] = tasks;
  if (!task) {
    return { task: null, rationale: "No active tasks are currently eligible for focus." };
  }

  const suggestion = buildSuggestions(task)[0];
  const reasons = [`priority ${task.priority}`, task.dueDate ? `due ${task.dueDate}` : "no due date"];
  if (suggestion) {
    reasons.push(`best slot ${formatTimeRange(suggestion.start, suggestion.end)}`);
  }

  return {
    task,
    rationale: `${task.title} is the current focus recommendation because ${reasons.join(", ")}.`
  };
}

function buildSidebarCounts(): SidebarCountRow[] {
  const smartListRows: SidebarCountRow[] = (
    [
      ["today", "Today"],
      ["next7days", "Next 7 Days"],
      ["inbox", "Inbox"],
      ["completed", "Completed"],
      ["wontdo", "Won't Do"],
      ["trash", "Trash"]
    ] as Array<[SmartListId, string]>
  ).map(([key, label]) => ({
    key,
    label,
    count: store.tasks.filter((task) => applySmartList(task, key)).length,
    explanation: `${label} count`
  }));

  const tagRows = store.tags.map((tag) => ({
    key: tag.slug,
    label: `#${tag.slug}`,
    count: activeTasks().filter((task) => task.tagSlugs.includes(tag.slug)).length,
    explanation: `Tasks tagged #${tag.slug}`
  }));

  const filterRows = store.savedFilters.map((filter) => ({
    key: filter.id,
    label: filter.name,
    count: activeTasks().filter((task) => applySavedFilter(task, filter.id)).length,
    explanation: `Saved filter ${filter.name}`
  }));

  return [...smartListRows, ...tagRows, ...filterRows];
}

export async function moveMockTask(taskId: string, input: TaskMoveInput) {
  store.tasks = store.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          listId: input.listId ?? task.listId,
          sectionId: input.sectionId === undefined ? task.sectionId : input.sectionId,
          sortOrder: input.sortOrder ?? task.sortOrder,
          tagSlugs: input.tagSlugs ?? task.tagSlugs,
          kanbanColumn: input.kanbanColumn ?? task.kanbanColumn,
          matrixQuadrant: input.matrixQuadrant === undefined ? task.matrixQuadrant : input.matrixQuadrant,
          updatedAt: nowIso()
        }
      : task
  );

  return store.tasks.find((task) => task.id === taskId) ?? null;
}

export async function setMockTaskStatus(taskId: string, input: TaskStatusInput) {
  store.tasks = store.tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      status: input.status,
      completed: input.status === "completed",
      completedAt: input.status === "completed" ? nowIso() : null,
      isDeleted: input.status === "trash",
      updatedAt: nowIso()
    };
  });

  return store.tasks.find((task) => task.id === taskId) ?? null;
}

function currentSession() {
  const sorted = [...store.focusSessions].sort((left, right) => right.startedAt.localeCompare(left.startedAt));
  return sorted.find((session) => session.state !== "completed") ?? null;
}

function settleSession(session: FocusSession, at: string) {
  const deltaMinutes = Math.max(
    0,
    Math.round((new Date(at).getTime() - new Date(session.lastTransitionAt).getTime()) / 60_000)
  );

  if (session.state === "running") {
    return {
      ...session,
      workMinutes: session.workMinutes + deltaMinutes,
      loggedMinutes: session.workMinutes + deltaMinutes,
      extraMinutes: Math.max(0, session.workMinutes + deltaMinutes - session.durationMinutes),
      lastTransitionAt: at
    };
  }

  if (session.state === "break") {
    return {
      ...session,
      breakMinutes: session.breakMinutes + deltaMinutes,
      lastTransitionAt: at
    };
  }

  return {
    ...session,
    lastTransitionAt: at
  };
}

function replaceSession(nextSession: FocusSession) {
  store.focusSessions = store.focusSessions.map((session) => (session.id === nextSession.id ? nextSession : session));
}

function upsertTaskRollup(session: FocusSession) {
  const existing = store.taskRollups.find((rollup) => rollup.taskId === session.taskId);
  if (!existing) {
    return [
      {
        taskId: session.taskId,
        totalFocusMinutes: session.workMinutes,
        extraMinutes: session.extraMinutes,
        sessionCount: 1,
        lastSessionId: session.id,
        lastEndedAt: session.endedAt
      },
      ...store.taskRollups
    ];
  }

  return store.taskRollups.map((rollup) =>
    rollup.taskId === session.taskId
      ? {
          ...rollup,
          totalFocusMinutes: rollup.totalFocusMinutes + session.workMinutes,
          extraMinutes: rollup.extraMinutes + session.extraMinutes,
          sessionCount: rollup.sessionCount + 1,
          lastSessionId: session.id,
          lastEndedAt: session.endedAt
        }
      : rollup
  );
}

function buildFocusSnapshot(): FocusSessionSnapshot {
  const session = currentSession();
  return {
    runtimeState: session?.state ?? "idle",
    currentSession: session,
    sessions: [...store.focusSessions].sort((left, right) => right.startedAt.localeCompare(left.startedAt)),
    taskRollups: [...store.taskRollups]
  };
}

export async function fetchMockFocusSessionSnapshot(): Promise<FocusSessionSnapshot> {
  const session = currentSession();
  if (session && (session.state === "running" || session.state === "break")) {
    replaceSession(settleSession(session, nowIso()));
  }
  return buildFocusSnapshot();
}

export async function startMockFocusSession(input: StartFocusSessionInput) {
  const active = currentSession();
  if (active) {
    return active;
  }

  const startedAt = input.startedAt ?? nowIso();
  const session: FocusSession = {
    id: `focus-${store.focusSessions.length + 1}`,
    userId: FALLBACK_USER_ID,
    taskId: input.taskId,
    state: "running",
    startedAt,
    endedAt: null,
    pausedAt: null,
    breakStartedAt: null,
    durationMinutes: input.durationMinutes ?? 25,
    breakDurationMinutes: input.breakDurationMinutes ?? 5,
    extraMinutes: 0,
    loggedMinutes: 0,
    workMinutes: 0,
    breakMinutes: 0,
    lastTransitionAt: startedAt
  };

  store.focusSessions = [session, ...store.focusSessions];
  return session;
}

export async function pauseMockFocusSession(sessionId: string, input: TransitionFocusSessionInput = {}) {
  const session = currentSession();
  if (!session || session.id !== sessionId) {
    return null;
  }

  const at = input.at ?? nowIso();
  const settled = settleSession(session, at);
  const paused: FocusSession = {
    ...settled,
    state: "paused",
    pausedAt: at,
    breakStartedAt: null,
    lastTransitionAt: at
  };

  replaceSession(paused);
  return paused;
}

export async function startMockBreak(sessionId: string, input: TransitionFocusSessionInput = {}) {
  const session = currentSession();
  if (!session || session.id !== sessionId) {
    return null;
  }

  const at = input.at ?? nowIso();
  const settled = settleSession(session, at);
  const onBreak: FocusSession = {
    ...settled,
    state: "break",
    pausedAt: settled.pausedAt ?? at,
    breakStartedAt: at,
    lastTransitionAt: at
  };

  replaceSession(onBreak);
  return onBreak;
}

export async function resumeMockFocusSession(sessionId: string, input: TransitionFocusSessionInput = {}) {
  const session = currentSession();
  if (!session || session.id !== sessionId) {
    return null;
  }

  const at = input.at ?? nowIso();
  const settled = settleSession(session, at);
  const resumed: FocusSession = {
    ...settled,
    state: "running",
    pausedAt: null,
    breakStartedAt: null,
    lastTransitionAt: at
  };

  replaceSession(resumed);
  return resumed;
}

export async function endMockFocusSession(sessionId: string, input: TransitionFocusSessionInput = {}) {
  const session = currentSession();
  if (!session || session.id !== sessionId) {
    return null;
  }

  const at = input.at ?? nowIso();
  const settled = settleSession(session, at);
  const completed: FocusSession = {
    ...settled,
    state: "completed",
    endedAt: at,
    pausedAt: null,
    breakStartedAt: null,
    lastTransitionAt: at
  };

  replaceSession(completed);
  store.taskRollups = upsertTaskRollup(completed);
  return {
    session: completed,
    taskRollup: store.taskRollups.find((rollup) => rollup.taskId === completed.taskId) ?? null
  };
}

function buildSuggestionsForDuration(task: TaskRecord, durationMinutes: number): ScheduleSuggestion[] {
  const windows = store.calendarContext.freeWindows.filter((window) => window.durationMinutes >= durationMinutes);
  return windows.slice(0, 2).map((window, index) => ({
    taskId: task.id,
    taskTitle: task.title,
    start: window.start,
    end: new Date(new Date(window.start).getTime() + durationMinutes * 60_000).toISOString(),
    durationMinutes,
    confidence: store.calendarContext.availabilityState === "fresh" ? "high" : "medium",
    generatedAt: nowIso(),
    rationale:
      index === 0
        ? `Earliest free slot after current busy blocks for ${task.title}`
        : `Secondary slot if you miss the first opening for ${task.title}`,
    blockingBusyWindows: store.calendarContext.busyBlocks.filter(
      (busy) => new Date(busy.end).getTime() <= new Date(window.start).getTime()
    )
  }));
}

function buildSuggestions(task: TaskRecord) {
  return buildSuggestionsForDuration(task, Math.max(15, task.priority === "high" ? 45 : 25));
}

export async function fetchMockCalendarContext(): Promise<GoogleCalendarContextSnapshot> {
  return store.calendarContext;
}

export async function fetchMockCalendarSuggestions(taskId: string): Promise<CalendarSuggestionsResponse> {
  const task = store.tasks.find((item) => item.id === taskId);
  if (!task) {
    return { suggestions: [] };
  }
  return { suggestions: buildSuggestions(task) };
}

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}-${endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}
