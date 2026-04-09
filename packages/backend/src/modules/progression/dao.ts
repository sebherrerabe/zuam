import { Injectable } from "@nestjs/common";
import type {
  ProgressionProfile,
  RewardEvent,
  ShareProgressCardPayload,
  Unlockable
} from "@zuam/shared";
import { getNextLevelXp, getLevelForXp } from "@zuam/shared";

type StoredProgressionState = {
  profile: ProgressionProfile;
  rewardHistory: RewardEvent[];
  processedSources: Set<string>;
};

@Injectable()
export class ProgressionDao {
  private readonly users = new Map<string, StoredProgressionState>();

  readonly unlockables: Unlockable[] = [
    { id: "cosmetic-flame-cloak", type: "cloak", unlockThreshold: 720, visualAssetRef: "atlas://cloak/flame", displayName: "Flame Cloak" },
    { id: "cosmetic-wayward-cap", type: "hat", unlockThreshold: 1240, visualAssetRef: "atlas://hat/wayward-cap", displayName: "Wayward Cap" },
    { id: "cosmetic-suntrail-cape", type: "cloak", unlockThreshold: 1500, visualAssetRef: "atlas://cloak/suntrail-cape", displayName: "Suntrail Cape" }
  ];

  getProfile(userId: string): ProgressionProfile {
    const profile = this.ensureUser(userId).profile;
    return {
      ...profile,
      equippedCosmetics: [...profile.equippedCosmetics],
      unlockedCosmetics: [...profile.unlockedCosmetics]
    };
  }

  listRewardHistory(userId: string): RewardEvent[] {
    return this.ensureUser(userId).rewardHistory.map((reward) => ({ ...reward }));
  }

  updateProfile(userId: string, updater: (profile: ProgressionProfile) => ProgressionProfile) {
    const state = this.ensureUser(userId);
    state.profile = updater(state.profile);
    return { ...state.profile };
  }

  pushRewardEvent(userId: string, event: RewardEvent) {
    const state = this.ensureUser(userId);
    state.rewardHistory = [event, ...state.rewardHistory];
  }

  hasProcessedSource(userId: string, sourceKey: string) {
    return this.ensureUser(userId).processedSources.has(sourceKey);
  }

  markProcessedSource(userId: string, sourceKey: string) {
    this.ensureUser(userId).processedSources.add(sourceKey);
  }

  buildSharePayload(userId: string, weeklyActiveDays: number): ShareProgressCardPayload {
    const profile = this.getProfile(userId);
    const nextLevelXp = getNextLevelXp(profile.totalXp);
    return {
      userName: "Seb H.",
      level: profile.level,
      totalXp: profile.totalXp,
      nextLevelXp,
      archetype: profile.currentAvatarArchetype,
      equippedCosmetics: profile.equippedCosmetics,
      unlockedCosmetics: profile.unlockedCosmetics,
      weeklyActiveDays,
      shareMessage: "Progress is built one day at a time."
    };
  }

  private ensureUser(userId: string): StoredProgressionState {
    let state = this.users.get(userId);
    if (!state) {
      state = {
        profile: {
          userId,
          level: getLevelForXp(0),
          totalXp: 0,
          currentAvatarArchetype: "Pathfinder",
          equippedCosmetics: [],
          unlockedCosmetics: [],
          updatedAt: new Date().toISOString()
        },
        rewardHistory: [],
        processedSources: new Set()
      };
      this.users.set(userId, state);
    }
    return state;
  }
}
