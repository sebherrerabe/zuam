import { BadRequestException, Injectable } from "@nestjs/common";
import type {
  MilestonePreview,
  ProgressionProfile,
  RewardEvent,
  ShareProgressCardPayload,
  TaskCompletionFact
} from "@zuam/shared";
import {
  buildFocusSessionExplanation,
  buildTaskCompletionExplanation,
  computeFocusSessionXp,
  computeTaskCompletionXp,
  getLevelForXp,
  getNextLevelXp
} from "@zuam/shared";

import { AnalyticsInsightsDao } from "../analytics-insights/dao";
import { FocusSessionsEventBus } from "../focus-sessions/events";
import type { FocusSession } from "../focus-sessions/types";
import { CoreDataEventBus } from "../core-data-store";
import type { TaskRecord } from "../tasks/types";
import { ProgressionDao } from "./dao";
import { ProgressionEventBus } from "./events";

@Injectable()
export class ProgressionService {
  constructor(
    private readonly progressionDao: ProgressionDao,
    private readonly analyticsInsightsDao: AnalyticsInsightsDao,
    private readonly coreDataEventBus: CoreDataEventBus,
    private readonly focusSessionsEventBus: FocusSessionsEventBus,
    private readonly progressionEventBus: ProgressionEventBus
  ) {
    this.coreDataEventBus.on("task:updated", (task) => this.handleTaskUpdated(task as TaskRecord));
    this.focusSessionsEventBus.on("focus:end", (session) => this.handleFocusEnded(session as FocusSession));
  }

  getProfile(userId: string) {
    const profile = this.progressionDao.getProfile(userId);
    return {
      profile,
      milestonePreview: this.getMilestonePreview(profile),
      unlockables: this.progressionDao.unlockables
    };
  }

  listRewardHistory(userId: string) {
    return this.progressionDao.listRewardHistory(userId);
  }

  equipCosmetic(userId: string, cosmeticId: string) {
    const profile = this.progressionDao.getProfile(userId);
    if (!profile.unlockedCosmetics.includes(cosmeticId)) {
      throw new BadRequestException(`Cosmetic ${cosmeticId} is locked`);
    }

    const unlockable = this.progressionDao.unlockables.find((item) => item.id === cosmeticId) ?? null;
    if (!unlockable) {
      throw new BadRequestException(`Cosmetic ${cosmeticId} is unknown`);
    }

    const next = this.progressionDao.updateProfile(userId, (current) => {
      const equipped = current.equippedCosmetics.filter((item) => {
        const currentUnlockable = this.progressionDao.unlockables.find((unlock) => unlock.id === item);
        return currentUnlockable?.type !== unlockable.type;
      });
      return {
        ...current,
        equippedCosmetics: [...new Set([...equipped, cosmeticId])],
        updatedAt: new Date().toISOString()
      };
    });

    return {
      profile: next,
      milestonePreview: this.getMilestonePreview(next),
      unlockables: this.progressionDao.unlockables
    };
  }

  getShareCard(userId: string): ShareProgressCardPayload {
    const taskFacts = this.analyticsInsightsDao.listTaskCompletionFacts(userId);
    const focusFacts = this.analyticsInsightsDao.listFocusSessionCompletionFacts(userId);
    const activeDates = new Set<string>();
    for (const fact of taskFacts) {
      if (isWithinLastSevenDays(fact.completedAt)) {
        activeDates.add(fact.completedDate);
      }
    }
    for (const fact of focusFacts) {
      if (isWithinLastSevenDays(fact.endedAt)) {
        activeDates.add(fact.completedDate);
      }
    }
    return this.progressionDao.buildSharePayload(userId, activeDates.size);
  }

  private handleTaskUpdated(task: TaskRecord) {
    if (!task.completed || !task.completedAt) {
      return;
    }

    const sourceKey = `task:${task.id}:${task.completedAt}`;
    if (this.progressionDao.hasProcessedSource(task.userId, sourceKey)) {
      return;
    }

    const fact: TaskCompletionFact = {
      taskId: task.id,
      title: task.title,
      completedAt: task.completedAt,
      completedDate: task.completedAt.slice(0, 10),
      priority: task.priority,
      resistance: task.resistance,
      energyLevel: task.energyLevel,
      dueDate: task.dueDate,
      overdueAtCompletion: Boolean(task.dueDate && task.dueDate.slice(0, 10) < task.completedAt.slice(0, 10)),
      listId: task.listId,
      sectionId: task.sectionId,
      parentTaskId: task.parentTaskId
    };

    const xpGranted = computeTaskCompletionXp({
      priority: task.priority,
      resistance: task.resistance,
      overdueAtCompletion: fact.overdueAtCompletion
    });
    const explanationText = buildTaskCompletionExplanation({
      priority: task.priority,
      resistance: task.resistance,
      overdueAtCompletion: fact.overdueAtCompletion
    });
    this.progressionDao.markProcessedSource(task.userId, sourceKey);
    this.applyReward(task.userId, {
      id: `reward-task-${task.id}`,
      userId: task.userId,
      source: "TASK_COMPLETION",
      sourceId: task.id,
      xpGranted,
      softCurrencyGranted: null,
      timestamp: fact.completedAt,
      explanationText,
      thresholdCrossed: null
    });
  }

  private handleFocusEnded(session: FocusSession) {
    if (session.state !== "completed" || !session.endedAt) {
      return;
    }

    const sourceKey = `focus:${session.id}:${session.endedAt}`;
    if (this.progressionDao.hasProcessedSource(session.userId, sourceKey)) {
      return;
    }

    const xpGranted = computeFocusSessionXp({
      loggedMinutes: session.loggedMinutes,
      extraMinutes: session.extraMinutes
    });
    const explanationText = buildFocusSessionExplanation({
      loggedMinutes: session.loggedMinutes,
      extraMinutes: session.extraMinutes
    });
    this.progressionDao.markProcessedSource(session.userId, sourceKey);
    this.applyReward(session.userId, {
      id: `reward-focus-${session.id}`,
      userId: session.userId,
      source: "FOCUS_SESSION_COMPLETION",
      sourceId: session.id,
      xpGranted,
      softCurrencyGranted: null,
      timestamp: session.endedAt,
      explanationText,
      thresholdCrossed: null
    });
  }

  private applyReward(userId: string, rewardEvent: RewardEvent) {
    const before = this.progressionDao.getProfile(userId);
    const nextTotalXp = before.totalXp + rewardEvent.xpGranted;
    const nextLevel = getLevelForXp(nextTotalXp);
    const newUnlocks = this.progressionDao.unlockables
      .filter((unlockable) => unlockable.unlockThreshold <= nextTotalXp)
      .map((unlockable) => unlockable.id)
      .filter((unlockId) => !before.unlockedCosmetics.includes(unlockId));

    const thresholdCrossed =
      getNextLevelXp(before.totalXp) <= nextTotalXp
        ? getNextLevelXp(before.totalXp)
        : null;

    const nextProfile = this.progressionDao.updateProfile(userId, (current) => ({
      ...current,
      level: nextLevel,
      totalXp: nextTotalXp,
      unlockedCosmetics: [...new Set([...current.unlockedCosmetics, ...newUnlocks])],
      equippedCosmetics:
        current.equippedCosmetics.length === 0 && newUnlocks.length > 0
          ? [newUnlocks[0]!, ...current.equippedCosmetics]
          : current.equippedCosmetics,
      updatedAt: rewardEvent.timestamp
    }));

    const storedReward: RewardEvent = {
      ...rewardEvent,
      thresholdCrossed
    };
    this.progressionDao.pushRewardEvent(userId, storedReward);
    this.progressionEventBus.emitUpdated(nextProfile, storedReward);

    if (nextProfile.level > before.level) {
      this.progressionEventBus.emitLevelUp(nextProfile);
    }

    for (const unlockId of newUnlocks) {
      const unlockable = this.progressionDao.unlockables.find((item) => item.id === unlockId);
      if (unlockable) {
        this.progressionEventBus.emitUnlockEarned(unlockable);
      }
    }
  }

  private getMilestonePreview(profile: ProgressionProfile): MilestonePreview {
    const nextLevelXp = getNextLevelXp(profile.totalXp);
    const nextUnlock =
      this.progressionDao.unlockables.find((unlockable) => !profile.unlockedCosmetics.includes(unlockable.id)) ?? null;
    return {
      nextLevel: getLevelForXp(nextLevelXp),
      xpRemaining: Math.max(0, nextLevelXp - profile.totalXp),
      nextUnlock
    };
  }
}

function isWithinLastSevenDays(value: string) {
  const end = new Date().getTime();
  const start = end - 6 * 24 * 60 * 60 * 1000;
  const current = new Date(value).getTime();
  return current >= start && current <= end;
}
