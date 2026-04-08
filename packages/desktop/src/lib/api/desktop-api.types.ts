import type {
  ListDto,
  SmartListId,
  TaskGroupBy,
  TaskRecord,
  TaskSortBy
} from "@zuam/shared";

export type SidebarCountRow = {
  key: string;
  label: string;
  count: number;
  explanation: string;
};

export type TagRecord = {
  id: string;
  userId: string;
  slug: string;
  name: string;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SavedFilterRecord = {
  id: string;
  userId: string;
  name: string;
  query: unknown;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskViewGroup = {
  key: string;
  label: string;
  items: TaskRecord[];
};

export type TaskViewQueryResult = {
  items: TaskRecord[];
  explanation: string;
  predicate: {
    key: string;
    label: string;
    description: string;
  };
  reasonsByTaskId: Record<string, string[]>;
  groupBy: TaskGroupBy;
  sortBy: TaskSortBy;
  groups: TaskViewGroup[];
  totalCount: number;
};

export type TaskTaxonomyQueryInput = {
  view?: "list" | "kanban" | "matrix" | "focusQueue";
  groupBy?: TaskGroupBy;
  sortBy?: TaskSortBy;
  listId?: string;
  smartList?: SmartListId;
  savedFilterId?: string;
  filter?:
    | {
        kind: "tag";
        tagSlugs: string[];
      }
    | {
        kind: "status";
        statuses: string[];
      }
    | {
        kind: "keyword";
        value: string;
      };
};

export type FocusQueueRecommendation = {
  task: TaskRecord | null;
  rationale: string;
};

export type FocusSession = {
  id: string;
  userId: string;
  taskId: string;
  state: "running" | "paused" | "break" | "completed";
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  breakStartedAt: string | null;
  durationMinutes: number;
  breakDurationMinutes: number;
  extraMinutes: number;
  loggedMinutes: number;
  workMinutes: number;
  breakMinutes: number;
  lastTransitionAt: string;
};

export type FocusTaskRollup = {
  taskId: string;
  totalFocusMinutes: number;
  extraMinutes: number;
  sessionCount: number;
  lastSessionId: string | null;
  lastEndedAt: string | null;
};

export type FocusSessionSnapshot = {
  runtimeState: "idle" | "running" | "paused" | "break" | "completed";
  currentSession: FocusSession | null;
  sessions: FocusSession[];
  taskRollups: FocusTaskRollup[];
};

export type StartFocusSessionInput = {
  taskId: string;
  durationMinutes?: number;
  breakDurationMinutes?: number;
  startedAt?: string;
};

export type TransitionFocusSessionInput = {
  at?: string;
};

export type BusyBlock = {
  id: string;
  calendarId: string;
  calendarSummary: string;
  start: string;
  end: string;
  confidence: "low" | "medium" | "high";
};

export type FreeWindow = {
  start: string;
  end: string;
  durationMinutes: number;
};

export type ScheduleSuggestion = {
  taskId: string;
  taskTitle: string;
  start: string;
  end: string;
  durationMinutes: number;
  rationale: string;
  blockingBusyWindows: BusyBlock[];
};

export type GoogleCalendarContextSnapshot = {
  userId: string;
  lastRefreshedAt: string | null;
  expiresAt: string | null;
  stale: boolean;
  calendars: Array<{
    id: string;
    summary: string;
    accessRole: "freeBusyReader" | "reader" | "writer" | "owner";
    hidden?: boolean;
    deleted?: boolean;
    primary?: boolean;
  }>;
  busyBlocks: BusyBlock[];
  freeWindows: FreeWindow[];
  partialErrors: string[];
  planningWindowStart: string;
  planningWindowEnd: string;
  nextSyncToken: string | null;
};

export type CalendarSuggestionsResponse = {
  suggestions: ScheduleSuggestion[];
};

export type TaskMoveInput = {
  listId?: string;
  sectionId?: string | null;
  sortOrder?: number;
  tagSlugs?: string[];
  kanbanColumn?: TaskRecord["kanbanColumn"];
  matrixQuadrant?: TaskRecord["matrixQuadrant"];
};

export type TaskStatusInput = {
  status: TaskRecord["status"];
};

export type DesktopWorkspaceBootstrap = {
  lists: ListDto[];
  sidebarCounts: SidebarCountRow[];
  tags: TagRecord[];
  savedFilters: SavedFilterRecord[];
};
