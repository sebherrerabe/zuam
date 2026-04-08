import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";

import type { GoogleCalendarContextSnapshot, ScheduleSuggestion } from "./types";

@Injectable()
export class GoogleCalendarContextEventBus extends EventEmitter {
  emitRefreshed(snapshot: GoogleCalendarContextSnapshot) {
    this.emit("calendar:refreshed", snapshot);
  }

  emitSuggested(suggestions: ScheduleSuggestion[]) {
    this.emit("schedule:suggested", suggestions);
  }
}
