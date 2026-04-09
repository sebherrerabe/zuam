import type { TaskPriority, TaskResistance } from "../tasks/types";

export const progressionLevelThresholds = [0, 120, 260, 460, 720, 980, 1240, 1500, 1900, 2350] as const;

export type TaskRewardPreviewInput = {
  priority: TaskPriority;
  resistance: TaskResistance;
  overdueAtCompletion: boolean;
};

export type FocusRewardPreviewInput = {
  loggedMinutes: number;
  extraMinutes: number;
};

const priorityXp: Record<TaskPriority, number> = {
  none: 12,
  low: 18,
  medium: 24,
  high: 32
};

const resistanceXp: Record<TaskResistance, number> = {
  NONE: 0,
  MILD: 4,
  HIGH: 10,
  DREAD: 16
};

export function getLevelForXp(totalXp: number) {
  let level = 1;
  for (let index = 0; index < progressionLevelThresholds.length; index += 1) {
    if (totalXp >= progressionLevelThresholds[index]!) {
      level = index + 1;
    }
  }
  return level;
}

export function getNextLevelXp(totalXp: number) {
  for (const threshold of progressionLevelThresholds) {
    if (threshold > totalXp) {
      return threshold!;
    }
  }

  return progressionLevelThresholds[progressionLevelThresholds.length - 1]! + 500;
}

export function computeTaskCompletionXp(input: TaskRewardPreviewInput) {
  return (
    priorityXp[input.priority] +
    resistanceXp[input.resistance] +
    (input.overdueAtCompletion ? 8 : 0)
  );
}

export function buildTaskCompletionExplanation(input: TaskRewardPreviewInput) {
  const reasons = [input.priority !== "none" ? `${input.priority} priority` : "completion"];
  if (input.resistance !== "NONE") {
    reasons.push(`${input.resistance.toLowerCase()} resistance`);
  }
  if (input.overdueAtCompletion) {
    reasons.push("overdue recovery");
  }

  return reasons.join(" + ");
}

export function computeFocusSessionXp(input: FocusRewardPreviewInput) {
  return 28 + Math.min(36, Math.max(0, input.loggedMinutes)) + Math.min(12, input.extraMinutes * 2);
}

export function buildFocusSessionExplanation(input: FocusRewardPreviewInput) {
  const reasons = [`${input.loggedMinutes} focus mins`];
  if (input.extraMinutes > 0) {
    reasons.push(`${input.extraMinutes} extra mins`);
  }
  return reasons.join(" + ");
}
