import { z } from "zod";

import { calendarAccessRoles } from "./types";

const calendarListEntrySchema = z.object({
  kind: z.literal("calendar#calendarListEntry").optional(),
  etag: z.string().optional(),
  id: z.string().min(1),
  summary: z.string().min(1),
  accessRole: z.enum(calendarAccessRoles),
  hidden: z.boolean().optional(),
  deleted: z.boolean().optional(),
  primary: z.boolean().optional()
});

const calendarListResponseSchema = z.object({
  kind: z.literal("calendar#calendarList").optional(),
  etag: z.string().optional(),
  nextPageToken: z.string().optional(),
  nextSyncToken: z.string().optional(),
  items: z.array(calendarListEntrySchema).default([])
});

const freeBusyCalendarErrorSchema = z.object({
  domain: z.string().min(1),
  reason: z.string().min(1)
});

const freeBusyCalendarEntrySchema = z.object({
  errors: z.array(freeBusyCalendarErrorSchema).optional(),
  busy: z.array(
    z.object({
      start: z.string().datetime(),
      end: z.string().datetime()
    })
  ).default([])
});

const freeBusyResponseSchema = z.object({
  kind: z.literal("calendar#freeBusy").optional(),
  timeMin: z.string().datetime(),
  timeMax: z.string().datetime(),
  groups: z.record(
    z.string(),
    z.object({
      errors: z.array(freeBusyCalendarErrorSchema).optional(),
      calendars: z.array(z.string().min(1)).optional()
    })
  ).optional(),
  calendars: z.record(z.string(), freeBusyCalendarEntrySchema).default({})
});

export const seedGoogleCalendarSourceInputSchema = z.object({
  calendarList: calendarListResponseSchema,
  freeBusy: freeBusyResponseSchema,
  fetchedAt: z.string().datetime().optional(),
  freshnessTtlMinutes: z.number().int().positive().optional()
});

export const calendarSuggestionInputSchema = z.object({
  taskId: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  limit: z.number().int().positive().max(10).default(3),
  at: z.string().datetime().optional()
});

export const calendarRefreshInputSchema = z.object({
  at: z.string().datetime().optional()
});

export type SeedGoogleCalendarSourceInput = z.infer<typeof seedGoogleCalendarSourceInputSchema>;
export type CalendarSuggestionInput = z.infer<typeof calendarSuggestionInputSchema>;
export type CalendarRefreshInput = z.infer<typeof calendarRefreshInputSchema>;
