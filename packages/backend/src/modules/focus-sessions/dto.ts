import { z } from "zod";

export const startFocusSessionInputSchema = z.object({
  taskId: z.string().min(1),
  durationMinutes: z.number().int().positive().default(25),
  breakDurationMinutes: z.number().int().nonnegative().default(5),
  startedAt: z.string().datetime().optional()
});

export const transitionFocusSessionInputSchema = z.object({
  at: z.string().datetime().optional()
});
