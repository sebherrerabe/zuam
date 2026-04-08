import { z } from "zod";

export const calendarConfidenceOptions = ["confirmed", "tentative", "derived"] as const;

export const busyBlockSchema = z.object({
  id: z.string(),
  calendarId: z.string(),
  title: z.string().min(1),
  startAt: z.string(),
  endAt: z.string(),
  confidence: z.enum(calendarConfidenceOptions)
});

export const freeWindowSchema = z.object({
  startAt: z.string(),
  endAt: z.string(),
  durationMinutes: z.number().int().nonnegative()
});

export const scheduleSuggestionSchema = z.object({
  taskId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  rationale: z.string().min(1),
  blockedBy: z.array(z.string()),
  score: z.number().nonnegative()
});

export const calendarContextSnapshotSchema = z.object({
  refreshedAt: z.string(),
  staleAt: z.string(),
  busyBlocks: z.array(busyBlockSchema),
  freeWindows: z.array(freeWindowSchema),
  suggestions: z.array(scheduleSuggestionSchema)
});

export type CalendarConfidence = (typeof calendarConfidenceOptions)[number];
export type BusyBlock = z.infer<typeof busyBlockSchema>;
export type FreeWindow = z.infer<typeof freeWindowSchema>;
export type ScheduleSuggestion = z.infer<typeof scheduleSuggestionSchema>;
export type CalendarContextSnapshot = z.infer<typeof calendarContextSnapshotSchema>;
