import { z } from "zod";
import {
  taskEnergyLevelOptions,
  taskPriorityOptions,
  taskResistanceOptions
} from "../tasks/types";

export const analyticsWindowOptions = ["this-week", "last-28-days", "last-90-days"] as const;
export const analyticsExplanationSourceOptions = ["task-completion", "focus-session"] as const;

export const taskCompletionFactSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1),
  completedAt: z.string(),
  completedDate: z.string(),
  priority: z.enum(taskPriorityOptions),
  resistance: z.enum(taskResistanceOptions),
  energyLevel: z.enum(taskEnergyLevelOptions),
  dueDate: z.string().nullable(),
  overdueAtCompletion: z.boolean(),
  listId: z.string(),
  sectionId: z.string().nullable(),
  parentTaskId: z.string().nullable()
});

export const focusSessionCompletionFactSchema = z.object({
  sessionId: z.string(),
  taskId: z.string(),
  taskTitle: z.string().min(1),
  endedAt: z.string(),
  completedDate: z.string(),
  loggedMinutes: z.number().int().nonnegative(),
  workMinutes: z.number().int().nonnegative(),
  breakMinutes: z.number().int().nonnegative(),
  extraMinutes: z.number().int().nonnegative()
});

export const analyticsExplanationRefSchema = z.object({
  source: z.enum(analyticsExplanationSourceOptions),
  sourceId: z.string(),
  label: z.string().min(1),
  timestamp: z.string()
});

export const streakSummarySchema = z.object({
  currentStreak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  lastActiveDate: z.string().nullable(),
  timezone: z.string(),
  gracePolicy: z.string().min(1)
});

export const weeklySummarySchema = z.object({
  window: z.enum(analyticsWindowOptions),
  windowStart: z.string(),
  windowEnd: z.string(),
  completedTaskCount: z.number().int().nonnegative(),
  completedFocusSessionCount: z.number().int().nonnegative(),
  focusMinutes: z.number().int().nonnegative(),
  activeDays: z.number().int().nonnegative()
});

export const heatmapBucketSchema = z.object({
  date: z.string(),
  completedTaskCount: z.number().int().nonnegative(),
  focusSessionCount: z.number().int().nonnegative(),
  focusMinutes: z.number().int().nonnegative(),
  intensity: z.number().int().min(0).max(4),
  explanationRefs: z.array(analyticsExplanationRefSchema)
});

export const hardestTaskHighlightSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1),
  completedAt: z.string(),
  effortScore: z.number().nonnegative(),
  focusMinutes: z.number().int().nonnegative(),
  explanation: z.string().min(1),
  explanationRefs: z.array(analyticsExplanationRefSchema)
});

export const analyticsSummarySchema = z.object({
  generatedAt: z.string(),
  timezone: z.string(),
  window: z.enum(analyticsWindowOptions),
  streakSummary: streakSummarySchema,
  weeklySummary: weeklySummarySchema,
  hardestTaskHighlight: hardestTaskHighlightSchema.nullable(),
  explanationRefs: z.array(analyticsExplanationRefSchema)
});

export const analyticsHeatmapResponseSchema = z.object({
  generatedAt: z.string(),
  timezone: z.string(),
  window: z.enum(analyticsWindowOptions),
  buckets: z.array(heatmapBucketSchema)
});

export type AnalyticsWindow = (typeof analyticsWindowOptions)[number];
export type AnalyticsExplanationSource = (typeof analyticsExplanationSourceOptions)[number];
export type TaskCompletionFact = z.infer<typeof taskCompletionFactSchema>;
export type FocusSessionCompletionFact = z.infer<typeof focusSessionCompletionFactSchema>;
export type AnalyticsExplanationRef = z.infer<typeof analyticsExplanationRefSchema>;
export type StreakSummary = z.infer<typeof streakSummarySchema>;
export type WeeklySummary = z.infer<typeof weeklySummarySchema>;
export type HeatmapBucket = z.infer<typeof heatmapBucketSchema>;
export type HardestTaskHighlight = z.infer<typeof hardestTaskHighlightSchema>;
export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;
export type AnalyticsSnapshot = AnalyticsSummary;
export type AnalyticsHeatmapResponse = z.infer<typeof analyticsHeatmapResponseSchema>;
