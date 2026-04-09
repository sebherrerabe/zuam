import {
  computeFocusSessionXp,
  computeTaskCompletionXp,
  getLevelForXp,
  getNextLevelXp,
  type TaskRecord
} from "@zuam/shared";

import type {
  ProgressionProfileResponse,
  RewardEvent,
  RewardPreview,
  Unlockable
} from "../../lib/api/desktop-api.types";

export type TaskRewardPreviewModel = RewardPreview & {
  milestoneCopy: string;
  recentRewardCopy: string | null;
};

export function buildTaskRewardPreview(
  task: TaskRecord | null | undefined,
  profileResponse: ProgressionProfileResponse | null | undefined,
  rewardHistory: RewardEvent[] = []
): TaskRewardPreviewModel {
  const reasons: string[] = [];
  const overdueAtCompletion = Boolean(task?.dueDate && new Date(task.dueDate).getTime() < Date.now());
  const completionXp = computeTaskCompletionXp({
    priority: task?.priority ?? "none",
    resistance: task?.resistance ?? "NONE",
    overdueAtCompletion
  });
  const focusSessionXp = computeFocusSessionXp({
    loggedMinutes: task?.priority === "high" ? 35 : task?.priority === "medium" ? 30 : 25,
    extraMinutes: task?.resistance === "DREAD" ? 5 : task?.resistance === "HIGH" ? 3 : 0
  });
  let focusShards = 0;

  if (task?.priority === "high") {
    reasons.push("high priority");
  } else if (task?.priority === "medium") {
    reasons.push("medium priority");
  }

  if (task?.resistance === "HIGH") {
    reasons.push("high resistance");
  } else if (task?.resistance === "DREAD") {
    focusShards += 1;
    reasons.push("dread-heavy task");
  }

  if (task?.tagSlugs.includes("deep-work")) {
    focusShards += 1;
    reasons.push("deep-work tag");
  }

  if (overdueAtCompletion) {
    reasons.push("already overdue");
  }

  if (reasons.length === 0) {
    reasons.push("clean completion");
  }

  const milestonePreview = profileResponse?.milestonePreview;
  const nextUnlockLabel =
    milestonePreview?.nextUnlock?.displayName ?? `level ${milestonePreview?.nextLevel ?? "next"}`;
  const milestoneCopy =
    milestonePreview
      ? milestonePreview.xpRemaining <= completionXp
        ? `This completion should push you toward level ${milestonePreview.nextLevel}.`
        : `${Math.max(0, milestonePreview.xpRemaining - completionXp)} XP left until ${nextUnlockLabel}.`
      : "Progression profile is still loading.";

  const recentReward = rewardHistory.find((event) => event.sourceId === task?.id) ?? rewardHistory[0] ?? null;

  return {
    completionXp,
    focusSessionXp,
    focusShards,
    reasons,
    milestoneCopy,
    recentRewardCopy: recentReward ? `${recentReward.explanationText} · ${recentReward.xpGranted} XP` : null
  };
}

export function formatRewardTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function resolveProgressionTitle(level: number) {
  if (level >= 8) {
    return "Pathfinder";
  }
  if (level >= 5) {
    return "Trailkeeper";
  }
  if (level >= 3) {
    return "Sparkbearer";
  }
  return "Wayfinder";
}

export function resolveUnlockableAccent(unlockable: Unlockable) {
  switch (unlockable.type) {
    case "cloak":
      return "#b7764b";
    case "hat":
      return "#5b6af0";
    case "trail":
      return "#7baf6e";
    case "title":
    default:
      return "#8c7a68";
  }
}

export function describeUnlockable(unlockable: Unlockable) {
  switch (unlockable.type) {
    case "cloak":
      return "Warm outer layer for meaningful completions.";
    case "hat":
      return "Companion-style silhouette for steady focus wins.";
    case "trail":
      return "Ambient trail for longer momentum chains.";
    case "title":
    default:
      return "Profile title unlocked through consistent follow-through.";
  }
}

export function buildProfilePresentation(profile: ProgressionProfileResponse) {
  const levelFloorXp = getLevelFloorXp(profile.profile.totalXp);
  const nextLevelXp = getNextLevelXp(profile.profile.totalXp);
  const xpSpan = Math.max(1, nextLevelXp - levelFloorXp);
  const currentLevelProgress = (profile.profile.totalXp - levelFloorXp) / xpSpan;
  const equippedByType = new Set(profile.profile.equippedCosmetics);
  const unlockedById = new Set(profile.profile.unlockedCosmetics);
  const focusRewards = profile.profile.totalXp >= 720 ? 3 : profile.profile.totalXp >= 260 ? 2 : 1;

  return {
    title: resolveProgressionTitle(profile.profile.level),
    levelFloorXp,
    nextLevelXp,
    currentLevelProgress,
    focusShards: focusRewards,
    streakShieldCount: profile.profile.level >= 7 ? 2 : 1,
    unlockables: profile.unlockables.map((unlockable) => ({
      ...unlockable,
      accent: resolveUnlockableAccent(unlockable),
      description: describeUnlockable(unlockable),
      requiredLevel: getLevelForXp(unlockable.unlockThreshold),
      status: equippedByType.has(unlockable.id)
        ? "equipped"
        : unlockedById.has(unlockable.id)
          ? "unlocked"
          : "locked"
    }))
  };
}

function getLevelFloorXp(totalXp: number) {
  const currentLevel = getLevelForXp(totalXp);
  let floorXp = 0;

  for (let level = 1; level < currentLevel; level += 1) {
    floorXp = getNextLevelXp(floorXp);
  }

  return floorXp;
}
