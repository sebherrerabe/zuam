import { z } from "zod";

export const seedGoogleCalendarSourceInputSchema = z.object({
  calendars: z.array(
    z.object({
      id: z.string().min(1),
      summary: z.string().min(1),
      accessRole: z.enum(["freeBusyReader", "reader", "writer", "owner"]),
      hidden: z.boolean().optional(),
      deleted: z.boolean().optional(),
      primary: z.boolean().optional()
    })
  ),
  busyByCalendarId: z.record(
    z.string(),
    z.object({
      busy: z.array(
        z.object({
          start: z.string().datetime(),
          end: z.string().datetime()
        })
      ),
      errors: z.array(z.string().min(1)).optional()
    })
  ),
  planningWindowStart: z.string().datetime(),
  planningWindowEnd: z.string().datetime(),
  fetchedAt: z.string().datetime().optional(),
  freshnessTtlMinutes: z.number().int().positive().optional(),
  nextSyncToken: z.string().nullable().optional()
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
