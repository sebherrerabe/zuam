import { z } from "zod";

export const taskStatusOptions = ["todo", "in_progress", "done"] as const;

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
export type TaskSummary = z.infer<typeof taskSummarySchema>;
export type TaskListSummary = z.infer<typeof taskListSummarySchema>;
