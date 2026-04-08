import { Injectable } from "@nestjs/common";

import type {
  GoogleCalendarContextSnapshot,
  RawGoogleCalendarSource,
  ScheduleSuggestion
} from "./types";

type StoredCalendarState = {
  rawSource: RawGoogleCalendarSource | null;
  snapshot: GoogleCalendarContextSnapshot | null;
  suggestions: ScheduleSuggestion[];
};

@Injectable()
export class GoogleCalendarContextDao {
  private readonly users = new Map<string, StoredCalendarState>();

  seedRawSource(userId: string, input: RawGoogleCalendarSource) {
    this.ensureUser(userId).rawSource = input;
  }

  getRawSource(userId: string) {
    return this.ensureUser(userId).rawSource;
  }

  getSnapshot(userId: string) {
    return this.ensureUser(userId).snapshot;
  }

  storeSnapshot(userId: string, snapshot: GoogleCalendarContextSnapshot) {
    this.ensureUser(userId).snapshot = snapshot;
    return snapshot;
  }

  storeSuggestions(userId: string, suggestions: ScheduleSuggestion[]) {
    this.ensureUser(userId).suggestions = suggestions;
    return suggestions;
  }

  listSuggestions(userId: string) {
    return [...this.ensureUser(userId).suggestions];
  }

  private ensureUser(userId: string) {
    let state = this.users.get(userId);
    if (!state) {
      state = {
        rawSource: null,
        snapshot: null,
        suggestions: []
      };
      this.users.set(userId, state);
    }
    return state;
  }
}
