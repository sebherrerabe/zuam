import { z } from "zod";

export const focusSessionStateOptions = ["idle", "running", "paused", "break", "completed"] as const;
export const focusSessionEventNameOptions = [
  "focus:start",
  "focus:pause",
  "focus:end",
  "focus:tick",
  "focus:sync",
  "focus:break-start",
  "focus:break-end"
] as const;

export const focusSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  taskId: z.string(),
  state: z.enum(focusSessionStateOptions),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  pausedAt: z.string().nullable(),
  breakStartedAt: z.string().nullable(),
  durationMinutes: z.number().int().nonnegative(),
  breakDurationMinutes: z.number().int().nonnegative(),
  extraMinutes: z.number().int().nonnegative(),
  elapsedSeconds: z.number().int().nonnegative(),
  remainingSeconds: z.number().int().nonnegative()
});

export const focusSessionSummarySchema = z.object({
  activeSession: focusSessionSchema.nullable(),
  recommendedTaskId: z.string().nullable(),
  rationale: z.string().min(1)
});

export const focusSessionMutationSchema = z.object({
  taskId: z.string(),
  durationMinutes: z.number().int().positive().default(25),
  breakDurationMinutes: z.number().int().nonnegative().default(5),
  extraMinutes: z.number().int().nonnegative().default(0)
});

export const focusTickEventSchema = z.object({
  event: z.literal("focus:tick"),
  session: focusSessionSchema
});

export type FocusSessionState = (typeof focusSessionStateOptions)[number];
export type FocusSessionEventName = (typeof focusSessionEventNameOptions)[number];
export type FocusSession = z.infer<typeof focusSessionSchema>;
export type FocusSessionSummary = z.infer<typeof focusSessionSummarySchema>;
export type FocusSessionMutation = z.infer<typeof focusSessionMutationSchema>;
export type FocusTickEvent = z.infer<typeof focusTickEventSchema>;
