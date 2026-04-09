import { BadRequestException, Injectable } from "@nestjs/common";

import { TasksDao } from "../tasks/dao";
import { GoogleCalendarContextDao } from "./dao";
import { GoogleCalendarContextEventBus } from "./events";
import { normalizeGoogleCalendarSeedSource } from "./google-calendar-api-adapter";
import {
  calendarRefreshInputSchema,
  calendarSuggestionInputSchema,
  seedGoogleCalendarSourceInputSchema
} from "./dto";
import type {
  BusyBlock,
  CalendarAccessRole,
  FreeWindow,
  GoogleCalendarContextSnapshot,
  RawGoogleCalendarSource,
  ScheduleSuggestion
} from "./types";

const DEFAULT_STALE_AFTER_MINUTES = 15;

@Injectable()
export class GoogleCalendarContextService {
  constructor(
    private readonly tasksDao: TasksDao,
    private readonly dao: GoogleCalendarContextDao,
    private readonly eventBus: GoogleCalendarContextEventBus
  ) {}

  seedRawSource(userId: string, input: unknown) {
    const parsed = seedGoogleCalendarSourceInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid Google Calendar source payload");
    }

    this.dao.seedRawSource(userId, normalizeGoogleCalendarSeedSource(parsed.data));
    return this.refreshCalendarContext(userId, { at: parsed.data.fetchedAt });
  }

  refreshCalendarContext(userId: string, input: unknown = {}) {
    const parsed = calendarRefreshInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid Google Calendar refresh payload");
    }

    const rawSource = this.requireRawSource(userId);
    const now = parsed.data.at ?? new Date().toISOString();
    const snapshot = this.normalizeSource(userId, rawSource, now);
    this.dao.storeSnapshot(userId, snapshot);
    this.eventBus.emitRefreshed(snapshot);
    return snapshot;
  }

  getCalendarContext(userId: string, input: unknown = {}) {
    const parsed = calendarRefreshInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid Google Calendar refresh payload");
    }

    const current = this.dao.getSnapshot(userId);
    const now = parsed.data.at ?? new Date().toISOString();

    if (!current || current.stale || this.isExpired(current, now)) {
      return this.refreshCalendarContext(userId, { at: now });
    }

    return current;
  }

  suggestSlots(userId: string, input: unknown) {
    const parsed = calendarSuggestionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid calendar suggestion payload");
    }

    const task = this.tasksDao.getById(userId, parsed.data.taskId);
    const snapshot = this.getCalendarContext(userId, { at: parsed.data.at });
    const suggestions = this.buildSuggestions(snapshot, {
      taskId: parsed.data.taskId,
      taskTitle: task.title,
      durationMinutes: parsed.data.durationMinutes,
      windowStart: parsed.data.windowStart,
      windowEnd: parsed.data.windowEnd,
      limit: parsed.data.limit
    });

    this.dao.storeSuggestions(userId, suggestions);
    this.eventBus.emitSuggested(suggestions);
    return suggestions;
  }

  private normalizeSource(userId: string, rawSource: RawGoogleCalendarSource, now: string): GoogleCalendarContextSnapshot {
    const calendars = rawSource.calendars.filter((calendar) => !calendar.deleted && !calendar.hidden);
    const busyBlocks: BusyBlock[] = [];
    const partialErrors: string[] = [];

    for (const calendar of calendars) {
      const freeBusy = rawSource.busyByCalendarId[calendar.id];
      if (!freeBusy) {
        partialErrors.push(`Missing free/busy data for ${calendar.id}`);
        continue;
      }

      if (freeBusy.errors?.length) {
        partialErrors.push(...freeBusy.errors.map((error) => `${calendar.id}: ${error}`));
      }

      for (const busy of freeBusy.busy) {
        if (!busy.start || !busy.end) {
          continue;
        }

        const start = new Date(busy.start);
        const end = new Date(busy.end);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
          continue;
        }

        busyBlocks.push({
          id: `busy-${calendar.id}-${busyBlocks.length + 1}`,
          calendarId: calendar.id,
          calendarSummary: calendar.summary,
          start: busy.start,
          end: busy.end,
          confidence: this.resolveConfidence(calendar.accessRole, freeBusy.errors?.length ?? 0)
        });
      }
    }

    const mergedBusy = this.mergeBusyBlocks(busyBlocks);
    const freeWindows = this.deriveFreeWindows(mergedBusy, rawSource.planningWindowStart, rawSource.planningWindowEnd);
    const fetchedAt = rawSource.fetchedAt ?? now;
    const ttl = rawSource.freshnessTtlMinutes ?? DEFAULT_STALE_AFTER_MINUTES;
    const expiresAt = new Date(new Date(fetchedAt).getTime() + ttl * 60_000).toISOString();

    return {
      userId,
      lastRefreshedAt: fetchedAt,
      expiresAt,
      stale: false,
      calendars,
      busyBlocks: mergedBusy,
      freeWindows,
      partialErrors,
      planningWindowStart: rawSource.planningWindowStart,
      planningWindowEnd: rawSource.planningWindowEnd,
      nextSyncToken: rawSource.nextSyncToken ?? null
    };
  }

  private buildSuggestions(
    snapshot: GoogleCalendarContextSnapshot,
    input: {
      taskId: string;
      taskTitle: string;
      durationMinutes: number;
      windowStart: string;
      windowEnd: string;
      limit: number;
    }
  ) {
    const freeWindows = this.deriveFreeWindows(snapshot.busyBlocks, input.windowStart, input.windowEnd);
    const suggestions: ScheduleSuggestion[] = [];

    for (const freeWindow of freeWindows) {
      if (freeWindow.durationMinutes < input.durationMinutes) {
        continue;
      }

      const blockingBusyWindows = this.findBlockingBusyWindows(snapshot.busyBlocks, freeWindow);
      const end = new Date(new Date(freeWindow.start).getTime() + input.durationMinutes * 60_000).toISOString();
      suggestions.push({
        taskId: input.taskId,
        taskTitle: input.taskTitle,
        start: freeWindow.start,
        end,
        durationMinutes: input.durationMinutes,
        rationale: this.buildRationale(input.taskTitle, freeWindow, blockingBusyWindows),
        blockingBusyWindows
      });

      if (suggestions.length >= input.limit) {
        break;
      }
    }

    return suggestions;
  }

  private buildRationale(taskTitle: string, freeWindow: FreeWindow, blockers: BusyBlock[]) {
    if (blockers.length === 0) {
      return `Best next slot for ${taskTitle} starts at ${freeWindow.start} because it is the first free window in the requested range.`;
    }

    const blockerSummary = blockers.map((blocker) => `${blocker.calendarSummary} ${blocker.start} to ${blocker.end}`).join("; ");
    return `Best next slot for ${taskTitle} starts at ${freeWindow.start} because it fits between busy blocks: ${blockerSummary}.`;
  }

  private findBlockingBusyWindows(busyBlocks: BusyBlock[], freeWindow: FreeWindow) {
    const start = new Date(freeWindow.start).getTime();
    const end = new Date(freeWindow.end).getTime();
    const previous = [...busyBlocks]
      .filter((block) => new Date(block.end).getTime() <= start)
      .sort((left, right) => new Date(right.end).getTime() - new Date(left.end).getTime())[0];
    const next = [...busyBlocks]
      .filter((block) => new Date(block.start).getTime() >= end)
      .sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime())[0];

    return [previous, next].filter((block): block is BusyBlock => Boolean(block));
  }

  private deriveFreeWindows(busyBlocks: BusyBlock[], windowStart: string, windowEnd: string) {
    const start = new Date(windowStart).getTime();
    const end = new Date(windowEnd).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      throw new BadRequestException("Calendar window must be a valid increasing ISO range");
    }

    const merged = this.mergeBusyBlocks(busyBlocks)
      .map((block) => ({ start: new Date(block.start).getTime(), end: new Date(block.end).getTime() }))
      .sort((left, right) => left.start - right.start);

    const windows: FreeWindow[] = [];
    let cursor = start;

    for (const busy of merged) {
      if (busy.start > cursor) {
        const freeEnd = Math.min(busy.start, end);
        if (freeEnd > cursor) {
          windows.push({
            start: new Date(cursor).toISOString(),
            end: new Date(freeEnd).toISOString(),
            durationMinutes: Math.round((freeEnd - cursor) / 60_000)
          });
        }
      }

      cursor = Math.max(cursor, busy.end);
      if (cursor >= end) {
        break;
      }
    }

    if (cursor < end) {
      windows.push({
        start: new Date(cursor).toISOString(),
        end: new Date(end).toISOString(),
        durationMinutes: Math.round((end - cursor) / 60_000)
      });
    }

    return windows;
  }

  private mergeBusyBlocks(busyBlocks: BusyBlock[]) {
    const sorted = [...busyBlocks].sort((left, right) => left.start.localeCompare(right.start));
    const merged: BusyBlock[] = [];

    for (const block of sorted) {
      const previous = merged[merged.length - 1];
      if (!previous) {
        merged.push(block);
        continue;
      }

      const previousEnd = new Date(previous.end).getTime();
      const currentStart = new Date(block.start).getTime();
      if (currentStart <= previousEnd) {
        merged[merged.length - 1] = {
          ...previous,
          end: new Date(Math.max(previousEnd, new Date(block.end).getTime())).toISOString(),
          confidence: this.mergeConfidence(previous.confidence, block.confidence)
        };
        continue;
      }

      merged.push(block);
    }

    return merged;
  }

  private resolveConfidence(role: CalendarAccessRole, errorCount: number) {
    if (errorCount > 0) {
      return "low" as const;
    }

    switch (role) {
      case "owner":
      case "writer":
        return "high" as const;
      case "reader":
        return "medium" as const;
      case "freeBusyReader":
      default:
        return "low" as const;
    }
  }

  private mergeConfidence(left: BusyBlock["confidence"], right: BusyBlock["confidence"]) {
    const order = { low: 0, medium: 1, high: 2 };
    return order[right] > order[left] ? right : left;
  }

  private isExpired(snapshot: GoogleCalendarContextSnapshot, now: string) {
    if (!snapshot.expiresAt) {
      return true;
    }

    const expiresAt = new Date(snapshot.expiresAt).getTime();
    const at = new Date(now).getTime();
    return Number.isNaN(expiresAt) || Number.isNaN(at) || at >= expiresAt;
  }

  private requireRawSource(userId: string) {
    const rawSource = this.dao.getRawSource(userId);
    if (!rawSource) {
      throw new BadRequestException("Google Calendar source has not been seeded");
    }
    return rawSource;
  }
}
