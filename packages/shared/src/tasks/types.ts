import { z } from "zod";

export const taskStatusOptions = ["todo", "in_progress", "done"] as const;
export const taskPriorityOptions = ["none", "low", "medium", "high"] as const;
export const taskEnergyLevelOptions = ["LOW", "MEDIUM", "HIGH"] as const;
export const taskResistanceOptions = ["NONE", "MILD", "HIGH", "DREAD"] as const;
export const taskLifecycleStatusOptions = ["active", "completed", "wont_do", "trash"] as const;
export const taskKanbanColumnOptions = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"] as const;
export const taskMatrixQuadrantOptions = [
  "Q1_URGENT_IMPORTANT",
  "Q2_IMPORTANT",
  "Q3_URGENT",
  "Q4_NEITHER"
] as const;
export const smartListIdOptions = ["today", "next7days", "inbox", "completed", "wontdo", "trash"] as const;
export const taskViewIdOptions = ["list", "kanban", "matrix", "calendar", "focusQueue"] as const;
export const taskSourceKindOptions = ["smart-list", "list", "tag", "saved-filter"] as const;
export const taskGroupByOptions = ["none", "section", "priority", "tag", "date", "status", "quadrant"] as const;
export const taskSortByOptions = ["manual", "date", "priority", "title", "dueDate"] as const;

export const listDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  sortOrder: z.number().int(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const sectionDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  listId: z.string(),
  name: z.string().min(1),
  sortOrder: z.number().int(),
  isCollapsed: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const taskDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  listId: z.string(),
  sectionId: z.string().nullable(),
  parentTaskId: z.string().nullable(),
  title: z.string().min(1),
  notes: z.string().nullable(),
  dueDate: z.string().nullable(),
  completed: z.boolean(),
  completedAt: z.string().nullable(),
  sortOrder: z.number().int(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const taskSummarySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: z.enum(taskStatusOptions)
});

export const taskListSummarySchema = z.object({
  id: z.string(),
  name: z.string().min(1)
});

export const tagDtoSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  colorToken: z.string().nullable(),
  taskCount: z.number().int().nonnegative()
});

export const taskSourceSchema = z.object({
  kind: z.enum(taskSourceKindOptions),
  id: z.string().nullable()
});

export const taskViewStateSchema = z.object({
  activeView: z.enum(taskViewIdOptions),
  source: taskSourceSchema,
  groupBy: z.enum(taskGroupByOptions),
  sortBy: z.enum(taskSortByOptions),
  selectedTaskId: z.string().nullable()
});

export const taskRecordSchema = taskDtoSchema.extend({
  status: z.enum(taskLifecycleStatusOptions),
  priority: z.enum(taskPriorityOptions),
  energyLevel: z.enum(taskEnergyLevelOptions),
  resistance: z.enum(taskResistanceOptions),
  kanbanColumn: z.enum(taskKanbanColumnOptions),
  matrixQuadrant: z.enum(taskMatrixQuadrantOptions).nullable(),
  tagSlugs: z.array(z.string())
});

export const taskFilterCriterionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("list"),
    operator: z.literal("in"),
    values: z.array(z.string()).min(1)
  }),
  z.object({
    kind: z.literal("section"),
    operator: z.literal("in"),
    values: z.array(z.string()).min(1)
  }),
  z.object({
    kind: z.literal("tag"),
    operator: z.literal("includesAny"),
    values: z.array(z.string()).min(1)
  }),
  z.object({
    kind: z.literal("status"),
    operator: z.literal("in"),
    values: z.array(z.enum(taskLifecycleStatusOptions)).min(1)
  }),
  z.object({
    kind: z.literal("priority"),
    operator: z.literal("in"),
    values: z.array(z.enum(taskPriorityOptions)).min(1)
  }),
  z.object({
    kind: z.literal("energyLevel"),
    operator: z.literal("in"),
    values: z.array(z.enum(taskEnergyLevelOptions)).min(1)
  }),
  z.object({
    kind: z.literal("resistance"),
    operator: z.literal("in"),
    values: z.array(z.enum(taskResistanceOptions)).min(1)
  }),
  z.object({
    kind: z.literal("completion"),
    operator: z.literal("is"),
    value: z.boolean()
  }),
  z.object({
    kind: z.literal("keyword"),
    operator: z.literal("contains"),
    value: z.string().min(1)
  }),
  z.object({
    kind: z.literal("dueDate"),
    operator: z.enum(["overdue", "today", "withinDays", "none"]),
    days: z.number().int().positive().optional()
  })
]);

export type SavedFilterAst =
  | { type: "group"; operator: "and" | "or"; children: SavedFilterAst[] }
  | { type: "not"; child: SavedFilterAst }
  | { type: "criterion"; criterion: z.infer<typeof taskFilterCriterionSchema> };

export const savedFilterAstSchema: z.ZodType<SavedFilterAst> = z.lazy(() =>
  z.union([
    z.object({
      type: z.literal("group"),
      operator: z.enum(["and", "or"]),
      children: z.array(savedFilterAstSchema).min(1)
    }),
    z.object({
      type: z.literal("not"),
      child: savedFilterAstSchema
    }),
    z.object({
      type: z.literal("criterion"),
      criterion: taskFilterCriterionSchema
    })
  ])
);

export const taskQueryFilterSchema = z.object({
  source: taskSourceSchema.optional(),
  groupBy: z.enum(taskGroupByOptions).optional(),
  sortBy: z.enum(taskSortByOptions).optional(),
  ast: savedFilterAstSchema.nullable().optional(),
  search: z.string().trim().min(1).optional()
});

export const taskMatchExplanationSchema = z.object({
  taskId: z.string(),
  summary: z.string().min(1),
  reasons: z.array(z.string().min(1)).min(1)
});

export const taskQueryResultSchema = z.object({
  tasks: z.array(taskRecordSchema),
  explanations: z.array(taskMatchExplanationSchema),
  totalCount: z.number().int().nonnegative()
});

export const smartListPredicateSchema = z.object({
  id: z.enum(smartListIdOptions),
  label: z.string().min(1),
  description: z.string().min(1),
  ast: savedFilterAstSchema
});

export const savedFilterSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  ast: savedFilterAstSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export const sidebarCountEntrySchema = z.object({
  id: z.string(),
  count: z.number().int().nonnegative()
});

export const taskSidebarSummarySchema = z.object({
  smartLists: z.array(z.object({ predicate: smartListPredicateSchema, count: z.number().int().nonnegative() })),
  tags: z.array(tagDtoSchema),
  filters: z.array(z.object({ filter: savedFilterSchema, count: z.number().int().nonnegative() }))
});

export const taskMoveMutationSchema = z.object({
  taskId: z.string(),
  destinationView: z.enum(["list", "kanban", "matrix"]),
  listId: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
  tagSlugs: z.array(z.string()).optional(),
  kanbanColumn: z.enum(taskKanbanColumnOptions).optional(),
  matrixQuadrant: z.enum(taskMatrixQuadrantOptions).nullable().optional(),
  sortOrder: z.number().int().optional()
});

export const taskReorderMutationSchema = z.object({
  taskId: z.string(),
  beforeTaskId: z.string().nullable().optional(),
  afterTaskId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional()
});

export type TaskStatus = (typeof taskStatusOptions)[number];
export type TaskPriority = (typeof taskPriorityOptions)[number];
export type TaskEnergyLevel = (typeof taskEnergyLevelOptions)[number];
export type TaskResistance = (typeof taskResistanceOptions)[number];
export type TaskLifecycleStatus = (typeof taskLifecycleStatusOptions)[number];
export type TaskKanbanColumn = (typeof taskKanbanColumnOptions)[number];
export type TaskMatrixQuadrant = (typeof taskMatrixQuadrantOptions)[number];
export type SmartListId = (typeof smartListIdOptions)[number];
export type TaskViewId = (typeof taskViewIdOptions)[number];
export type TaskSourceKind = (typeof taskSourceKindOptions)[number];
export type TaskGroupBy = (typeof taskGroupByOptions)[number];
export type TaskSortBy = (typeof taskSortByOptions)[number];
export type ListDto = z.infer<typeof listDtoSchema>;
export type SectionDto = z.infer<typeof sectionDtoSchema>;
export type TaskDto = z.infer<typeof taskDtoSchema>;
export type TaskSummary = z.infer<typeof taskSummarySchema>;
export type TaskListSummary = z.infer<typeof taskListSummarySchema>;
export type TagDto = z.infer<typeof tagDtoSchema>;
export type TaskSource = z.infer<typeof taskSourceSchema>;
export type TaskViewState = z.infer<typeof taskViewStateSchema>;
export type TaskRecord = z.infer<typeof taskRecordSchema>;
export type TaskFilterCriterion = z.infer<typeof taskFilterCriterionSchema>;
export type TaskQueryFilter = z.infer<typeof taskQueryFilterSchema>;
export type TaskMatchExplanation = z.infer<typeof taskMatchExplanationSchema>;
export type TaskQueryResult = z.infer<typeof taskQueryResultSchema>;
export type SmartListPredicate = z.infer<typeof smartListPredicateSchema>;
export type SavedFilter = z.infer<typeof savedFilterSchema>;
export type TaskSidebarSummary = z.infer<typeof taskSidebarSummarySchema>;
export type TaskMoveMutation = z.infer<typeof taskMoveMutationSchema>;
export type TaskReorderMutation = z.infer<typeof taskReorderMutationSchema>;
