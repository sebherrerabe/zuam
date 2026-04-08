import type { ListDto, SmartListId, TaskGroupBy, TaskRecord, TaskSortBy } from "@zuam/shared";

import { taskDetailFixtures } from "../../features/tasks/task-detail-data";
import type {
  CalendarSuggestionsResponse,
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
  TaskMoveInput,
  TaskStatusInput,
  TaskTaxonomyQueryInput,
  TaskViewGroup,
  TaskViewQueryResult,
  TransitionFocusSessionInput
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

function stripHash(tag: string) {
  return tag.trim().replace(/^#/, "");
}

function toTaskRecord(input: (typeof taskDetailFixtures)[keyof typeof taskDetailFixtures]): TaskRecord {
  const urgency = Number.parseInt(input.urgency, 10);

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
    energyLevel: input.energy,
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
    tagSlugs: input.tags.map(stripHash)
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
    tasks: Object.values(taskDetailFixtures).map(toTaskRecord),
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
  return store.tasks.filter((task) => task.status === "active" && !task.isDeleted);
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

export async function fetchMockTaskQuery(input: TaskTaxonomyQueryInput): Promise<TaskViewQueryResult> {
  const sortBy = input.sortBy ?? (input.view === "matrix" ? "priority" : "manual");
  const groupBy =
    input.groupBy ?? (input.view === "kanban" ? "section" : input.view === "matrix" ? "quadrant" : "section");

  const filtered = store.tasks.filter((task) => {
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
