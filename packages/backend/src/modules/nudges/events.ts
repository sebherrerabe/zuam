import { EventEmitter } from "node:events";

import type { NudgeEvent } from "@zuam/shared/nudges";

export class NudgesEventBus extends EventEmitter {
  emitTriggered(event: NudgeEvent) {
    this.emit("nudge:trigger", event);
  }

  emitSnoozed(event: NudgeEvent) {
    this.emit("nudge:snooze", event);
  }

  emitPostponed(event: NudgeEvent) {
    this.emit("nudge:postpone", event);
  }

  emitAcknowledged(event: NudgeEvent) {
    this.emit("nudge:acknowledge", event);
  }
}

