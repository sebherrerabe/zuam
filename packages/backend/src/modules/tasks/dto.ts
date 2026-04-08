import { z } from "zod";

import {
  taskEnergyLevelOptions,
  taskKanbanColumnOptions,
  taskLifecycleStatusOptions,
  taskMatrixQuadrantOptions,
  taskPriorityOptions
} from "./types";

export const createTaskInputSchema = z.object({
  listId: z.string().min(1),
  sectionId: z.string().min(1).nullable().optional(),
  parentTaskId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(1),
  notes: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tagSlugs: z.array(z.string().min(1)).optional(),
  priority: z.enum(taskPriorityOptions).optional(),
  energyLevel: z.enum(taskEnergyLevelOptions).optional(),
  resistance: z.enum(["NONE", "MILD", "HIGH", "DREAD"] as const).optional(),
  kanbanColumn: z.enum(taskKanbanColumnOptions).optional(),
  matrixQuadrant: z.enum(taskMatrixQuadrantOptions).nullable().optional(),
  status: z.enum(taskLifecycleStatusOptions).optional()
});

export const updateTaskInputSchema = z.object({
  listId: z.string().min(1).optional(),
  sectionId: z.string().min(1).nullable().optional(),
  parentTaskId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(1).optional(),
  notes: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
  tagSlugs: z.array(z.string().min(1)).optional(),
  priority: z.enum(taskPriorityOptions).optional(),
  energyLevel: z.enum(taskEnergyLevelOptions).optional(),
  resistance: z.enum(["NONE", "MILD", "HIGH", "DREAD"] as const).optional(),
  kanbanColumn: z.enum(taskKanbanColumnOptions).optional(),
  matrixQuadrant: z.enum(taskMatrixQuadrantOptions).nullable().optional(),
  status: z.enum(taskLifecycleStatusOptions).optional()
});

export const reorderTaskInputSchema = z.object({
  sortOrder: z.number().int()
});

export const completeTaskInputSchema = z.object({
  completed: z.boolean().default(true)
});

export const moveTaskInputSchema = z.object({
  listId: z.string().min(1).optional(),
  sectionId: z.string().min(1).nullable().optional(),
  sortOrder: z.number().int().optional(),
  tagSlugs: z.array(z.string().min(1)).optional(),
  kanbanColumn: z.enum(taskKanbanColumnOptions).optional(),
  matrixQuadrant: z.enum(taskMatrixQuadrantOptions).nullable().optional()
});

export const setTaskStatusInputSchema = z.object({
  status: z.enum(taskLifecycleStatusOptions)
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type ReorderTaskInput = z.infer<typeof reorderTaskInputSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskInputSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskInputSchema>;
export type SetTaskStatusInput = z.infer<typeof setTaskStatusInputSchema>;
