import { z } from "zod";

export const createListInputSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().min(1).nullable().optional(),
  icon: z.string().trim().min(1).nullable().optional()
});

export const updateListInputSchema = z.object({
  name: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).nullable().optional(),
  icon: z.string().trim().min(1).nullable().optional()
});

export const reorderListInputSchema = z.object({
  sortOrder: z.number().int()
});

export type CreateListInput = z.infer<typeof createListInputSchema>;
export type UpdateListInput = z.infer<typeof updateListInputSchema>;
export type ReorderListInput = z.infer<typeof reorderListInputSchema>;
