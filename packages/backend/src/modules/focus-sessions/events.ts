import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";

import type { FocusSession, FocusSessionSnapshot } from "./types";

@Injectable()
export class FocusSessionsEventBus extends EventEmitter {
  emitStarted(session: FocusSession) {
    this.emit("focus:start", session);
  }

  emitPaused(session: FocusSession) {
    this.emit("focus:pause", session);
  }

  emitEnded(session: FocusSession) {
    this.emit("focus:end", session);
  }

  emitBreakStarted(session: FocusSession) {
    this.emit("focus:break-start", session);
  }

  emitBreakEnded(session: FocusSession) {
    this.emit("focus:break-end", session);
  }

  emitTick(session: FocusSession) {
    this.emit("focus:tick", session);
  }

  emitSync(snapshot: FocusSessionSnapshot) {
    this.emit("focus:sync", snapshot);
  }
}
