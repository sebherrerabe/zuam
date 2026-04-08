import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

import type {
  SavedFilterRecord,
  SidebarCountRow,
  SmartListKey,
  TaskGroupResult,
  TaskQueryAst,
  TaskQueryExplanation,
  TaskQueryGroupBy,
  TaskQueryResult,
  TaskQuerySortBy,
  TaskPriority,
  TaskRecord
} from "./types";
import {
  smartListKeys,
  taskEnergyLevelOptions,
  taskLifecycleStatusOptions,
  taskPriorityOptions,
  taskQueryFieldOptions,
  taskQueryGroupByOptions,
  taskQuerySortOptions
} from "./types";

export const tagInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1)
});

export const updateTagInputSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  sortOrder: z.number().int().optional()
});

export const savedFilterInputSchema = z.object({
  name: z.string().min(1),
  query: z.lazy(() => taskQueryAstSchema),
  sortOrder: z.number().int().optional()
});

export const updateSavedFilterInputSchema = z.object({
  name: z.string().min(1).optional(),
  query: z.lazy(() => taskQueryAstSchema).optional(),
  sortOrder: z.number().int().optional()
});

export const taskQueryAstSchema: z.ZodType<TaskQueryAst> = z.lazy(() =>
  z.union([
    z.object({
      kind: z.literal("and"),
      clauses: z.array(taskQueryAstSchema).min(1)
    }),
    z.object({
      kind: z.literal("or"),
      clauses: z.array(taskQueryAstSchema).min(1)
    }),
    z.object({
      kind: z.literal("not"),
      clause: taskQueryAstSchema
    }),
    z.object({
      kind: z.literal("list"),
      listIds: z.array(z.string().min(1)).min(1)
    }),
    z.object({
      kind: z.literal("section"),
      sectionIds: z.array(z.string().min(1)).min(1)
    }),
    z.object({
      kind: z.literal("tag"),
      tagSlugs: z.array(z.string().min(1)).min(1)
    }),
    z.object({
      kind: z.literal("status"),
      statuses: z.array(z.enum(taskLifecycleStatusOptions)).min(1)
    }),
    z.object({
      kind: z.literal("priority"),
      priorities: z.array(z.enum(taskPriorityOptions)).min(1)
    }),
    z.object({
      kind: z.literal("energy"),
      energyLevels: z.array(z.enum(taskEnergyLevelOptions)).min(1)
    }),
    z.object({
      kind: z.literal("resistance"),
      resistances: z.array(z.enum(["NONE", "MILD", "HIGH", "DREAD"] as const)).min(1)
    }),
    z.object({
      kind: z.literal("dueDate"),
      from: z.string().nullable().optional(),
      to: z.string().nullable().optional(),
      includeNull: z.boolean().optional()
    }),
    z.object({
      kind: z.literal("keyword"),
      fields: z.array(z.enum(taskQueryFieldOptions)).min(1),
      value: z.string().min(1)
    })
  ])
);

export const taskQueryInputSchema = z
  .object({
    view: z.enum(["list", "kanban", "matrix", "focusQueue"]).optional(),
    groupBy: z.enum(taskQueryGroupByOptions).optional(),
    sortBy: z.enum(taskQuerySortOptions).optional(),
    listId: z.string().min(1).optional(),
    smartList: z.enum(smartListKeys).optional(),
    savedFilterId: z.string().min(1).optional(),
    filter: taskQueryAstSchema.optional()
  })
  .superRefine((value, context) => {
    if (value.savedFilterId && (value.smartList || value.filter)) {
      context.addIssue({
        code: "custom",
        message: "savedFilterId cannot be combined with smartList or filter",
        path: ["savedFilterId"]
      });
    }
  });

export function normalizeTagSlug(input: string) {
  const normalized = input.trim().toLowerCase().replace(/^#/, "");
  if (!normalized) {
    throw new BadRequestException("Tag slug cannot be empty");
  }
  return normalized;
}

export function normalizeTagSlugs(slugs: string[] | undefined | null) {
  if (!slugs || slugs.length === 0) {
    return [];
  }

  return [...new Set(slugs.map((slug) => normalizeTagSlug(slug)))];
}

export function taskPriorityRank(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return 4;
    case "medium":
      return 3;
    case "low":
      return 2;
    case "none":
    default:
      return 1;
  }
}

export function formatDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

export function todayDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function compareDates(left: string | null, right: string | null) {
  if (left === right) {
    return 0;
  }
  if (left === null) {
    return 1;
  }
  if (right === null) {
    return -1;
  }
  return left.localeCompare(right);
}

export function describeSmartList(smartList: SmartListKey) {
  switch (smartList) {
    case "today":
      return {
        key: smartList,
        label: "Today",
        description: "Tasks due today or overdue and still active"
      };
    case "next7days":
      return {
        key: smartList,
        label: "Next 7 Days",
        description: "Tasks due from today through the next 7 days"
      };
    case "inbox":
      return {
        key: smartList,
        label: "Inbox",
        description: "Active tasks that have not been sectioned yet"
      };
    case "completed":
      return {
        key: smartList,
        label: "Completed",
        description: "Tasks marked complete"
      };
    case "wontdo":
      return {
        key: smartList,
        label: "Won't Do",
        description: "Tasks marked as won't do"
      };
    case "trash":
    default:
      return {
        key: "trash" as const,
        label: "Trash",
        description: "Tasks moved to trash"
      };
  }
}

export function smartListToPredicate(smartList: SmartListKey, now = new Date()): TaskQueryAst {
  const today = todayDateKey(now);

  switch (smartList) {
    case "today":
      return {
        kind: "and",
        clauses: [
          { kind: "status", statuses: ["active"] },
          {
            kind: "dueDate",
            from: null,
            to: today,
            includeNull: false
          }
        ]
      };
    case "next7days":
      return {
        kind: "and",
        clauses: [
          { kind: "status", statuses: ["active"] },
          {
            kind: "dueDate",
            from: today,
            to: addDays(today, 7),
            includeNull: false
          }
        ]
      };
    case "inbox":
      return {
        kind: "and",
        clauses: [
          { kind: "status", statuses: ["active"] },
          { kind: "section", sectionIds: ["__null__"] }
        ]
      };
    case "completed":
      return { kind: "status", statuses: ["completed"] };
    case "wontdo":
      return { kind: "status", statuses: ["wont_do"] };
    case "trash":
    default:
      return { kind: "status", statuses: ["trash"] };
  }
}

export function queryAstToString(node: TaskQueryAst): string {
  switch (node.kind) {
    case "and":
      return `all of (${node.clauses.map(queryAstToString).join(", ")})`;
    case "or":
      return `any of (${node.clauses.map(queryAstToString).join(", ")})`;
    case "not":
      return `not (${queryAstToString(node.clause)})`;
    case "list":
      return `list in [${node.listIds.map((listId) => `#${listId}`).join(", ")}]`;
    case "section":
      return `section in [${node.sectionIds
        .map((sectionId) => (sectionId === "__null__" ? "unsectioned" : sectionId))
        .join(", ")}]`;
    case "tag":
      return `tag in [${node.tagSlugs.map((slug) => `#${slug}`).join(", ")}]`;
    case "status":
      return `status in [${node.statuses.join(", ")}]`;
    case "priority":
      return `priority in [${node.priorities.join(", ")}]`;
    case "energy":
      return `energy in [${node.energyLevels.join(", ")}]`;
    case "resistance":
      return `resistance in [${node.resistances.join(", ")}]`;
    case "dueDate":
      return `due date between ${node.from ?? "any"} and ${node.to ?? "any"}`;
    case "keyword":
      return `keyword "${node.value}" in ${node.fields.join(", ")}`;
    default:
      return "unknown predicate";
  }
}

function dueDateKey(task: TaskRecord) {
  return task.dueDate ? formatDateKey(task.dueDate) : null;
}

function taskText(task: TaskRecord) {
  return `${task.title} ${task.notes ?? ""}`.toLowerCase();
}

export function evaluateTaskQuery(task: TaskRecord, query: TaskQueryAst): TaskQueryExplanation {
  switch (query.kind) {
    case "and": {
      const childResults = query.clauses.map((clause) => evaluateTaskQuery(task, clause));
      const matched = childResults.every((result) => result.matched);
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched
          ? childResults.flatMap((result) => result.reasons)
          : childResults.flatMap((result) => result.reasons.length > 0 ? result.reasons : [result.label])
      };
    }
    case "or": {
      const childResults = query.clauses.map((clause) => evaluateTaskQuery(task, clause));
      const matchedResults = childResults.filter((result) => result.matched);
      return {
        matched: matchedResults.length > 0,
        label: queryAstToString(query),
        reasons:
          matchedResults.length > 0
            ? matchedResults.flatMap((result) => result.reasons)
            : childResults.flatMap((result) => result.reasons)
      };
    }
    case "not": {
      const child = evaluateTaskQuery(task, query.clause);
      return {
        matched: !child.matched,
        label: queryAstToString(query),
        reasons: child.matched ? [`excluded by ${child.label}`] : child.reasons
      };
    }
    case "list": {
      const matched = query.listIds.includes(task.listId);
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched ? [`list ${task.listId}`] : [`list ${task.listId} not in scope`]
      };
    }
    case "section": {
      const matched =
        (task.sectionId === null && query.sectionIds.includes("__null__")) ||
        (task.sectionId !== null && query.sectionIds.includes(task.sectionId));
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched
          ? [task.sectionId === null ? "unsectioned" : `section ${task.sectionId}`]
          : [task.sectionId === null ? "task is unsectioned" : `section ${task.sectionId} not in scope`]
      };
    }
    case "tag": {
      const normalized = normalizeTagSlugs(query.tagSlugs);
      const matched = task.tagSlugs.some((slug) => normalized.includes(slug));
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched
          ? task.tagSlugs
              .filter((slug) => normalized.includes(slug))
              .map((slug) => `tag #${slug}`)
          : [`tags ${task.tagSlugs.map((slug) => `#${slug}`).join(", ") || "none"} not in scope`]
      };
    }
    case "status": {
      const matched = query.statuses.includes(task.status);
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched ? [`status ${task.status}`] : [`status ${task.status} not in scope`]
      };
    }
    case "priority": {
      const matched = query.priorities.includes(task.priority);
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched ? [`priority ${task.priority}`] : [`priority ${task.priority} not in scope`]
      };
    }
    case "energy": {
      const matched = query.energyLevels.includes(task.energyLevel);
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched ? [`energy ${task.energyLevel}`] : [`energy ${task.energyLevel} not in scope`]
      };
    }
    case "resistance": {
      const matched = query.resistances.includes(task.resistance);
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched ? [`resistance ${task.resistance}`] : [`resistance ${task.resistance} not in scope`]
      };
    }
    case "dueDate": {
      const taskDate = dueDateKey(task);
      const from = query.from ? formatDateKey(query.from) : null;
      const to = query.to ? formatDateKey(query.to) : null;
      const matched =
        taskDate !== null &&
        (from === null || taskDate >= from) &&
        (to === null || taskDate <= to);

      if (taskDate === null) {
        return {
          matched: Boolean(query.includeNull),
          label: queryAstToString(query),
          reasons: query.includeNull ? ["no due date allowed"] : ["missing due date"]
        };
      }

      return {
        matched,
        label: queryAstToString(query),
        reasons: matched
          ? [`due date ${taskDate}`]
          : [`due date ${taskDate} outside ${from ?? "any"}..${to ?? "any"}`]
      };
    }
    case "keyword": {
      const text = taskText(task);
      const needle = query.value.trim().toLowerCase();
      const matched = text.includes(needle);
      return {
        matched,
        label: queryAstToString(query),
        reasons: matched ? [`keyword "${needle}" found`] : [`keyword "${needle}" not found`]
      };
    }
    default: {
      const exhaustive: never = query;
      return exhaustive;
    }
  }
}

export function resolveTaskQuery(
  task: TaskRecord,
  query: TaskQueryAst
): TaskQueryExplanation {
  return evaluateTaskQuery(task, query);
}

export function explainTaskQuery(query: TaskQueryAst) {
  return queryAstToString(query);
}

export function defaultTaskQuerySortBy(view?: string): TaskQuerySortBy {
  switch (view) {
    case "matrix":
      return "priority";
    case "kanban":
      return "manual";
    case "focusQueue":
      return "priority";
    case undefined:
      return "manual";
    case "list":
    default:
      return "manual";
  }
}

export function defaultTaskQueryGroupBy(view?: string): TaskQueryGroupBy {
  switch (view) {
    case "kanban":
      return "section";
    case "matrix":
      return "quadrant";
    case "focusQueue":
      return "none";
    case undefined:
      return "none";
    case "list":
    default:
      return "section";
  }
}

export function sortTasks(tasks: TaskRecord[], sortBy: TaskQuerySortBy) {
  const priorityOrder: Record<TaskPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
    none: 3
  };

  return [...tasks].sort((left, right) => {
    switch (sortBy) {
      case "date":
      case "dueDate": {
        const leftDate = dueDateKey(left);
        const rightDate = dueDateKey(right);
        const dateComparison = compareDates(leftDate, rightDate);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        break;
      }
      case "priority": {
        const priorityComparison = priorityOrder[left.priority] - priorityOrder[right.priority];
        if (priorityComparison !== 0) {
          return priorityComparison;
        }
        break;
      }
      case "title": {
        const titleComparison = left.title.localeCompare(right.title);
        if (titleComparison !== 0) {
          return titleComparison;
        }
        break;
      }
      case "manual":
      default:
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }
        break;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.id.localeCompare(right.id);
  });
}

export function groupTasks(tasks: TaskRecord[], groupBy: TaskQueryGroupBy): TaskGroupResult[] {
  const grouped = new Map<string, TaskRecord[]>();

  for (const task of tasks) {
    const groupKey = resolveTaskGroupKey(task, groupBy);
    const bucket = grouped.get(groupKey.key) ?? [];
    bucket.push(task);
    grouped.set(groupKey.key, bucket);
  }

  return [...grouped.entries()]
    .map(([key, items]) => ({
      key,
      label: resolveTaskGroupLabel(key, groupBy),
      items
    }));
}

export function resolveTaskGroupKey(
  task: TaskRecord,
  groupBy: TaskQueryGroupBy
): { key: string; label: string } {
  switch (groupBy) {
    case "section":
      return task.sectionId ? { key: task.sectionId, label: task.sectionId } : { key: "unsectioned", label: "Unsectioned" };
    case "priority":
      return { key: task.priority, label: task.priority };
    case "tag":
      return task.tagSlugs.length > 0
        ? (() => {
            const firstTag = task.tagSlugs[0];
            if (!firstTag) {
              return { key: "untagged", label: "Untagged" };
            }
            return { key: firstTag, label: `#${firstTag}` };
          })()
        : { key: "untagged", label: "Untagged" };
    case "date":
      return { key: dueDateKey(task) ?? "undated", label: dueDateKey(task) ?? "Undated" };
    case "status":
      return { key: task.status, label: task.status };
    case "quadrant":
      return { key: task.matrixQuadrant ?? "unassigned", label: task.matrixQuadrant ?? "Unassigned" };
    case "none":
    default:
      return { key: "all", label: "All tasks" };
  }
}

export function resolveTaskGroupLabel(key: string, groupBy: TaskQueryGroupBy) {
  switch (groupBy) {
    case "section":
      return key === "unsectioned" ? "Unsectioned" : key;
    case "priority":
      return key;
    case "tag":
      return key === "untagged" ? "Untagged" : `#${key}`;
    case "date":
      return key === "undated" ? "Undated" : key;
    case "status":
      return key;
    case "quadrant":
      return key === "unassigned" ? "Unassigned" : key;
    case "none":
    default:
      return "All tasks";
  }
}

export function buildTaskQueryResult(
  tasks: TaskRecord[],
  query: TaskQueryAst,
  predicateKey: string,
  predicateLabel: string
): TaskQueryResult {
  const matched = tasks
    .map((task) => ({
      task,
      evaluation: resolveTaskQuery(task, query)
    }))
    .filter(({ evaluation }) => evaluation.matched);

  return {
    items: matched.map(({ task }) => task),
    explanation: `Matched ${matched.length} task(s) for ${predicateLabel}`,
    predicate: {
      key: predicateKey,
      label: predicateLabel,
      description: predicateLabel
    },
    reasonsByTaskId: Object.fromEntries(
      matched.map(({ task, evaluation }) => [task.id, evaluation.reasons])
    )
  };
}

export function buildSidebarCounts(
  tasks: TaskRecord[],
  tags: Array<{ slug: string; name: string }>,
  savedFilters: SavedFilterRecord[]
): SidebarCountRow[] {
  const smartLists = smartListKeys.map((key) => {
    const predicate = smartListToPredicate(key);
    const label = describeSmartList(key).label;
    const count = tasks.filter((task) => resolveTaskQuery(task, predicate).matched).length;
    return {
      key,
      label,
      count,
      explanation: describeSmartList(key).description
    };
  });

  const tagNames = new Map(tags.map((tag) => [tag.slug, tag.name]));
  const tagSlugs = new Set<string>(tags.map((tag) => tag.slug));
  for (const task of tasks) {
    for (const slug of task.tagSlugs) {
      tagSlugs.add(slug);
    }
  }

  const tagRows = [...tagSlugs].sort().map((slug) => ({
    key: slug,
    label: tagNames.get(slug) ?? `#${slug}`,
    count: tasks.filter((task) => task.tagSlugs.includes(slug)).length,
    explanation: `Tasks tagged #${slug}`
  }));

  return [
    ...smartLists,
    ...tagRows,
    ...savedFilters.map((filter) => ({
      key: filter.id,
      label: filter.name,
      count: tasks.filter((task) => resolveTaskQuery(task, filter.query).matched).length,
      explanation: queryAstToString(filter.query)
    }))
  ];
}

export function recommendFocusTask(tasks: TaskRecord[]) {
  const activeTasks = tasks.filter((task) => task.status === "active" && !task.isDeleted);

  if (activeTasks.length === 0) {
    return { task: null as TaskRecord | null, rationale: "No active tasks available for focus." };
  }

  const scored = activeTasks.map((task) => {
    const dateKey = dueDateKey(task);
    const today = todayDateKey();
    let score = 0;
    const reasons: string[] = [];

    if (dateKey !== null) {
      if (dateKey < today) {
        score += 100;
        reasons.push(`overdue on ${dateKey}`);
      } else if (dateKey === today) {
        score += 80;
        reasons.push("due today");
      } else if (dateKey <= addDays(today, 7)) {
        score += 60;
        reasons.push(`due soon on ${dateKey}`);
      } else {
        score += 20;
        reasons.push(`due later on ${dateKey}`);
      }
    } else {
      score += 10;
      reasons.push("no due date");
    }

    score += taskPriorityRank(task.priority) * 10;
    reasons.push(`priority ${task.priority}`);

    switch (task.resistance) {
      case "DREAD":
        score += 20;
        reasons.push("high resistance");
        break;
      case "HIGH":
        score += 15;
        reasons.push("high resistance");
        break;
      case "MILD":
        score += 5;
        reasons.push("mild resistance");
        break;
      case "NONE":
      default:
        break;
    }

    return { task, score, reasons };
  });

  scored.sort((left, right) => {
    if (left.score !== right.score) {
      return right.score - left.score;
    }

    const dateComparison = compareDates(dueDateKey(left.task), dueDateKey(right.task));
    if (dateComparison !== 0) {
      return dateComparison;
    }

    if (left.task.sortOrder !== right.task.sortOrder) {
      return left.task.sortOrder - right.task.sortOrder;
    }

    return left.task.id.localeCompare(right.task.id);
  });

  const chosen = scored[0]!;
  return {
    task: chosen.task,
    rationale: `${chosen.task.title} selected with score ${chosen.score}: ${chosen.reasons.join(", ")}`
  };
}
