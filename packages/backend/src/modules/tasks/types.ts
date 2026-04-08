import type { TaskDto } from "@zuam/shared/tasks";

export const taskPriorityOptions = ["none", "low", "medium", "high"] as const;
export const taskEnergyLevelOptions = ["LOW", "MEDIUM", "HIGH"] as const;
export const taskResistanceOptions = ["NONE", "MILD", "HIGH", "DREAD"] as const;
export const taskKanbanColumnOptions = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"] as const;
export const taskMatrixQuadrantOptions = [
  "Q1_URGENT_IMPORTANT",
  "Q2_IMPORTANT",
  "Q3_URGENT",
  "Q4_NEITHER"
] as const;
export const taskLifecycleStatusOptions = ["active", "completed", "wont_do", "trash"] as const;
export const smartListKeys = ["today", "next7days", "inbox", "completed", "wontdo", "trash"] as const;

export type TaskPriority = (typeof taskPriorityOptions)[number];
export type TaskEnergyLevel = (typeof taskEnergyLevelOptions)[number];
export type TaskResistance = (typeof taskResistanceOptions)[number];
export type TaskKanbanColumn = (typeof taskKanbanColumnOptions)[number];
export type TaskMatrixQuadrant = (typeof taskMatrixQuadrantOptions)[number];
export type TaskLifecycleStatus = (typeof taskLifecycleStatusOptions)[number];
export type SmartListKey = (typeof smartListKeys)[number];

export type TaskRecord = TaskDto & {
  status: TaskLifecycleStatus;
  priority: TaskPriority;
  energyLevel: TaskEnergyLevel;
  resistance: TaskResistance;
  kanbanColumn: TaskKanbanColumn;
  matrixQuadrant: TaskMatrixQuadrant | null;
  tagSlugs: string[];
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

export const taskQueryFieldOptions = ["title", "notes"] as const;
export const taskQuerySortOptions = ["manual", "date", "priority", "title", "dueDate"] as const;
export const taskQueryGroupByOptions = [
  "none",
  "section",
  "priority",
  "tag",
  "date",
  "status",
  "quadrant"
] as const;

export type TaskQueryField = (typeof taskQueryFieldOptions)[number];
export type TaskQuerySortBy = (typeof taskQuerySortOptions)[number];
export type TaskQueryGroupBy = (typeof taskQueryGroupByOptions)[number];

export type TaskQueryAst =
  | {
      kind: "and";
      clauses: TaskQueryAst[];
    }
  | {
      kind: "or";
      clauses: TaskQueryAst[];
    }
  | {
      kind: "not";
      clause: TaskQueryAst;
    }
  | {
      kind: "list";
      listIds: string[];
    }
  | {
      kind: "section";
      sectionIds: string[];
    }
  | {
      kind: "tag";
      tagSlugs: string[];
    }
  | {
      kind: "status";
      statuses: TaskLifecycleStatus[];
    }
  | {
      kind: "priority";
      priorities: TaskPriority[];
    }
  | {
      kind: "energy";
      energyLevels: TaskEnergyLevel[];
    }
  | {
      kind: "resistance";
      resistances: TaskResistance[];
    }
  | {
      kind: "dueDate";
      from?: string | null;
      to?: string | null;
      includeNull?: boolean;
    }
  | {
      kind: "keyword";
      fields: TaskQueryField[];
      value: string;
    };

export type SavedFilterRecord = {
  id: string;
  userId: string;
  name: string;
  query: TaskQueryAst;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskQueryExplanation = {
  matched: boolean;
  label: string;
  reasons: string[];
};

export type TaskQueryResult = {
  items: TaskRecord[];
  explanation: string;
  predicate: {
    key: string;
    label: string;
    description: string;
  };
  reasonsByTaskId: Record<string, string[]>;
};

export type TaskGroupResult = {
  key: string;
  label: string;
  items: TaskRecord[];
};

export type TaskViewQueryResult = TaskQueryResult & {
  groupBy: TaskQueryGroupBy;
  sortBy: TaskQuerySortBy;
  groups: TaskGroupResult[];
  totalCount: number;
};

export type SidebarCountRow = {
  key: string;
  label: string;
  count: number;
  explanation: string;
};

export type FocusQueueRecommendation = {
  task: TaskRecord | null;
  rationale: string;
};
