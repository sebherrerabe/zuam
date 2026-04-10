import { describe, expect, it } from "vitest";

import { buildTaskRewardPreview } from "../features/progression/progression-utils";
import type { ProgressionProfileResponse, RewardEvent } from "../lib/api/desktop-api.types";
import type { TaskRecord } from "@zuam/shared";

function buildTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: "task-1",
    userId: "user-1",
    listId: "platform",
    sectionId: "launch",
    parentTaskId: null,
    title: "Ship desktop release flow",
    notes: null,
    dueDate: "2026-04-10",
    completed: false,
    completedAt: null,
    sortOrder: 1,
    isDeleted: false,
    createdAt: "2026-04-10T08:00:00.000Z",
    updatedAt: "2026-04-10T08:00:00.000Z",
    status: "active",
    priority: "high",
    energyLevel: "HIGH",
    resistance: "DREAD",
    kanbanColumn: "IN_PROGRESS",
    matrixQuadrant: "Q1_URGENT_IMPORTANT",
    tagSlugs: ["deep-work"],
    ...overrides
  };
}

function buildProfile(): ProgressionProfileResponse {
  return {
    profile: {
      userId: "user-1",
      level: 7,
      totalXp: 1240,
      currentAvatarArchetype: "Pathfinder",
      equippedCosmetics: ["cosmetic-flame-cloak"],
      unlockedCosmetics: ["cosmetic-flame-cloak", "cosmetic-wayward-cap"],
      updatedAt: "2026-04-10T08:00:00.000Z"
    },
    unlockables: [
      {
        id: "cosmetic-flame-cloak",
        type: "cloak",
        unlockThreshold: 720,
        visualAssetRef: "atlas://cloak/flame",
        displayName: "Flame Cloak"
      }
    ],
    milestonePreview: {
      nextLevel: 8,
      xpRemaining: 160,
      nextUnlock: {
        id: "cosmetic-suntrail-cape",
        type: "cloak",
        unlockThreshold: 1500,
        visualAssetRef: "atlas://cloak/suntrail-cape",
        displayName: "Suntrail Cape"
      }
    }
  };
}

describe("progression utils", () => {
  it("computes reward previews through shared progression helpers", () => {
    const rewardHistory: RewardEvent[] = [
      {
        id: "reward-1",
        userId: "user-1",
        source: "TASK_COMPLETION",
        sourceId: "task-1",
        xpGranted: 48,
        softCurrencyGranted: null,
        timestamp: "2026-04-10T08:30:00.000Z",
        explanationText: "high priority + dread resistance",
        thresholdCrossed: null
      }
    ];

    const preview = buildTaskRewardPreview(buildTask(), buildProfile(), rewardHistory);

    expect(preview.completionXp).toBeGreaterThan(0);
    expect(preview.focusSessionXp).toBeGreaterThan(0);
    expect(preview.reasons).toContain("deep-work tag");
    expect(preview.recentRewardCopy).toContain("48 XP");
  });
});
