import { z } from "zod";

export const taskStatusOptions = ["todo", "in_progress", "done"] as const;

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

export type TaskStatus = (typeof taskStatusOptions)[number];
export type ListDto = z.infer<typeof listDtoSchema>;
export type SectionDto = z.infer<typeof sectionDtoSchema>;
export type TaskDto = z.infer<typeof taskDtoSchema>;
export type TaskSummary = z.infer<typeof taskSummarySchema>;
export type TaskListSummary = z.infer<typeof taskListSummarySchema>;
