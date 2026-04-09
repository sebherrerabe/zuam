import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";

import type { ProgressionProfile, RewardEvent, Unlockable } from "@zuam/shared";

@Injectable()
export class ProgressionEventBus extends EventEmitter {
  emitUpdated(profile: ProgressionProfile, rewardEvent: RewardEvent) {
    this.emit("progression:updated", { profile, rewardEvent });
  }

  emitLevelUp(profile: ProgressionProfile) {
    this.emit("progression:level-up", profile);
  }

  emitUnlockEarned(unlockable: Unlockable) {
    this.emit("progression:unlock-earned", unlockable);
  }
}
