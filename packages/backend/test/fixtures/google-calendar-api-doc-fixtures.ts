import type { SeedGoogleCalendarSourceInput } from "../../src/modules/google-calendar-context/dto";
import type {
  GoogleCalendarApiCalendarListResponse,
  GoogleCalendarApiFreeBusyResponse
} from "../../src/modules/google-calendar-context/google-calendar-api-adapter";

// These fixtures intentionally mirror the raw Calendar API response envelopes documented at:
// - https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list
// - https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query

export const googleCalendarListDocFixture: GoogleCalendarApiCalendarListResponse = {
  kind: "calendar#calendarList",
  etag: "\"calendar-list-etag\"",
  nextSyncToken: "calendar-sync-token-1",
  items: [
    {
      kind: "calendar#calendarListEntry",
      etag: "\"calendar-list-entry-etag-1\"",
      id: "work",
      summary: "Work",
      accessRole: "reader",
      primary: true
    },
    {
      kind: "calendar#calendarListEntry",
      etag: "\"calendar-list-entry-etag-2\"",
      id: "personal",
      summary: "Personal",
      accessRole: "freeBusyReader",
      hidden: true
    },
    {
      kind: "calendar#calendarListEntry",
      etag: "\"calendar-list-entry-etag-3\"",
      id: "archived",
      summary: "Archived",
      accessRole: "owner",
      deleted: true
    }
  ]
};

export const googleFreeBusyDocFixture: GoogleCalendarApiFreeBusyResponse = {
  kind: "calendar#freeBusy",
  timeMin: "2026-04-07T09:00:00.000Z",
  timeMax: "2026-04-07T17:00:00.000Z",
  groups: {
    planning: {
      calendars: ["work"]
    }
  },
  calendars: {
    work: {
      busy: [
        {
          start: "2026-04-07T10:00:00.000Z",
          end: "2026-04-07T11:00:00.000Z"
        },
        {
          start: "2026-04-07T13:00:00.000Z",
          end: "2026-04-07T14:00:00.000Z"
        }
      ]
    }
  }
};

export const googleCalendarSeedSourceDocFixture: SeedGoogleCalendarSourceInput = {
  calendarList: googleCalendarListDocFixture,
  freeBusy: googleFreeBusyDocFixture,
  fetchedAt: "2026-04-07T09:05:00.000Z",
  freshnessTtlMinutes: 15
};

export const googleCalendarPartialErrorSeedSourceDocFixture: SeedGoogleCalendarSourceInput = {
  calendarList: {
    ...googleCalendarListDocFixture,
    items: [
      {
        kind: "calendar#calendarListEntry",
        etag: "\"calendar-list-entry-etag-1\"",
        id: "work",
        summary: "Work",
        accessRole: "reader",
        primary: true
      },
      {
        kind: "calendar#calendarListEntry",
        etag: "\"calendar-list-entry-etag-4\"",
        id: "team",
        summary: "Team",
        accessRole: "freeBusyReader"
      }
    ]
  },
  freeBusy: {
    ...googleFreeBusyDocFixture,
    calendars: {
      ...googleFreeBusyDocFixture.calendars,
      work: {
        busy: [
          {
            start: "2026-04-07T10:00:00.000Z",
            end: "2026-04-07T11:00:00.000Z"
          }
        ]
      },
      team: {
        errors: [
          {
            domain: "global",
            reason: "internalError"
          }
        ],
        busy: []
      }
    }
  },
  fetchedAt: "2026-04-07T09:05:00.000Z",
  freshnessTtlMinutes: 15
};
