import { z } from "zod";

export const createSectionInputSchema = z.object({
  listId: z.string().min(1),
  name: z.string().trim().min(1)
});

export const updateSectionInputSchema = z.object({
  listId: z.string().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  isCollapsed: z.boolean().optional()
});

export const reorderSectionInputSchema = z.object({
  sortOrder: z.number().int()
});

export type CreateSectionInput = z.infer<typeof createSectionInputSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionInputSchema>;
export type ReorderSectionInput = z.infer<typeof reorderSectionInputSchema>;
