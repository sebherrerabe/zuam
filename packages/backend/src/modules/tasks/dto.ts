import { z } from "zod";

export const createTaskInputSchema = z.object({
  listId: z.string().min(1),
  sectionId: z.string().min(1).nullable().optional(),
  parentTaskId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(1),
  notes: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional()
});

export const updateTaskInputSchema = z.object({
  listId: z.string().min(1).optional(),
  sectionId: z.string().min(1).nullable().optional(),
  parentTaskId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(1).optional(),
  notes: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional()
});

export const reorderTaskInputSchema = z.object({
  sortOrder: z.number().int()
});

export const completeTaskInputSchema = z.object({
  completed: z.boolean().default(true)
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type ReorderTaskInput = z.infer<typeof reorderTaskInputSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskInputSchema>;
