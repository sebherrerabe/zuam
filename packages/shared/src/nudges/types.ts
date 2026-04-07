import { z } from "zod";

export const nudgeResistanceOptions = ["low", "mild", "high", "dread"] as const;
export const nudgeUrgencyOptions = ["low", "medium", "high"] as const;
export const nudgeStrategyOptions = ["gentle", "firm", "aggressive", "custom"] as const;
export const nudgeLevelOptions = [1, 2] as const;
export const nudgeEventKindOptions = ["trigger", "snooze", "postpone", "acknowledge"] as const;
export const nudgeEventStateOptions = ["scheduled", "delivered", "snoozed", "acknowledged", "suppressed"] as const;

export const userNudgePreferencesSchema = z.object({
  defaultStrategy: z.enum(nudgeStrategyOptions),
  frequencyMin: z.number().int().positive(),
  escalationEnabled: z.boolean(),
  soundEnabled: z.boolean()
});

export const taskNudgeProfileSchema = z.object({
  userId: z.string(),
  taskId: z.string(),
  resistance: z.enum(nudgeResistanceOptions).optional(),
  urgency: z.enum(nudgeUrgencyOptions).optional(),
  estimateMinutes: z.number().int().nonnegative().optional(),
  nudgeStrategy: z.enum(nudgeStrategyOptions).optional(),
  nudgeFrequencyMin: z.number().int().positive().optional(),
  nudgeEscalation: z.boolean().optional(),
  snoozedUntil: z.string().datetime({ offset: true }).nullable().optional(),
  timesPostponed: z.number().int().nonnegative().optional(),
  timesNudged: z.number().int().nonnegative().optional(),
  lastNudgedAt: z.string().datetime({ offset: true }).nullable().optional(),
  activeEventId: z.string().nullable().optional(),
  lastAction: z.enum(nudgeEventKindOptions).optional()
});

export const nudgeEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  taskId: z.string(),
  kind: z.enum(nudgeEventKindOptions),
  taskTitle: z.string().min(1),
  copyId: z.string().min(1),
  message: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2)]),
  resistance: z.enum(nudgeResistanceOptions),
  urgency: z.enum(nudgeUrgencyOptions),
  estimateMinutes: z.number().int().nonnegative(),
  reason: z.string().min(1),
  scheduledAt: z.string().datetime({ offset: true }),
  deliveredAt: z.string().datetime({ offset: true }),
  acknowledgedAt: z.string().datetime({ offset: true }).nullable(),
  snoozedUntil: z.string().datetime({ offset: true }).nullable(),
  state: z.enum(nudgeEventStateOptions),
  requiresExplicitDismissal: z.boolean(),
  canAutoDismiss: z.boolean(),
  blocking: z.boolean(),
  autoDismissAfter: z.string().datetime({ offset: true }).nullable(),
  frequencyMin: z.number().int().positive(),
  timesPostponed: z.number().int().nonnegative(),
  timesNudged: z.number().int().nonnegative()
});

export type NudgeResistance = (typeof nudgeResistanceOptions)[number];
export type NudgeUrgency = (typeof nudgeUrgencyOptions)[number];
export type NudgeStrategy = (typeof nudgeStrategyOptions)[number];
export type NudgeLevel = (typeof nudgeLevelOptions)[number];
export type NudgeEventKind = (typeof nudgeEventKindOptions)[number];
export type NudgeEventState = (typeof nudgeEventStateOptions)[number];

export type UserNudgePreferences = z.infer<typeof userNudgePreferencesSchema>;
export type TaskNudgeProfile = z.infer<typeof taskNudgeProfileSchema>;
export type NudgeEvent = z.infer<typeof nudgeEventSchema>;

export type NudgeCopySelectionInput = {
  resistance: NudgeResistance;
  urgency: NudgeUrgency;
  level: NudgeLevel;
  taskTitle: string;
  strategy: NudgeStrategy;
};

export type NudgeCopySelection = {
  copyId: string;
  message: string;
  resistance: NudgeResistance;
  urgency: NudgeUrgency;
  level: NudgeLevel;
  strategy: NudgeStrategy;
};

export type NudgeSchedulerResult = {
  events: NudgeEvent[];
};

export type NudgeMutationContext = {
  at?: string;
};

export type NudgeSnoozeInput = {
  minutes?: number;
  snoozedUntil?: string;
  at?: string;
};

export type NudgePostponeInput = {
  dueDate?: string;
  reason?: string;
  at?: string;
};

export type NudgeAcknowledgeInput = {
  at?: string;
};
