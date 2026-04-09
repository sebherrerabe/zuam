import type {
  RawGoogleCalendarBusySource,
  RawGoogleCalendarSource
} from "./types";
import type { SeedGoogleCalendarSourceInput } from "./dto";

export type GoogleCalendarApiCalendarListEntry = {
  kind?: "calendar#calendarListEntry";
  etag?: string;
  id: string;
  summary: string;
  accessRole: "freeBusyReader" | "reader" | "writer" | "owner";
  hidden?: boolean;
  deleted?: boolean;
  primary?: boolean;
};

export type GoogleCalendarApiCalendarListResponse = {
  kind?: "calendar#calendarList";
  etag?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: GoogleCalendarApiCalendarListEntry[];
};

export type GoogleCalendarApiFreeBusyError = {
  domain: string;
  reason: string;
};

export type GoogleCalendarApiFreeBusyCalendarEntry = {
  errors?: GoogleCalendarApiFreeBusyError[];
  busy: Array<{
    start: string;
    end: string;
  }>;
};

export type GoogleCalendarApiFreeBusyResponse = {
  kind?: "calendar#freeBusy";
  timeMin: string;
  timeMax: string;
  groups?: Record<
    string,
    {
      errors?: GoogleCalendarApiFreeBusyError[];
      calendars?: string[];
    }
  >;
  calendars: Record<string, GoogleCalendarApiFreeBusyCalendarEntry>;
};

export function normalizeGoogleCalendarSeedSource(input: SeedGoogleCalendarSourceInput): RawGoogleCalendarSource {
  return {
    calendars: [...input.calendarList.items],
    busyByCalendarId: normalizeFreeBusyCalendars(input.freeBusy.calendars ?? {}),
    planningWindowStart: input.freeBusy.timeMin,
    planningWindowEnd: input.freeBusy.timeMax,
    fetchedAt: input.fetchedAt,
    freshnessTtlMinutes: input.freshnessTtlMinutes,
    nextSyncToken: input.calendarList.nextSyncToken ?? null
  };
}

function normalizeFreeBusyCalendars(
  calendars: Record<string, GoogleCalendarApiFreeBusyCalendarEntry>
): Record<string, RawGoogleCalendarBusySource> {
  return Object.fromEntries(
    Object.entries(calendars).map(([calendarId, entry]) => [
      calendarId,
      {
        busy: (entry.busy ?? []).map((busy) => ({
          start: busy.start,
          end: busy.end
        })),
        errors: entry.errors?.map((error) => formatCalendarError(error))
      }
    ])
  );
}

function formatCalendarError(error: GoogleCalendarApiFreeBusyError) {
  return error.reason || error.domain;
}
