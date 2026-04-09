import { z } from "zod";

export const rewardSourceOptions = [
  "TASK_COMPLETION",
  "FOCUS_SESSION_COMPLETION",
  "TASK_START_BONUS"
] as const;

export const unlockableTypeOptions = ["cloak", "hat", "trail", "title"] as const;

export const progressionProfileSchema = z.object({
  userId: z.string(),
  level: z.number().int().positive(),
  totalXp: z.number().int().nonnegative(),
  currentAvatarArchetype: z.string().min(1),
  equippedCosmetics: z.array(z.string()),
  unlockedCosmetics: z.array(z.string()),
  updatedAt: z.string()
});

export const rewardEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  source: z.enum(rewardSourceOptions),
  sourceId: z.string(),
  xpGranted: z.number().int().nonnegative(),
  softCurrencyGranted: z.number().int().nonnegative().nullable(),
  timestamp: z.string(),
  explanationText: z.string().min(1),
  thresholdCrossed: z.number().int().positive().nullable()
});

export const unlockableSchema = z.object({
  id: z.string(),
  type: z.enum(unlockableTypeOptions),
  unlockThreshold: z.number().int().positive(),
  visualAssetRef: z.string().min(1),
  displayName: z.string().min(1)
});

export const milestonePreviewSchema = z.object({
  nextLevel: z.number().int().positive(),
  xpRemaining: z.number().int().nonnegative(),
  nextUnlock: unlockableSchema.nullable()
});

export const rewardPreviewSchema = z.object({
  source: z.enum(rewardSourceOptions),
  sourceId: z.string(),
  xpGranted: z.number().int().nonnegative(),
  explanationText: z.string().min(1)
});

export const shareProgressCardPayloadSchema = z.object({
  userName: z.string().min(1),
  level: z.number().int().positive(),
  totalXp: z.number().int().nonnegative(),
  nextLevelXp: z.number().int().positive(),
  archetype: z.string().min(1),
  equippedCosmetics: z.array(z.string()),
  unlockedCosmetics: z.array(z.string()),
  weeklyActiveDays: z.number().int().nonnegative(),
  shareMessage: z.string().min(1)
});

export type RewardSource = (typeof rewardSourceOptions)[number];
export type UnlockableType = (typeof unlockableTypeOptions)[number];
export type ProgressionProfile = z.infer<typeof progressionProfileSchema>;
export type RewardEvent = z.infer<typeof rewardEventSchema>;
export type Unlockable = z.infer<typeof unlockableSchema>;
export type MilestonePreview = z.infer<typeof milestonePreviewSchema>;
export type RewardPreview = z.infer<typeof rewardPreviewSchema>;
export type ShareProgressCardPayload = z.infer<typeof shareProgressCardPayloadSchema>;
